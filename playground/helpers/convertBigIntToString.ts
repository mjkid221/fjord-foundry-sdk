// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Necessary for temporary type flexibility until refactor
export const convertBigIntToString = (obj: any) => {
  for (const key in obj) {
    if (typeof obj[key] === 'bigint') {
      obj[key] = obj[key].toString();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      convertBigIntToString(obj[key]);
    }
  }
};
