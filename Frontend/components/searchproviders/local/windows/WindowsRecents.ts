import {LocalFileResult} from "../../../results/services/LocalFileResult";
import {ResultGroup} from "../../../results/ResultGroup";
import {Builder} from "builder-pattern";
import * as path from "path";
import * as mime from "mime";
import * as Promise from "bluebird";
import {CachedSearchProvider} from "../../CachedSearchProvider";

let fs = require("fs");
Promise.promisifyAll(fs);

export class WindowsRecents extends CachedSearchProvider<LocalFileResult> {
  public readonly heading: ResultGroup<LocalFileResult> = new ResultGroup("Recent Files", Infinity);
  private readonly search_path: string = path.join(
      process.env.APPDATA!, "Microsoft", "Windows", "Recent");

  protected uncachedSearch(query: string): PromiseLike<LocalFileResult[]> {
    return fs.readdirAsync(this.search_path).then(
        searchResults => searchResults.map(
            file => WindowsRecents
                .transformResult(this.search_path, file))
                .sort((a, b) => b.accessed.getTime() - a.accessed.getTime())
    );
  }

  // There is only one cache entry for this class.
  protected writeCache(query: string, results: LocalFileResult[]) {
    super.writeCache("", results);
  }

  private static transformResult(pathname: string, filename: string): LocalFileResult|undefined {
    if (!filename) {
      return undefined;
    }

    let result = path.join(pathname, filename);

    // This appears to be faster synchronously than asynchronously?
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
        .name(filename.replace(".lnk", ""))
        .mimetype(mime.getType(result) || "")
        .path(result)
        .size(stat.size)
        .modified(new Date(stat.mtimeMs))
        .accessed(new Date(stat.atimeMs))
        .build();
  }
}
