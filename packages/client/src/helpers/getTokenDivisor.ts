export const getTokenDivisor = (tokenDecimals: number): number => {
  return Math.pow(10, tokenDecimals);
};
