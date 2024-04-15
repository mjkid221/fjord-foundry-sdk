// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Ok for now
export const convertBigIntToString = (obj: any) => {
  for (const key in obj) {
    if (typeof obj[key] === 'bigint') {
      obj[key] = obj[key].toString();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      convertBigIntToString(obj[key]);
    }
  }
};
