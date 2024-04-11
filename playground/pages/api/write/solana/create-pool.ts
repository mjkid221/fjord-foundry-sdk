import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { BN } from '@project-serum/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import { hoursToSeconds } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';

import { InitializePoolArgsType } from '@/components/write-methods/CreateLbp';

const TIME_OFFSET = 1_000;
const ONE_DAY_SECONDS = hoursToSeconds(24);
const PERCENTAGE_BASIS_POINTS = 100;

const DEFAULT_SALE_START_TIME_BN = new BN(new Date().getTime() / 1000 + TIME_OFFSET);

const DEFAULT_SALE_END_TIME_BN = DEFAULT_SALE_START_TIME_BN.add(new BN(ONE_DAY_SECONDS));

// const DEFAULT_VESTING_CLIFF_BN = DEFAULT_SALE_END_TIME_BN.add(new BN(ONE_DAY_SECONDS));

// const DEFAULT_VESTING_END_BN = DEFAULT_VESTING_CLIFF_BN.add(new BN(ONE_DAY_SECONDS));

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }
  console.log(req.body);
  const body = req.body as InitializePoolArgsType;

  const programAddressPublicKey = new PublicKey('AXRGWPXpgTKK9NrqLji4zbPeyiiDp2gkjLGUJJunLKUm');

  const creator = new PublicKey(body.args.creator);
  const shareTokenMint = new PublicKey(body.args.shareTokenMint);
  const assetTokenMint = new PublicKey(body.args.assetTokenMint);

  const assets = new BN(body.args.assets);
  const shares = new BN(body.args.shares);
  const maxAssetsIn = new BN(body.args.maxAssetsIn);
  const maxSharePrice = new BN(body.args.maxSharePrice);
  const maxSharesOut = new BN(body.args.maxSharesOut);
  const startWeightBasisPoints = Number(body.args.startWeightBasisPoints) * PERCENTAGE_BASIS_POINTS;
  const endWeightBasisPoints = Number(body.args.endWeightBasisPoints) * PERCENTAGE_BASIS_POINTS;
  const saleStartTime = DEFAULT_SALE_START_TIME_BN;
  const saleEndTime = DEFAULT_SALE_END_TIME_BN;

  const keys = {
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    assets,
    shares,
    maxAssetsIn,
    maxSharePrice,
    maxSharesOut,
    startWeightBasisPoints,
    endWeightBasisPoints,
    saleStartTime,
    saleEndTime,
  };

  const sdkClient = await FjordClientSdk.create(true, WalletAdapterNetwork.Devnet);

  const response = await sdkClient.createPool({ programId: programAddressPublicKey, keys, args });

  res.status(200).json(response);
};

export default handler;
