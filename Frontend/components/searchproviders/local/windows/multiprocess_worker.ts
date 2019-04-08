import {escape} from "sqlstring";

const winSearchURI = 'Provider=Search.CollatorDSO;Extended Properties="Application=Windows"';

module.exports.search = function(query: string) {
  return querySearchIndex(query).then(results => results["result"][0]);
};

function querySearchIndex(query: string):Promise<Object> {
  let oledb = require("oledb-electron");
  let connection = oledb.oledbConnection(winSearchURI);
  // Parameters can't be bound with this provider, so the query is escaped instead.
  const escaped = escape(`${query}`);
  const escaped_like = escape(`%${query}%`);
  // noinspection SqlDialectInspection, SqlNoDataSourceInspection
  const sql = `
SELECT TOP 500 System.ItemName, System.ItemNameDisplay, System.DateModified, System.DateAccessed,
System.MIMEType, System.IsEncrypted, System.ItemType, System.ItemTypeText, System.ItemPathDisplay, 
System.Keywords, System.Size, System.Title, 
System.Search.Store, System.Search.Rank, System.Search.HitCount
FROM SystemIndex
WHERE
WITH("System.ItemNameDisplay", "System.Title", "System.Keywords") AS #Titles
  System.MIMEType != 'message/rfc822'
AND (
  CONTAINS(#Titles, ${escaped}) RANK BY WEIGHT ( 1.0 ) 
  OR System.ItemPathDisplay LIKE ${escaped_like}
)
ORDER BY System.Search.Rank DESC, System.Search.HitCount DESC, System.DateAccessed DESC`;
  return connection.query(sql);
}
