import mimetypes
from datetime import datetime
from typing import Dict, Any

import arrow as arrow
from orderedmultidict import omdict

from gearshift.model.document import Document, DocRevision, Capability, Permissions


class DropboxSerializer:
    def parse(self, df: Dict[str, Any]) -> Document:
        return Document(
            objectId=df["id"].replace("id:", "dbx:"),
            filename=df["name"],
            path=df["path_display"],
            url=self.format_url(df["id"]),
            description=None,
            type=df[".tag"] if df[".tag"] else mimetypes.guess_type(df["name"]),
            owner=None,  # TODO(mb): Any way to get this in here?
            permissions=self.get_permissions(df.get("sharing_info")),
            metadata=df,
            tags=set(),
            size=df.get("size"),
            hash=df.get("content_hash"),
            revision=self.get_revision(df.get("rev"), df.get("server_modified")),
            last_fetched=arrow.utcnow().datetime,
            capabilities=self.get_capabilities(df)
        )

    def format_url(self, id):
        return None

    def get_revision(self, rev_id, server_modified_time):
        return DocRevision(
            objectId=rev_id,
            revised=arrow.get(server_modified_time).datetime if server_modified_time else None
        ) if rev_id else None

    def get_capabilities(self, df):
        return Capability.all()

    def get_permissions(self, df_perms) -> Dict[str, Permissions]:
        permission = Permissions.NONE
        if not df_perms:
            return None

        if df_perms.get("no_access") is True:
            return {"*": permission}

        permission |= Permissions.EXECUTE
        if df_perms.get("traverse_only") is True:
            return {"*": permission}

        permission |= Permissions.READ
        if df_perms.get("read_only") is True:
            return {"*": permission}

        permission |= Permissions.WRITE
        return {"*": permission}
