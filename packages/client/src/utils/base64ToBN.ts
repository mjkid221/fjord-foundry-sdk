import * as anchor from '@coral-xyz/anchor';

import { BigNumber } from '../types';

export const base64ToBN = (base64: string): BigNumber => {
  // Decode the base64 string to a buffer
  const buffer = Buffer.from(base64, 'base64');
  let value = BigInt(0);
  for (let i = 0; i < buffer.length; i++) {
    value += BigInt(buffer[i]) << (BigInt(i) * BigInt(8));
  }

  return new anchor.BN(value.toString());
};
