/**
 * Sorts data entries by:
 * 1. Numbers > 0 (desc)
 * 2. String values
 * 3. Numbers = 0
 */
const sortDataEntries = <T>(data: Record<string, T>): [string, T][] => {
  return Object.entries(data).sort((x, y) => {
    // Sort numbers > 0.
    if (typeof x[1] === "number" && typeof y[1] === "number") {
      if (x[1] > 0 && y[1] <= 0) return -1;
      if (y[1] > 0 && x[1] <= 0) return 1;
      return y[1] - x[1];
    }

    // Then Strings
    if (typeof x[1] === "string" && typeof y[1] === "number") return 1;
    if (typeof y[1] === "string" && typeof x[1] === "number") return -1;

    // Now number == 0
    if (x[1] === 0 && y[1] !== 0) return 1;
    if (y[1] === 0 && x[1] !== 0) return -1;

    return 0;
  });
};

export { sortDataEntries };
