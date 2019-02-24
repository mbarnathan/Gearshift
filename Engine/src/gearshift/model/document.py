# coding: utf-8
from datetime import datetime
from dataclasses import dataclass
from enum import Enum, unique
from typing import List, Dict, Any, Set, Type


# class SourceDocumentSchema(Schema):
#     """A Document with a Source."""
#     objectId = fields.Str()  # Native ID of the document at the source.
#     sourceName = fields.Str(required=True)  # e.g. "Dropbox", "GDrive".
from orderedmultidict import omdict


@dataclass
class DocSource:
    """A Document with a Source."""
    objectId: str
    sourceName: str


@dataclass
class DocRevision:
    """A revision of a document."""
    objectId: str
    revised: datetime


@dataclass
class Permission(Enum):
    READ = 4,
    WRITE = 2,
    EXECUTE = 1


# class RevisionSchema(Schema):
#     """A revision of a document."""
#     objectId = fields.Str()
#     revised = fields.DateTime(required=True)


@unique
class Capability(Enum):
    SEARCH = 1,
    DOWNLOAD = 2,
    EMBED = 3,
    LINK = 4,
    SHARE = 5,
    ENUMERATE = 6


# class DocumentSchema(Schema):
#     """Baseline schema for a Document across services.
#
#     Documents need to be:
#         1. Ingestable from many different services.
#         2. Searchable by user, name, content, and automatically derived tags.
#         3. Linkable by URL.
#         4. Downloadable for embedding.
#     """
#
#     objectID = fields.Str()      # Required to be called objectID by Algolia.
#     filename = fields.Str(required=True)
#     path = fields.Str(required=True)
#     url = fields.Str()
#     description = fields.Str(missing=None)
#     type = fields.Str(missing=None)
#     owner = fields.Str(required=True)
#     usersWithAccess = fields.List(fields.Str())
#     metadata = fields.Dict()
#     tags = fields.List(fields.Str())
#     size = fields.Integer()
#     hash = fields.Str()
#     source = fields.Nested(SourceDocumentSchema)
#     revision = fields.Nested(RevisionSchema)
#     last_fetched = fields.DateTime(required=True)
#     capabilities = fields.List(EnumField(Capability))


@dataclass
class Document:
    """Baseline schema for a Document across services.

    Documents need to be:
        1. Ingestable from many different services.
        2. Searchable by user, name, content, and automatically derived tags.
        3. Linkable by URL.
        4. Downloadable for embedding.
    """
    objectId: str
    filename: str
    path: str
    url: str
    description: str
    type: str
    owner: str
    permissions: omdict[str, Type[Permission]]
    metadata: Dict[str, Any]
    tags: Set[str]
    size: int
    hash: str
    source: DocSource
    revision: DocRevision
    last_fetched: datetime
    capabilities: List[Capability]

    def readable(self, user: str):
        """Is this document readable by the given user?"""
        return Permission.READ in self.permissions.getlist(user)

    def writable(self, user: str):
        """Is this document writable by the given user?"""
        return Permission.WRITE in self.permissions.getlist(user)

    def executable(self, user: str):
        """Is this document executable by the given user?"""
        return Permission.EXECUTE in self.permissions.getlist(user)
