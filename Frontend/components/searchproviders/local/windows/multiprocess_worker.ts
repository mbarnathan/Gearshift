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
SELECT TOP 1000 System.ItemName, System.ItemNameDisplay, System.DateModified, System.MIMEType, 
System.IsDeleted, System.Search.Store, System.IsEncrypted, System.ItemType, System.ItemTypeText, System.ItemPathDisplay, 
System.Keywords, System.Size, System.Title, System.Search.Rank 
FROM SystemIndex 
WHERE System.MIMEType != 'message/rfc822'
AND (
    CONTAINS(System.ItemName, ${escaped}) RANK BY WEIGHT ( 1.000 )
    OR CONTAINS(System.ItemNameDisplay, ${escaped}) RANK BY WEIGHT ( 1.000 )
    OR CONTAINS(System.Title, ${escaped}) RANK BY WEIGHT ( 1.000 )
    OR CONTAINS(System.ItemPathDisplay, ${escaped}) RANK BY WEIGHT ( 0.750 )
)
ORDER BY System.Search.Rank DESC, System.Search.HitCount DESC, System.DateAccessed DESC`;
  return connection.query(sql);
}
