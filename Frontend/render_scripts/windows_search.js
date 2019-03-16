const oledb = require("oledb-electron");
const winSearchURI = 'Provider=Search.CollatorDSO;Extended Properties="Application=Windows"';

let connection = oledb.oledbConnection(winSearchURI);
let query1 = "SELECT System.ItemName FROM SystemIndex WHERE scope ='file:C:/' AND System.ItemName LIKE '%Test%'";
connection.query(query1).then(result => {
  console.log(result);
});
