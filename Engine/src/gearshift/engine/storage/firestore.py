import firebase_admin
from firebase_admin import firestore


class Firestore:
    def __init__(self):
        self.db = None

    def __enter__(self):
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.stop()

    def start(self):
        firebase_admin.initialize_app()
        self.db = firestore.client()

    def stop(self):
        self.db = None

    def collection(self, cname):
        return self.db.collection(cname)

