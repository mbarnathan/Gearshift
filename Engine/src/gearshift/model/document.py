# coding: utf-8
from datetime import datetime
from enum import Enum, unique, IntFlag
from typing import List, Dict, Iterable, Any

import attr


@attr.s(auto_attribs=True)
class DocRevision:
    """A revision of a document."""
    objectId: str
    revised: datetime


class Permissions(IntFlag):
    READ = 4
    WRITE = 2
    EXECUTE = 1
    NONE = 0


@unique
class Capability(str, Enum):
    SEARCH = "SEARCH"
    DOWNLOAD = "DOWNLOAD"
    EMBED = "EMBED"
    LINK = "LINK"
    SHARE = "SHARE"
    TRAVERSE = "TRAVERSE"

    @staticmethod
    def all(except_: Iterable["Capability"] = None) -> List["Capability"]:
        """Returns a list of all capabilities in this enum.

        :param except_ an iterable of Capabilities to exclude.
        """
        if not isinstance(except_, list) or isinstance(except_, str):
            except_ = [except_]
        except_ = frozenset(except_ or [])
        return [c for c in Capability if c.name not in except_ and c.value not in except_]


@attr.s(auto_attribs=True)
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
    mime: str
    owner: str
    permissions: Dict[str, Permissions]
    original: Dict[str, Any]
    metadata: Dict[str, str]
    tags: List[str]
    size: int
    hash: str
    revision: DocRevision
    last_fetched: datetime
    capabilities: List[Capability]

    def readable(self, user: str):
        """Is this document readable by the given user?"""
        return bool(self.permissions.get(user, 0) & Permissions.READ)

    def writable(self, user: str):
        """Is this document writable by the given user?"""
        return bool(self.permissions.get(user, 0) & Permissions.WRITE)

    def executable(self, user: str):
        """Is this document executable by the given user?"""
        return bool(self.permissions.get(user, 0) & Permissions.EXECUTE)
