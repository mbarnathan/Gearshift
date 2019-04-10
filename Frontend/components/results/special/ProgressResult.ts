import {Result} from "../Result";

export class ProgressResult extends Result {
  constructor(name: string, progress?: number|undefined) {
    // TODO(mb): This is a hack brought about by an inflexible inheritance structure.
    super(name, "", new Date(), null, "", NaN);
    this.progress = progress;
  }

  get defaultState() {
    return Object.assign(super.defaultState, "progress", null);
  }

  public get progress(): number|undefined {
    return this.state["progress"];
  }

  public set progress(progress: number|undefined) {
    if (progress && (progress < 0 || progress > 100)) {
      throw new RangeError("Progress needs to be undefined or in the range [0, 100]");
    }
    this.setState({progress: progress || undefined});
  }

  public highlight(query: string): void {
    // No-op; this should not be highlighted.
  }

  public score(query: string): number {
    return Infinity;  // Always sort to the top.
  }

  public render() {
    return this.html`
        <tr class="progress" id="${this.id}">
          <td class="thumbnail"><div class="lds-ripple"><div></div><div></div></div></td>
          <td class="filename">Loading...</td>
          <td colspan="1000"></td>
        </tr>
    `;
  }
}
