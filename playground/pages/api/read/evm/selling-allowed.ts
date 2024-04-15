import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { NextApiRequest, NextApiResponse } from 'next';

import { abi } from '@/constants/abi';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { contractAddress } = req.query as { contractAddress: `0x${string}` };

  if (typeof contractAddress !== 'string') {
    res.status(400).json({ error: 'Invalid contract address' });
    return;
  }

  if (!contractAddress) {
    res.status(400).json({ error: 'Contract address is required' });
    return;
  }
  const sdkClient = await FjordClientSdk.create(false);

  const isSellingAllowed = await sdkClient.isSellingAllowed({ contractAddress, abi });

  res.status(200).json(isSellingAllowed.toString());
};

export default handler;
