import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction, TransactionInstruction } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { createPool } from '@/helpers/pool-initialization';
import { initializePoolArgsSchema } from '@/types';

const CreateLbp = () => {
  const [poolAddress, setPoolAddress] = useState<string>();
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
      setPoolAddress(data.poolPda.toBase58());
      const confirmation = await signAndSendCreatePoolTransaction(data.transactionInstruction);
      console.log('Success', confirmation);
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField
          label="creator address"
          placeholder="creator - pubkey"
          {...register('args.creator', { required: true })}
        />
        <TextField type="text" placeholder="shareTokenMint - pubkey" {...register('args.shareTokenMint')} />
        <TextField type="text" placeholder="assetTokenMint - pubkey" {...register('args.assetTokenMint', {})} />
        <TextField type="number" placeholder="assets - number" {...register('args.assets')} />
        <TextField type="number" placeholder="shares - number" {...register('args.shares', {})} />
        <TextField type="number" placeholder="maxSharesOut - number" {...register('args.maxSharesOut', {})} />
        <TextField type="number" placeholder="maxSharePrice - number" {...register('args.maxSharePrice', {})} />
        <TextField type="number" placeholder="maxAssetsIn - number" {...register('args.maxAssetsIn', {})} />
        <TextField
          type="number"
          placeholder="startWeightBasisPoints - number"
          {...register('args.startWeightBasisPoints', {})}
        />
        <TextField
          type="number"
          placeholder="endWeightBasisPoints - number"
          {...register('args.endWeightBasisPoints', {})}
        />
        <TextField type="number" placeholder="saleTimeStart - number" {...register('args.saleStartTime', {})} />
        <TextField type="number" placeholder="saleTimeEnd - number" {...register('args.saleEndTime', {})} />

        <Button variant="contained" type="submit">
          Submit
        </Button>
      </form>
      {poolAddress && <Typography>Pool address: {poolAddress}</Typography>}
    </Box>
  );
};

export default CreateLbp;
