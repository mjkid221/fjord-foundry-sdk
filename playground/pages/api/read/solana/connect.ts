import { createSdk } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const sdkClient = await createSdk(true, WalletAdapterNetwork.Mainnet);

  const walletConnection = await sdkClient.connectWallet(WalletAdapterNetwork.Devnet);

  res.status(200).json(walletConnection);
};

export default handler;
