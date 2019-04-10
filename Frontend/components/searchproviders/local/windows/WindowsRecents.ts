import {LocalFileResult} from "../../../results/services/LocalFileResult";
import {SearchProvider} from "../../../../capabilities/SearchProvider";
import {ResultGroup} from "../../../results/ResultGroup";
import {Builder} from "builder-pattern";
import * as path from "path";
import * as mime from "mime";
import * as Promise from "bluebird";

let fs = require("fs");
Promise.promisifyAll(fs);

export class WindowsRecents extends SearchProvider<LocalFileResult> {
  public readonly heading: ResultGroup<LocalFileResult> = new ResultGroup("Recent Files");
  private readonly search_path: string = path.join(
      process.env.APPDATA!, "Microsoft", "Windows", "Recent");

  public default(): PromiseLike<LocalFileResult[]> {
    return fs.readdirAsync(this.search_path).then(
        searchResults => searchResults.map(
            file => WindowsRecents.transformResult(this.search_path, file))
    );
  }

  public search(query: string): PromiseLike<LocalFileResult[]> {
    return Promise.resolve([]);
  }

  private static transformResult(pathname: string, filename: string): LocalFileResult|undefined {
    if (!filename) {
      return undefined;
    }

    let result = path.join(pathname, filename);

    // TODO(mb): Look into parallelizing or deferring stats if slow.
    let stat;
    try {
      stat = fs.statSync(result);
    } catch (err) {
      // File doesn't exist or no permissions.
      console.warn(err + " reading " + result);
      return undefined;
    }

    // Start with the data from the index, but it might be out of date.
    return Builder(LocalFileResult)
        .name(filename)
        .mimetype(mime.getType(result) || "")
        .path(result)
        .size(stat.size)
        .modified(new Date(stat.mtimeMs))
        .accessed(new Date(stat.atimeMs))
        .build();
  }
}
