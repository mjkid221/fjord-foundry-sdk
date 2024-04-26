import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { AnchorProvider } from '@coral-xyz/anchor';
import { createContext } from 'react';

export interface SolanaSdkClientContext {
  sdkClient: FjordClientSdk | undefined;
  provider: AnchorProvider | undefined;
}

export const SolanaSdkClientContext = createContext<SolanaSdkClientContext>({
  sdkClient: undefined,
  provider: undefined,
} as SolanaSdkClientContext);
