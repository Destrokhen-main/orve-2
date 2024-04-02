export function scheduled() {
  let _controller = false;

  return (func: any, value: any) => {
    if (!_controller) {
      _controller = true;
      queueMicrotask(() => {
        _controller = false;
        func(value);
      });
    }
  };
}