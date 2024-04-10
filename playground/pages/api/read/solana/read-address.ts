import { createSdk } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { contractAddress } = req.query as { contractAddress: string };

  const publicKey = new PublicKey(contractAddress);

  if (typeof contractAddress !== 'string') {
    res.status(400).json({ error: 'Invalid contract address' });
    return;
  }

  if (!contractAddress) {
    res.status(400).json({ error: 'Contract address is required' });
    return;
  }
  const sdkClient = await createSdk(true, WalletAdapterNetwork.Mainnet);

  const addressDeets = await sdkClient.readAddress(publicKey);

  res.status(200).json(addressDeets);
};

export default handler;
