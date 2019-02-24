# coding: utf-8
from enum import Enum, unique

from marshmallow import Schema, fields
from marshmallow_enum import EnumField


# TODO(mb): Abstract searchable properties into a base schema.
class SourceDocumentSchema(Schema):
    """A Document with a Source."""
    objectId = fields.Str()  # Native ID of the document at the source.
    sourceName = fields.Str(required=True)  # e.g. "Dropbox", "GDrive".


class RevisionSchema(Schema):
    """A revision of a document."""
    objectId = fields.Str()
    revised = fields.DateTime(required=True)


@unique
class Capability(Enum):
    SEARCH = 1,
    DOWNLOAD = 2,
    EMBED = 3,
    LINK = 4,
    SHARE = 5,
    ENUMERATE = 6


class DocumentSchema(Schema):
    """Baseline schema for a Document across services.

    Documents need to be:
        1. Ingestable from many different services.
        2. Searchable by user, name, content, and automatically derived tags.
        3. Linkable by URL.
        4. Downloadable for embedding.
    """

    objectID = fields.Str()      # Required to be called objectID by Algolia.
    filename = fields.Str(required=True)
    path = fields.Str(required=True)
    url = fields.Str()
    description = fields.Str(missing=None)
    type = fields.Str(missing=None)
    owner = fields.Str(required=True)
    usersWithAccess = fields.List(fields.Str())
    metadata = fields.Dict()
    tags = fields.List(fields.Str())
    size = fields.Integer()
    hash = fields.Str()
    source = fields.Nested(SourceDocumentSchema)
    revision = fields.Nested(RevisionSchema)
    last_fetched = fields.DateTime(required=True)
    capabilities = fields.List(EnumField(Capability))
