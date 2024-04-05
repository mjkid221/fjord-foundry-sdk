import { NextApiRequest, NextApiResponse } from 'next';

import { abi } from '@/constants/abi';
import { initializeSdk } from '@/utils/initialiseClient';

const contractAddress = '0xC17374e2C8FebaBf509F2671F5fB8Aaac3236031';

const convertBigIntToString = (obj: any) => {
  for (const key in obj) {
    if (typeof obj[key] === 'bigint') {
      obj[key] = obj[key].toString();
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      convertBigIntToString(obj[key]);
    }
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const sdkClient = await initializeSdk();

  const args = await sdkClient.getContractArgs({ contractAddress, abi });
  // Convert all BigInt properties in args to strings
  convertBigIntToString(args);

  console.log(args);
  res.status(200).json(args);
};

export default handler;
