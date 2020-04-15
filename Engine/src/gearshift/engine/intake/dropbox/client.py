import asyncio
import sys
from _blake2 import blake2b
from functools import partial
from typing import Any, Dict, Generator

import attr
from dropbox import dropbox, stone_serializers
from dropbox.files import Metadata_validator, PhotoMetadata, DeletedMetadata
from evanesca.common.logging.elog import L
from quart import json

ACCOUNT_TOKEN = "token"
LIMIT_PER_CALL = 500
ROOT = ""


class DropboxClient:
    SALT = "salt"

    def __init__(self, token=ACCOUNT_TOKEN):
        self.dbx = dropbox.Dropbox(token)
        self.last_cursor = None

    # TODO(mb): Use encryption.
    @staticmethod
    def encrypt(plaintext):
        """Encrypts the Dropbox account name."""
        return blake2b(salt=DropboxClient.SALT).update(plaintext).hexdigest()

    async def get_files(self, visitor=None,
                        cursor: str = None, loop=None) -> Generator[Dict[str, Any], None, None]:
        """Generates a list of Dropbox metadata dictionaries, suitable for serializing.

        :param visitor Optional transform function called with each file's Stone object.
        :param cursor The last processed Dropbox cursor.
        :param loop Async loop to run within; defaults to the current event loop.
        """
        visitor = visitor or self.process_file
        loop = loop or asyncio.get_event_loop()

        while True:
            # Dropbox doesn't have an async interface yet, so run the dbx calls in a thread pool.
            list_once = partial(self.list_once, cursor=cursor)
            file_obj = await loop.run_in_executor(None, list_once)
            if file_obj:
                for entry in file_obj.entries:
                    yield asyncio.create_task(visitor(entry))

                if file_obj.has_more:
                    self.last_cursor = cursor = file_obj.cursor
                    continue
            break

    def list_once(self, path=ROOT, limit=LIMIT_PER_CALL, cursor=None):
        """Makes one call to Dropbox to get the first or next page of files.

        :param path Parent path to list files underneath. Defaults to the root.
        :param limit Number of files per call to return.
        :param cursor Last cursor
        """
        try:
            if cursor:
                return self.dbx.files_list_folder_continue(cursor)
            else:
                return self.dbx.files_list_folder(path=path, limit=limit,
                                                  include_media_info=True, recursive=True)
        except dropbox.ApiError as err:
            L.warning('Folder listing failed for ', path, ' -- assumed empty: ', err)
            return None

    async def process_file(self, entry_stone):
        """Default visitor which processes individual file entries."""
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
        entry["type"] = "image"  # Firebase will trigger a Cloud Function to tag this.
        return entry

    async def process_deleted(self, entry):
        entry["deleted"] = True  # The worker will schedule this for deletion.
        return entry


# noinspection PyUnusedLocal
async def main(argv):
    from gearshift.engine.intake.dropbox.serializer import DropboxSerializer
    serializer = DropboxSerializer()
    files = await asyncio.gather(*[file async for file in DropboxClient().get_files()])
    print(files)
    files = [attr.asdict(serializer.parse(file)) for file in files]
    print(json.dumps(files))
    return 0

if __name__ == "__main__":
    sys.exit(asyncio.run(main(sys.argv)))
