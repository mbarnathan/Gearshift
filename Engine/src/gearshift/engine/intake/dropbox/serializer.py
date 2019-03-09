import mimetypes
from typing import Dict, Any

import arrow as arrow

from gearshift.model.document import Document, DocRevision, Capability, Permissions


class DropboxSerializer:
    def parse(self, df: Dict[str, Any], account=None) -> Document:
        return Document(
            objectID=df["id"].replace("id:", "dbx:"),
            filename=df["name"],
            path=df["path_display"],
            url=self.format_url(df["id"]),
            description=None,
            mime=mimetypes.guess_type(df["name"])[0],
            type=df.get("type") or df.get(".tag") or "file",
            owner=account,
            permissions=self.get_permissions(df.get("sharing_info"), account),
            source="Dropbox",
            original=df,
            metadata=df.get("media_info", {}).get("metadata"),
            size=df.get("size"),
            hash=df.get("content_hash"),
            revision=self.get_revision(df.get("rev"), df.get("server_modified")),
            last_fetched=arrow.utcnow().datetime,
            capabilities=self.get_capabilities(df)
        )

    def format_url(self, _id):
        return None

    def get_revision(self, rev_id, server_modified_time):
        return DocRevision(
            objectID=rev_id,
            revised=arrow.get(server_modified_time).datetime if server_modified_time else None
        ) if rev_id else None

    def get_capabilities(self, df):
        if df.get(".tag") == "folder":
            return Capability.all()
        else:
            return Capability.all(except_=Capability.TRAVERSE)

    def get_permissions(self, df_perms, account=None) -> Dict[str, Permissions]:
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
