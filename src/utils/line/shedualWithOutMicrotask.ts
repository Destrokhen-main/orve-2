export function scheduledWM() {
  return (func: any, value: any) => {
    func(value);
  };
}
