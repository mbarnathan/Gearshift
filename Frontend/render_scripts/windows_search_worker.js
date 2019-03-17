const oledb = require("oledb-electron");
const SqlString = require('sqlstring');

const winSearchURI = 'Provider=Search.CollatorDSO;Extended Properties="Application=Windows"';

module.exports.search = function(query) {
  let connection = oledb.oledbConnection(winSearchURI);
  // Parameters can't be bound with this provider, so the query is escaped instead.
  const escaped = SqlString.escape(`%${query}%`);
  const sql = `
SELECT System.ItemName, System.ItemNameDisplay, System.DateModified, System.ContentType, 
System.IsDeleted, System.IsEncrypted, System.ItemType, System.ItemTypeText, System.ItemUrl, 
System.Keywords, System.Size, System.Title 
FROM SystemIndex 
WHERE System.ItemName LIKE ${escaped}`;
  return connection.query(sql);
};
