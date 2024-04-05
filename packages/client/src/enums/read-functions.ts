export enum ReadFunction {
  GetContractArgs = 'args',
  GetContractManager = 'manager',
  IsPoolClosed = 'closed',
  IsSellingAllowed = 'sellingAllowed',
  GetMaxTotalAssetsIn = 'maxTotalAssetsIn',
  GetMaxTotalSharesOut = 'maxTotalSharesOut',
  IsVestingSharesEnabled = 'vestShares',
  GetVestingCliffTimestamp = 'vestCliff',
  GetVestingEndTimestamp = 'vestEnd',
}
