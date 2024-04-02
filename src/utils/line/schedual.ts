export class Scheduled {
  private _controller = false;

  trigger(func: any, value: any) {
    if (!this._controller) {
      this._controller = true;
      queueMicrotask(() => {
        this._controller = false;
        func(value);
      });
    }
  }
}