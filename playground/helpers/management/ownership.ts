import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { AcceptOwnershipParams, NominateNewOwnerParams } from '@/types';
import { PublicKey } from '@solana/web3.js';

export const nominateNewOwner = async ({ formData, provider, sdkClient }: NominateNewOwnerParams) => {
  const { creator, newOwnerPublicKey } = formData.args;
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

  const keys = {
    creator: new PublicKey(creator),
    newOwnerPublicKey: new PublicKey(newOwnerPublicKey),
  };

  const transaction = await sdkClient.nominateNewOwner({
    programId: programAddressPublicKey,
    provider,
    newOwnerPublicKey: keys.newOwnerPublicKey,
    creator: keys.creator,
  });

  return transaction;
};

export const acceptOwnershipNomination = async ({ formData, provider, sdkClient }: AcceptOwnershipParams) => {
  const { newOwnerPublicKey } = formData.args;
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

  const keys = {
    newOwnerPublicKey: new PublicKey(newOwnerPublicKey),
  };

  const transaction = await sdkClient.acceptNewOwnerNomination({
    programId: programAddressPublicKey,
    provider,
    newOwnerPublicKey: keys.newOwnerPublicKey,
  });

  return transaction;
};
