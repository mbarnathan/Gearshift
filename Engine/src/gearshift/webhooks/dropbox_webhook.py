import asyncio
import hmac
from _sha256 import sha256
from collections import OrderedDict

import firebase_admin
from evanesca.api.api import api, endpoint
from evanesca.api.api_set import ApiSet
from evanesca.common.exceptions.argument_exceptions import check_true
from evanesca.common.logging.elog import L
from firebase_admin import firestore, credentials
from flask import Response, request, abort, json, jsonify
from pydash import pluck

from gearshift.engine.pumps.intake.dropbox.client import DropboxClient

LEASE_EXPIRY_MS = 60000
FIREBASE_PROJECT = "gearshift"
APP_SECRET = bytearray("h0uy9dd01xzl5k8", "utf-8")


@api("/dropbox")
class Dropbox(ApiSet):

    @staticmethod
    @endpoint.before_app_first_request
    def setup():
        # TODO(mb): Move this out of this particular request.
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred, {'projectId': FIREBASE_PROJECT})

    @endpoint.route("/webhook", methods=["GET"], required_params=["challenge"])
    async def verify(self):
        """Respond to the webhook verification by echoing back the challenge parameter."""
        resp = Response(request.args.get('challenge'))
        resp.headers['Content-Type'] = 'text/plain'
        resp.headers['X-Content-Type-Options'] = 'nosniff'
        return resp

    @endpoint.route('/webhook', methods=['POST'])
    async def file_updated(self):
        if not await Dropbox.verify_request(request):
            L.auth(f"Signature validation failed on Dropbox webhook")
            abort(403, "This request could not be authenticated.")

        try:
            accounts = json.loads(await request.data)['list_folder']['accounts']
        except KeyError as e:
            L.auth(f"Invalid data in Dropbox webhook: {e}")
            abort(400, "Malformed JSON in webhook request.")

        storage = firestore.client()
        dbx_client = DropboxClient()
        user_futures = [asyncio.create_task(
            self.process_user(account, dbx_client, storage)) for account in accounts
        ]
        result = await asyncio.gather(*user_futures)
        return jsonify(result)

    @staticmethod
    async def verify_request(_request):
        """Verify that this request actually came from Dropbox by checking its signature."""
        signature = _request.headers.get('X-Dropbox-Signature')
        return hmac.compare_digest(
            signature, hmac.new(APP_SECRET, await _request.data, sha256).hexdigest())

    async def process_user(self, dropbox_account, dbx_client: DropboxClient, storage):
        """Processes user-level modification results from the Dropbox webhook's response.

        :param dropbox_account The Dropbox account ID of the user to update.
        :param dbx_client A Dropbox Client object.
        :param storage A storage layer to persist updates to.
        :returns A list of updated files.
        """
        check_true(dropbox_account)
        check_true(dbx_client)
        # encrypted_account = self.encrypt(dropbox_account)

        async def update_user_files(_user_path):
            user_file_path = _user_path.collection("files")
            user_data = _user_path.get()

            # Persist files to Firestore. A FS trigger function will add them to the search index.
            cursor = self.get_cursor(user_data)
            async for file in await dbx_client.visit_files(cursor=cursor):
                file = await file
                file_id = file.get("id")
                if file_id:
                    file_refs = [user_file_path.document(file_id)]
                else:
                    match_path = file.get("path_display")
                    file_refs = user_file_path.where("path_display", "==", match_path).get()
                    file_refs = pluck(file_refs, "reference")

                batch = storage.batch()
                if file.get(".tag") == "deleted":
                    # This file was just deleted from Dropbox; delete it from Firestore too.
                    for file_ref in file_refs:
                        batch.delete(file_ref)
                else:
                    sanitized = OrderedDict((k.replace(".", ""), v) for k, v in file.items())
                    for file_ref in file_refs:
                        batch.set(file_ref, sanitized)
                batch.commit()

        user_path = storage \
            .collection("services") \
            .document("dropbox") \
            .collection("users") \
            .document(dropbox_account)
        # .document(encrypted_account)

        await update_user_files(user_path)
        if self.last_cursor:
            user_path.set({"cursor": self.last_cursor}, merge=True)

        # Steps:
        # 1. Grab the last lease and cursor from Firestore
        # 2. Request changed files using the cursor.
        # 3. Update the lease and cursor.
        # 4. (Re)schedule the lease to index in the next batch.

    async def get_cursor(self, user_snapshot):
        db_user = user_snapshot.to_dict()
        if db_user:
            cursor = db_user.get("cursor")
            if cursor:
                return cursor
        return self.last_cursor
