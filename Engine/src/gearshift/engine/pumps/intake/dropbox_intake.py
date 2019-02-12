import asyncio
import hmac
import sys
from _blake2 import blake2b
from _sha256 import sha256
from functools import partial

import dropbox
from dropbox import stone_serializers
from dropbox.files import PhotoMetadata, DeletedMetadata, Metadata_validator
from evanesca.api.api import api, endpoint
from evanesca.api.api_set import ApiSet
from evanesca.common.exceptions.argument_exceptions import check_true
from firebase_admin import firestore
from flask import Response, request, abort, json

APP_SECRET = ""
ACCOUNT_TOKEN = "EdTy1lJN1oIAAAAAAAAAkAqpN88_8VcZ2EgdRNHDV-9jqPbQjbNvO-sUM9537YqY"
LIMIT_PER_CALL = 500
LEASE_EXPIRY_MS = 60000
ROOT = ""


@api("dropbox")
class Dropbox(ApiSet):
    SALT = "h*rRcBsU0Cd`e*~9"

    @staticmethod
    @endpoint.route("/verify", methods=["GET"], required_params=["challenge"])
    async def verify():
        """Respond to the webhook verification by echoing back the challenge parameter."""
        resp = Response(request.args.get('challenge'))
        resp.headers['Content-Type'] = 'text/plain'
        resp.headers['X-Content-Type-Options'] = 'nosniff'
        return resp

    @staticmethod
    @endpoint.route('/webhook', methods=['POST'])
    async def file_updated():
        if not Dropbox.verify_request(request):
            abort(403)

        accounts = json.loads(request.data)['list_folder']['accounts']
        user_futures = [asyncio.create_task(Dropbox.process_user(account)) for account in accounts]
        await asyncio.gather(*user_futures)

    @staticmethod
    def verify_request(_request):
        signature = _request.headers.get('X-Dropbox-Signature')
        return hmac.compare_digest(signature,
                                   hmac.new(APP_SECRET, request.data, sha256).hexdigest())

    @staticmethod
    async def process_user(dropbox_account):
        check_true(dropbox_account)
        # encrypted_account = Dropbox.encrypt(dropbox_account)
        firestore_client = firestore.client()

        @firestore.transactional
        async def update_user_files(transaction, _user_path):
            _user_file_path = _user_path.collection("files")
            user_data = _user_path.get(transaction=transaction)

            # Persist files to Firestore. A FS trigger function will add them to the search index.
            async for file in Dropbox.fetch_changes(user_data):
                file_id = file["id"]
                file_path = _user_path.document(file_id)
                if file.get("deleted", default=False):
                    # This file was just deleted from Dropbox; delete it from Firestore too.
                    transaction.delete(file_path)
                else:
                    transaction.update(file_path, file)

        user_path = firestore_client \
            .collection("services") \
            .document("dropbox") \
            .collection("users") \
            .document(dropbox_account)
            # .document(encrypted_account)

        await update_user_files(firestore_client.transaction(), user_path)

        # Steps:
        # 1. Grab the last lease and cursor from Firestore
        # 2. Request changed files using the cursor.
        # 3. Update the lease and cursor.
        # 4. (Re)schedule the lease to index in the next batch.

    @staticmethod
    async def fetch_changes(last_snapshot):
        last_lease = last_snapshot.to_dict()
        file_obj = {
            "cursor": last_lease.get("cursor"),
            "has_more": True
        }
        return Dropbox.visit_files(file_obj=file_obj)

    @staticmethod
    def encrypt(plaintext):
        return blake2b(salt=Dropbox.SALT).update(plaintext).hexdigest()

    @staticmethod
    async def visit_files(visitor=None, file_obj=None, loop=None):
        visitor = visitor or Dropbox.process_file
        loop = loop or asyncio.get_running_loop()

        # TODO: Create this elsewhere?
        dbx = dropbox.Dropbox(ACCOUNT_TOKEN)

        while True:
            # Dropbox doesn't have an async interface yet, so run the dbx calls in a thread pool.
            list_once = partial(Dropbox.list_once, dbx, file_obj=file_obj)
            file_obj = await loop.run_in_executor(None, list_once)

            if file_obj:
                for entry in file_obj.entries:
                    yield asyncio.create_task(visitor(entry))
            else:
                break

    @staticmethod
    def list_once(dbx, path=ROOT, limit=LIMIT_PER_CALL, file_obj=None):
        try:
            if file_obj:
                if not file_obj.has_more:
                    return []
                return dbx.files_list_folder_continue(file_obj.cursor)
            return dbx.files_list_folder(path=path, limit=limit,
                                         include_media_info=True, recursive=True)
        except dropbox.exceptions.ApiError as err:
            # TODO(mb): Retry logic needed?
            print('Folder listing failed for', path, '-- assumed empty:', err)
            return None

    @staticmethod
    async def process_file(entry_stone):
        entry = stone_serializers.json_compat_obj_encode(Metadata_validator, entry_stone)
        try:
            metadata = entry_stone.media_info.get_metadata()
            if isinstance(metadata, PhotoMetadata):
                return await Dropbox.process_photo(entry)
            elif isinstance(metadata, DeletedMetadata):
                return await Dropbox.process_deleted(entry)
        except AttributeError:
            return entry

    @staticmethod
    async def process_photo(entry):
        entry["type"] = "image"

        # TODO(mb): schedule a tagging job here.
        return entry

    @staticmethod
    async def process_deleted(entry):
        entry["deleted"] = True
        return entry


async def main(argv):
    dbx = dropbox.Dropbox(ACCOUNT_TOKEN)
    loop = asyncio.get_running_loop()
    files = [await file async for file in Dropbox.visit_files()]
    print(files)
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main(sys.argv)))

