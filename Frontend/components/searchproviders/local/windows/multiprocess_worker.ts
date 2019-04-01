import {escape} from "sqlstring";

const winSearchURI = 'Provider=Search.CollatorDSO;Extended Properties="Application=Windows"';

module.exports.search = function(query: string) {
  return querySearchIndex(query).then(results => results["result"][0]);
};

function querySearchIndex(query: string):Promise<Object> {
  let oledb = require("oledb-electron");
  let connection = oledb.oledbConnection(winSearchURI);
  // Parameters can't be bound with this provider, so the query is escaped instead.
  const escaped = escape(`%${query}%`);
  // noinspection SqlDialectInspection, SqlNoDataSourceInspection
  const sql = `
SELECT TOP 1000 System.ItemName, System.ItemNameDisplay, System.DateModified, System.ContentType, 
System.IsDeleted, System.IsEncrypted, System.ItemType, System.ItemTypeText, System.ItemPathDisplay, 
System.Keywords, System.Size, System.Title, System.Search.Rank 
FROM SystemIndex 
WHERE System.ItemNameDisplay LIKE ${escaped}
ORDER BY System.Search.Rank DESC, System.Search.HitCount DESC, System.DateAccessed DESC`;
  return connection.query(sql);
}
