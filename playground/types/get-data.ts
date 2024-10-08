import { RetrievePoolDataParams, FjordClientSdk, PoolDataValueKey } from '@fjord-foundry/solana-sdk-client';

export interface GetPoolArgs extends RetrievePoolDataParams {
  sdkClient: FjordClientSdk;
}

export interface GetSinglePoolDataValueParams extends GetPoolArgs {
  valueKey: PoolDataValueKey;
}
export interface GetPoolArgsResponse {
  assetToken: string;
  creator: string;
  endWeightBasisPoints: number;
  maxAssetsIn: number;
  maxSharePrice: string;
  maxSharesOut: number;
  saleEndTime: string;
  saleStartTime: string;
  sellingAllowed: boolean;
  shareToken: string;
  startWeightBasisPoints: number;
  vestCliff: string;
  vestEnd: string;
  virtualAssets: string;
  virtualShares: string;
  whitelistMerkleRoot: number[];
}
