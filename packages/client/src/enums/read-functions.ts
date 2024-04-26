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
  GetTotalSharePurchased = 'totalPurchased',
  GetReservesAndWeights = 'reservesAndWeights',
}

export enum PoolDataValueKey {
  AssetToken = 'assetToken',
  Closed = 'closed',
  Creator = 'creator',
  EndWeightBasisPoints = 'endWeightBasisPoints',
  MaxAssetsIn = 'maxAssetsIn',
  MaxSharePrice = 'maxSharePrice',
  MaxSharesOut = 'maxSharesOut',
  SaleEndTime = 'saleEndTime',
  SaleStartTime = 'saleStartTime',
  SellingAllowed = 'sellingAllowed',
  ShareToken = 'shareToken',
  StartWeightBasisPoints = 'startWeightBasisPoints',
  TotalPurchased = 'totalPurchased',
  TotalReferred = 'totalReferred',
  TotalSwapFeesAsset = 'totalSwapFeesAsset',
  TotalSwapFeesShare = 'totalSwapFeesShare',
  VestCliff = 'vestCliff',
  VestEnd = 'vestEnd',
  VirtualAssets = 'virtualAssets',
  VirtualShares = 'virtualShares',
  WhitelistMerkleRoot = 'whitelistMerkleRoot',
}
