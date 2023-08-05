function randInt(min: number, max: number) {
  if (min > max) {
    const c = max;
    max = min;
    min = c;
  }
  return Math.round(min - 0.5 + Math.random() * (max - min + 1));
}

export { randInt };
