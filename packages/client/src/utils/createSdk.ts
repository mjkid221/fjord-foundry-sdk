import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

import { FjordClientSdk } from '../client';
import { SolanaConnectionService, PublicClientService } from '../services';
import { ClientService } from '../types';

export const createSdk = async (useSolana: boolean, solanaNetwork?: WalletAdapterNetwork) => {
  let service: ClientService;

  if (useSolana) {
    if (!solanaNetwork) {
      throw new Error('Solana network is required when using Solana');
    }
    service = await SolanaConnectionService.create(solanaNetwork);
  } else {
    service = await PublicClientService.create();
  }

  const sdk = new FjordClientSdk(service);
  return sdk;
};
