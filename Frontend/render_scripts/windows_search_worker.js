const oledb = require("oledb-electron");
const winSearchURI = 'Provider=Search.CollatorDSO;Extended Properties="Application=Windows"';

module.exports.search = function(query) {
  let connection = oledb.oledbConnection(winSearchURI);
  let query1 = "SELECT System.ItemName FROM SystemIndex WHERE scope='file:C:/'  AND System.ItemName LIKE '%" + query + "%'";
  return connection.query(query1);
};
