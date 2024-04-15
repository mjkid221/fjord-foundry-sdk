import { RetrievePoolDataParams, FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { Connection } from '@solana/web3.js';

export interface GetPoolArgs extends RetrievePoolDataParams {
  sdkClient: FjordClientSdk;
  connection: Connection;
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
