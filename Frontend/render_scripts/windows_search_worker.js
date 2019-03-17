const oledb = require("oledb-electron");
const winSearchURI = 'Provider=Search.CollatorDSO;Extended Properties="Application=Windows"';

module.exports.search = function(query) {
  let connection = oledb.oledbConnection(winSearchURI);
  let sql = "SELECT System.ItemName, System.ItemNameDisplay, System.DateModified, System.ContentType, System.IsDeleted, System.IsEncrypted, System.ItemType, System.ItemTypeText, System.ItemUrl, System.Keywords, System.Size, System.Title FROM SystemIndex WHERE System.ItemName LIKE '%" + query + "%'";
  return connection.query(sql);
};
