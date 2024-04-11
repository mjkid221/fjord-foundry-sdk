import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { BN } from '@project-serum/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';

import { InitializePoolArgsType, SchemaUnionType } from '@/components/write-methods/CreateLbp';

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
  const startWeightBasisPoints = Number(body.args.startWeightBasisPoints);
  const endWeightBasisPoints = Number(body.args.endWeightBasisPoints);
  const saleStartTime = new BN(body.args.saleStartTime);
  const saleEndTime = new BN(body.args.saleEndTime);

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

  const walletConnection = await sdkClient.connectWallet(WalletAdapterNetwork.Devnet);

  const response = await sdkClient.createPool({ programId: programAddressPublicKey, keys, args });

  console.log(response);

  res.status(200).json(response);
};

export default handler;
