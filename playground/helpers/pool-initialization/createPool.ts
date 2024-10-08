import { FjordClientSdk, InitializePoolResponse } from '@fjord-foundry/solana-sdk-client';
import { AnchorProvider, BN } from '@coral-xyz/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { z } from 'zod';

import { PERCENTAGE_BASIS_POINTS } from '@/constants';
import { initializePoolArgsSchema } from '@/types';

type CreatePoolParams = {
  formData: z.infer<typeof initializePoolArgsSchema>;
  connection: Connection;
  provider: AnchorProvider;
  sdkClient: FjordClientSdk;
};

/**
 * Asynchronously creates a new Fjord pool using the provided parameters.
 *
 * @param {CreatePoolParams} params - An object containing the following properties:
 *   * **formData:** The parsed and validated form data (inferred from `initializePoolArgsSchema`).
 *   * **connection:** An established Solana connection object.
 *   * **provider:** An AnchorProvider instance.
 *   * **sdkClient:** An instance of the FjordClientSdk.
 *
 * @returns {Promise<InitializePoolResponse>} A promise resolving to the Fjord `InitializePoolResponse` object.
 *
 * @throws {Error} If wallet is not connected (connection, provider, or sdkClient are missing).
 *
 * @example
 * ```ts
 * const myFormData = ... // Initialize with your form data
 * const { connection } = useConnection(); // Your Solana connection object
 * const { sdkClient, provider } = useContext(SolanaSdkClientContext); // Your Solana SDK client and provider
 *
 *
 * const createPoolMutation = useMutation({
 *   mutationFn: createPool,
 *   onSuccess: async (data) => {
 *     await yourSignAndSendTransactionFunction(data.transactionInstruction);
 *   },
 *   onError: (error) => console.log('Error', error),
 * });
 *
 * const onSubmit = (data: z.infer<typeof initializePoolArgsSchema>) => {
 *  if (!connection || !provider || !sdkClient) {
 *    throw new Error('Wallet not connected');
 *  }
 *   createPoolMutation.mutate({ formData: myFormData, connection, provider, sdkClient });
 * };
 * ```
 */
export const createPool = async ({
  formData,
  connection,
  provider,
  sdkClient,
}: CreatePoolParams): Promise<InitializePoolResponse> => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  const creator = new PublicKey(formData.args.creator);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);

  const assets = new BN(formData.args.assets);
  const shares = new BN(formData.args.shares);
  const maxAssetsIn = new BN(formData.args.maxAssetsIn);
  const maxSharePrice = new BN(formData.args.maxSharePrice);
  const maxSharesOut = new BN(formData.args.maxSharesOut);
  const startWeightBasisPoints = Number(formData.args.startWeightBasisPoints) * PERCENTAGE_BASIS_POINTS;
  const endWeightBasisPoints = Number(formData.args.endWeightBasisPoints) * PERCENTAGE_BASIS_POINTS;
  const saleStartTime = new BN(formData.args.saleStartTime);
  const saleEndTime = new BN(formData.args.saleEndTime);
  const sellingAllowed = formData.args.sellingAllowed ?? false;
  const virtualAssets = formData.args.virtualAssets ? new BN(formData.args.virtualAssets) : undefined;
  const virtualShares = formData.args.virtualShares ? new BN(formData.args.virtualShares) : undefined;

  const keys = {
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    salt: formData.args.salt,
    assets,
    shares,
    maxAssetsIn,
    maxSharePrice,
    maxSharesOut,
    startWeightBasisPoints,
    endWeightBasisPoints,
    saleStartTime,
    saleEndTime,
    sellingAllowed,
    virtualAssets,
    virtualShares,
  };

  const transaction = await sdkClient.createPoolTransaction({
    keys,
    args,
    provider,
  });

  return transaction;
};
