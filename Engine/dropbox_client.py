import asyncio
from functools import partial

import dropbox
import sys
from dropbox.files import PhotoMetadata

ACCOUNT_TOKEN = "EdTy1lJN1oIAAAAAAAAAkAqpN88_8VcZ2EgdRNHDV-9jqPbQjbNvO-sUM9537YqY"
LIMIT_PER_CALL = 500
ROOT = ""


async def main(argv):
    dbx = dropbox.Dropbox(ACCOUNT_TOKEN)
    loop = asyncio.get_running_loop()

    files = None
    futures = []
    while True:
        files = await loop.run_in_executor(None, partial(list_files, dbx, file_obj=files))
        if files:
            futures += [asyncio.create_task(process_file(entry)) for entry in files.entries]
        else:
            break
    results = await asyncio.gather(*futures)
    print(results)
    return 0


def list_files(dbx, path=ROOT, limit=LIMIT_PER_CALL, file_obj=None):
    try:
        if file_obj:
            if not file_obj.has_more:
                return []
            return dbx.files_list_folder_continue(file_obj.cursor)
        return dbx.files_list_folder(path=path, limit=limit,
                                     include_media_info=True, recursive=True)
    except dropbox.exceptions.ApiError as err:
        print('Folder listing failed for', path, '-- assumed empty:', err)
        return None


async def process_file(entry):
    try:
        metadata = entry.media_info.get_metadata()
        if isinstance(metadata, PhotoMetadata):
            return await process_photo(entry)
    except AttributeError:
        return entry.name


async def process_photo(entry):
    print(entry.name)
    await asyncio.sleep(1.0)
    return entry.name


if __name__ == "__main__":
    sys.exit(asyncio.run(main(sys.argv)))

