import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { NextApiRequest, NextApiResponse } from 'next';

import { abi } from '@/constants/abi';
import { convertBigIntToString } from '@/helpers/convertBigIntToString';

// const contractAddress = '0xC17374e2C8FebaBf509F2671F5fB8Aaac3236031';

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

  const args = await sdkClient.getContractArgs({ contractAddress, abi });
  // Convert all BigInt properties in args to strings
  convertBigIntToString(args);

  res.status(200).json(args);
};

export default handler;
