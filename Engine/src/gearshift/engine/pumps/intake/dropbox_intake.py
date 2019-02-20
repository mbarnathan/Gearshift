import asyncio
import hmac
import sys
from _blake2 import blake2b
from _sha256 import sha256
from collections import namedtuple, OrderedDict
from functools import partial

import dropbox
import firebase_admin
from dropbox import stone_serializers
from dropbox.files import PhotoMetadata, DeletedMetadata, Metadata_validator
from evanesca.api.api import api, endpoint
from evanesca.api.api_set import ApiSet
from evanesca.common.exceptions.argument_exceptions import check_true
from evanesca.common.logging.elog import L
from firebase_admin import firestore, credentials
from flask import Response, request, abort, json, jsonify
from pydash import pluck

APP_SECRET = bytearray("h0uy9dd01xzl5k8", "utf-8")
ACCOUNT_TOKEN = "EdTy1lJN1oIAAAAAAAAAkAqpN88_8VcZ2EgdRNHDV-9jqPbQjbNvO-sUM9537YqY"
LIMIT_PER_CALL = 500
LEASE_EXPIRY_MS = 60000
ROOT = ""
FIREBASE_PROJECT = "gearshift"


# noinspection PyMethodMayBeStatic
@api("/dropbox")
class Dropbox(ApiSet):
    SALT = "h*rRcBsU0Cd`e*~9"

    def __init__(self, *args, **kwargs):
        super(self.__class__, self).__init__(*args, **kwargs)
        self.last_cursor = None

    @staticmethod
    @endpoint.before_app_first_request
    def setup():
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
            abort(403)

        accounts = json.loads(await request.data)['list_folder']['accounts']
        user_futures = [asyncio.create_task(self.process_user(account)) for account in accounts]
        result = await asyncio.gather(*user_futures)
        return jsonify(result)

    @staticmethod
    async def verify_request(_request):
        signature = _request.headers.get('X-Dropbox-Signature')
        return hmac.compare_digest(signature,
                                   hmac.new(APP_SECRET, await _request.data, sha256).hexdigest())

    async def process_user(self, dropbox_account):
        check_true(dropbox_account)
        # encrypted_account = self.encrypt(dropbox_account)

        firestore_client = firestore.client()

        async def update_user_files(_user_path):
            user_file_path = _user_path.collection("files")
            user_data = _user_path.get()

            # Persist files to Firestore. A FS trigger function will add them to the search index.
            async for file in await self.fetch_changes(user_data):
                file = await file
                file_id = file.get("id")
                if file_id:
                    file_refs = [user_file_path.document(file_id)]
                else:
                    match_path = file.get("path_display")
                    file_refs = user_file_path.where("path_display", "==", match_path).get()
                    file_refs = pluck(file_refs, "reference")

                batch = firestore_client.batch()
                if file.get(".tag") == "deleted":
                    # This file was just deleted from Dropbox; delete it from Firestore too.
                    for file_ref in file_refs:
                        batch.delete(file_ref)
                else:
                    sanitized = OrderedDict((k.replace(".", ""), v) for k, v in file.items())
                    for file_ref in file_refs:
                        batch.set(file_ref, sanitized)
                batch.commit()

        user_path = firestore_client \
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

    async def fetch_changes(self, last_snapshot):
        last_cursor = last_snapshot.to_dict()
        if not last_cursor and self.last_cursor:
            last_cursor = {"cursor": self.last_cursor}

        if last_cursor:
            last_cursor = last_cursor.get("cursor")
            file_obj = namedtuple("DropboxSnapshot", ["cursor", "has_more"])
            file_obj.cursor = last_cursor
            file_obj.has_more = True
        else:
            file_obj = None
        return self.visit_files(file_obj=file_obj)

    @staticmethod
    def encrypt(plaintext):
        return blake2b(salt=Dropbox.SALT).update(plaintext).hexdigest()

    async def visit_files(self, visitor=None, file_obj=None, loop=None):
        visitor = visitor or self.process_file
        loop = loop or asyncio.get_event_loop()

        # TODO: Create this elsewhere?
        dbx = dropbox.Dropbox(ACCOUNT_TOKEN)

        while True:
            # Dropbox doesn't have an async interface yet, so run the dbx calls in a thread pool.
            list_once = partial(self.list_once, dbx, file_obj=file_obj)
            file_obj = await loop.run_in_executor(None, list_once)

            if file_obj:
                self.last_cursor = file_obj.cursor or self.last_cursor
                for entry in file_obj.entries:
                    yield asyncio.create_task(visitor(entry))
            else:
                break

    def list_once(self, dbx, path=ROOT, limit=LIMIT_PER_CALL, file_obj=None):
        try:
            if file_obj:
                if not file_obj.has_more:
                    return []
                return dbx.files_list_folder_continue(file_obj.cursor)
            return dbx.files_list_folder(path=path, limit=limit,
                                         include_media_info=True, recursive=True)
        except dropbox.exceptions.ApiError as err:
            # No retry logic needed because Dropbox itself will retry a few requests.
            L.warning('Folder listing failed for', path, '-- assumed empty:', err)
            return None

    async def process_file(self, entry_stone):
        entry = stone_serializers.json_compat_obj_encode(Metadata_validator, entry_stone)
        try:
            metadata = entry_stone.media_info.get_metadata()
            if isinstance(metadata, PhotoMetadata):
                return await self.process_photo(entry)
            elif isinstance(metadata, DeletedMetadata):
                return await self.process_deleted(entry)
        except AttributeError:
            return entry

    async def process_photo(self, entry):
        entry["type"] = "image"

        # TODO(mb): schedule a tagging job here.
        return entry

    async def process_deleted(self, entry):
        entry["deleted"] = True
        return entry


async def main(argv):
    files = await asyncio.gather(*[file async for file in Dropbox().visit_files()])
    print(files)
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main(sys.argv)))
