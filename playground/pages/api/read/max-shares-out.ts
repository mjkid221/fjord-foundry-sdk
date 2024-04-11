import { NextApiRequest, NextApiResponse } from 'next';

import { abi } from '@/constants/abi';
import { initializeSdk } from '@/utils/initialiseClient';

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
  const sdkClient = await initializeSdk();

  const maxSharesOut = await sdkClient.getMaxTotalSharesOut({ contractAddress, abi });

  res.status(200).json(maxSharesOut.toString()); // Convert BigInt to string
};

export default handler;
