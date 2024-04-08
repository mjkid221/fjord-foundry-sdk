const transformFunctionName = (name: string): string => {
  // Insert a '-' before every uppercase letter that is not at the start of the string, then convert to lowercase
  return name.replace(/(?<!^)([A-Z])/g, '-$1').toLowerCase();
};

export const READ_FUNCTIONS =
  'GetContractArgs,GetContractManager,IsPoolClosed,IsSellingAllowed,GetMaxTotalAssetsIn,GetMaxTotalSharesOut,GetVestingState,GetTotalSharesPurchased,GetReservesAndWeights'.split(
    ',',
  );

export const transformedFunctionsObject = READ_FUNCTIONS.reduce(
  (acc, functionName) => {
    acc[functionName] = transformFunctionName(functionName);
    return acc;
  },
  {} as Record<string, string>,
);
