export function scheduled() {
  let _controller = false;
  let newValue: any = null;

  return (func: any, value: any) => {
    newValue = value;
    if (!_controller) {
      _controller = true;
      queueMicrotask(() => {
        _controller = false;
        func(newValue);
      });
    }
  };
}
