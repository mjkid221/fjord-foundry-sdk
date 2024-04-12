// import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { zodResolver } from '@hookform/resolvers/zod';
// import * as anchor from '@project-serum/anchor';
import { BN } from '@project-serum/anchor';
// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { DEFAULT_SALE_END_TIME_BN, DEFAULT_SALE_START_TIME_BN, PERCENTAGE_BASIS_POINTS } from '@/constants';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { initializePoolArgsSchema } from '@/types';

const CreateLbp = () => {
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);
  console.log('sdkClient', sdkClient);
  console.log('provider', provider);

  const wallet = useAnchorWallet();

  const { register, handleSubmit } = useForm<z.infer<typeof initializePoolArgsSchema>>({
    resolver: zodResolver(initializePoolArgsSchema),
  });

  const createPool = async (formData: z.infer<typeof initializePoolArgsSchema>) => {
    if (!wallet || !connection || !provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }

    // const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
    const programAddressPublicKey = new PublicKey('AXRGWPXpgTKK9NrqLji4zbPeyiiDp2gkjLGUJJunLKUm');
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
    const saleStartTime = DEFAULT_SALE_START_TIME_BN;
    const saleEndTime = DEFAULT_SALE_END_TIME_BN;

    const keys = {
      creator,
      shareTokenMint,
      assetTokenMint,
    };

    const args = {
      assets,
      shares,
      maxAssetsIn,
      maxSharePrice,
      maxSharesOut,
      startWeightBasisPoints,
      endWeightBasisPoints,
      saleStartTime,
      saleEndTime,
    };

    // const sdkClient = await FjordClientSdk.create(true, WalletAdapterNetwork.Devnet);

    const { transactionInstruction, poolPda } = await sdkClient.createPoolTransaction({
      programId: programAddressPublicKey,
      keys,
      args,
      provider,
    });

    await signTransaction(transactionInstruction);

    const pool = await sdkClient.retrievePoolData(poolPda, programAddressPublicKey, provider);

    return pool;
  };

  const signTransaction = async (transactionInstruction: TransactionInstruction) => {
    const transaction = new Transaction().add(transactionInstruction);

    if (!wallet) {
      throw new Error('Wallet not connected');
    }

    const {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    try {
      if (!transaction || !sendTransaction) throw new Error('Transaction not found');

      const txid = await sendTransaction(transaction, connection, { minContextSlot });

      console.log(`Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`);

      const confirmation = await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature: txid });

      console.log('Transaction confirmed:', confirmation);
      return { txid, confirmation };
    } catch (error) {
      console.error(error);
    }
  };

  const createPoolMutation = useMutation({
    mutationFn: createPool,
    onSuccess: async (data) => {
      console.log('Success', data);
    },
    onError: (error) => console.log('Error', error),
  });

  const onSubmit = (data: z.infer<typeof initializePoolArgsSchema>) => {
    createPoolMutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" placeholder="creator - pubkey" {...register('args.creator', { required: true })} />
      <input type="text" placeholder="shareTokenMint - pubkey" {...register('args.shareTokenMint')} />
      <input type="text" placeholder="assetTokenMint - pubkey" {...register('args.assetTokenMint', {})} />
      <input type="number" placeholder="assets - number" {...register('args.assets')} />
      <input type="number" placeholder="shares - number" {...register('args.shares', {})} />
      <input type="number" placeholder="maxSharesOut - number" {...register('args.maxSharesOut', {})} />
      <input type="number" placeholder="maxSharePrice - number" {...register('args.maxSharePrice', {})} />
      <input type="number" placeholder="maxAssetsIn - number" {...register('args.maxAssetsIn', {})} />
      <input
        type="number"
        placeholder="startWeightBasisPoints - number"
        {...register('args.startWeightBasisPoints', {})}
      />
      <input type="number" placeholder="endWeightBasisPoints - number" {...register('args.endWeightBasisPoints', {})} />
      <input type="number" placeholder="saleTimeStart - number" {...register('args.saleStartTime', {})} />
      <input type="number" placeholder="saleTimeEnd - number" {...register('args.saleEndTime', {})} />

      <button type="submit">Submit</button>
    </form>
  );
};

export default CreateLbp;
