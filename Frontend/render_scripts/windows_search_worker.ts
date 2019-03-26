import { escape } from "sqlstring";
import {LocalFileResult} from "../components/results/services/LocalFileResult";
import {Builder} from "builder-pattern";

const winSearchURI = 'Provider=Search.CollatorDSO;Extended Properties="Application=Windows"';

module.exports.search = function(query) {
  return querySearchIndex(query)[0].map(transformResult);
};

function querySearchIndex(query: string):Object {
  let oledb = require("oledb-electron");
  let connection = oledb.oledbConnection(winSearchURI);
  // Parameters can't be bound with this provider, so the query is escaped instead.
  const escaped = escape(`%${query}%`);
  const sql = `
SELECT System.ItemName, System.ItemNameDisplay, System.DateModified, System.ContentType, 
System.IsDeleted, System.IsEncrypted, System.ItemType, System.ItemTypeText, System.ItemPathDisplay, 
System.Keywords, System.Size, System.Title 
FROM SystemIndex 
WHERE System.ItemName LIKE ${escaped}`;
  return connection.query(sql);
}

function transformResult(result: Object): LocalFileResult|undefined {
  if (!result) {
    return undefined;
  }

  return Builder(LocalFileResult)
      .name(result["SYSTEM.TITLE"] || result["SYSTEM.ITEMNAME"])
      .mimetype(result["SYSTEM.CONTENTTYPE"])
      .path(result["SYSTEM.ITEMPATHDISPLAY"])
      .size(parseInt(result["SYSTEM.SIZE"]))
      .modified(result["SYSTEM.DATEMODIFIED"])
      .build();
}
