import { zodResolver } from '@hookform/resolvers/zod';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { createPool } from '@/helpers/pool-initialization';
import { initializePoolArgsSchema } from '@/types';

const CreateLbp = () => {
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  const wallet = useAnchorWallet();

  const { register, handleSubmit } = useForm<z.infer<typeof initializePoolArgsSchema>>({
    resolver: zodResolver(initializePoolArgsSchema),
  });

  const signAndSendCreatePoolTransaction = async (transactionInstruction: TransactionInstruction) => {
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
      await signAndSendCreatePoolTransaction(data.transactionInstruction);
      console.log('Success', data);
    },
    onError: (error) => console.log('Error', error),
  });

  const onSubmit = (data: z.infer<typeof initializePoolArgsSchema>) => {
    if (!connection || !provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    createPoolMutation.mutate({ formData: data, connection, provider, sdkClient });
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
