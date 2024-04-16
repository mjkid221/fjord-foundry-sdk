/**
 * Helper function to calculate the divisor for token amounts based on decimal places.
 * @param decimals - The number of decimal places for the token.
 * @returns {number} The appropriate divisor to adjust the token amount.
 */
export const getTokenDivisor = (tokenDecimals: number): number => {
  return Math.pow(10, tokenDecimals);
};
