import { FjordClientSdk, PublicClientService } from '@fjord-foundry/solana-sdk-client';

export const initializeSdk = async () => {
  const clientService = await PublicClientService.create();
  const clientSdk = new FjordClientSdk(clientService);

  return clientSdk;
};
