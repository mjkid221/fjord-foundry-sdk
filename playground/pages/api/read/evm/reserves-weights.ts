import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { NextApiRequest, NextApiResponse } from 'next';

import { abi } from '@/constants/abi';
import { convertBigIntToString } from '@/helpers/convertBigIntToString';

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

  const reservesAndWeights = await sdkClient.getReservesAndWeights({ contractAddress, abi });

  convertBigIntToString(reservesAndWeights);

  res.status(200).json(reservesAndWeights);
};

export default handler;
