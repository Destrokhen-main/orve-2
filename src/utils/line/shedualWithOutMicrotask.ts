export function scheduledWM() {
  let newValue: any = null;

  const ar: any = [];
  let countChedual = 0;

  return (func: any, value: any) => {
    newValue = value;
    console.log("new value", value);
    countChedual++;
    console.log("counter", countChedual);

    ar.push(func);

    countChedual--;
    while (!countChedual && ar.length) {
      ar.shift()(newValue);
    }
  };
}
