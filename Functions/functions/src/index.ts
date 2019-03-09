import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as algoliasearch from 'algoliasearch';
import {DocumentSnapshot} from "firebase-functions/lib/providers/firestore";

admin.initializeApp();

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;
// const ALGOLIA_SEARCH_KEY = functions.config().algolia.search_key;

const ALGOLIA_INDEX_NAME = 'documents';
const algolia = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

const fsDoc = functions.firestore.document('services/{service}/users/{user}/files/{file}');

const handler = (snap: functions.Change<DocumentSnapshot>, context: functions.EventContext) => {
  const index = algolia.initIndex(ALGOLIA_INDEX_NAME);
  if (snap.after && snap.after.exists) {
    // Create or update.
    const document = snap.after.data();
    if (document) {
      return index.saveObject(document);
    }
  } else if (snap.before && snap.before.exists) {
    // Delete.
    const data = snap.before.data();
    if (data) {
      return index.deleteObject(data.objectID);
    }
  }
  throw new ReferenceError(`A Firestore document doesn't exist at ${context}`);
};

// Update the search index with each create, update, or delete to a document.
exports.onDoc = fsDoc.onWrite(handler);
