import { zodResolver } from '@hookform/resolvers/zod';
import * as anchor from '@project-serum/anchor';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionInstruction, Transaction } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Validation for InitializePoolArgs
const initializePoolArgsSchema = z.object({
  args: z.object({
    creator: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'Creator must be a valid Solana public key' },
    ),
    shareTokenMint: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'Share Token Mint must be a valid Solana public key' },
    ),
    assetTokenMint: z.string().refine(
      (val) => {
        try {
          return new PublicKey(val);
        } catch (error) {
          return false;
        }
      },
      { message: 'Asset Token Mint must be a valid Solana public key' },
    ),
    assets: z.string(), // Assuming BN can be represented as a number
    shares: z.string(),
    virtualAssets: z.string().optional(),
    virtualShares: z.string().optional(),
    maxSharePrice: z.string(),
    maxSharesOut: z.string(),
    maxAssetsIn: z.string(),
    startWeightBasisPoints: z.string(),
    endWeightBasisPoints: z.string(),
    saleStartTime: z.string(),
    saleEndTime: z.string(),
    vestCliff: z.string().optional(),
    vestEnd: z.string().optional(),
    whitelistMerkleRoot: z.array(z.string()).optional(),
    sellingAllowed: z.boolean().optional(),
  }),
});

// interface InitializePoolPublicKeysType extends z.TypeOf<typeof initializePoolPublicKeysSchema> {}

export interface InitializePoolArgsType extends z.TypeOf<typeof initializePoolArgsSchema> {}

const CreateLbp = () => {
  const { publicKey, sendTransaction, wallet } = useWallet();
  const { connection } = useConnection();

  // const wallet = useAnchorWallet();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof initializePoolArgsSchema>>({
    resolver: zodResolver(initializePoolArgsSchema),
  });

  const createPool = async (formData: z.infer<typeof initializePoolArgsSchema>) => {
    const { data } = await axios.post<TransactionInstruction>('/api/write/solana/create-pool', {
      ...formData,
    });

    return data;
  };

  const signTransaction = async (transactionInstruction: TransactionInstruction) => {
    const transaction = new anchor.web3.Transaction({
      // feePayer: publicKey,
      recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
    });

    transaction.add(transactionInstruction);

    console.log(transaction);

    try {
      const transactionId = await sendTransaction(transaction, connection);

      console.log(transactionId);
      return transactionId;
    } catch (error) {
      console.error(error);
    }
  };

  const createPoolMutation = useMutation({
    mutationFn: createPool,
    onSuccess: async (data) => {
      const transaction = await signTransaction(data);
      console.log(transaction);
    },
    onError: (error) => console.log('Error', error),
  });

  const onSubmit = (data: z.infer<typeof initializePoolArgsSchema>) => {
    console.log(data);
    createPoolMutation.mutate(data);
  };
  console.log(errors);

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
