import {
  FjordClientSdk,
  INITIALIZE_LBP_IDL,
  InitializePoolArgs,
  InitializePoolParams,
  InitializePoolPublicKeys,
} from '@fjord-foundry/solana-sdk-client';
import { zodResolver } from '@hookform/resolvers/zod';
import * as anchor from '@project-serum/anchor';
import { BN } from '@project-serum/anchor';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { AnchorWallet, useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionInstruction, Transaction, Connection } from '@solana/web3.js';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { hoursToSeconds } from 'date-fns';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

interface InitializePoolParamz extends InitializePoolPublicKeys, InitializePoolArgs {
  wallet: AnchorWallet;
  connection: Connection;
}

const TIME_OFFSET = 1_000;
const ONE_DAY_SECONDS = hoursToSeconds(24);
const PERCENTAGE_BASIS_POINTS = 100;

const DEFAULT_SALE_START_TIME_BN = new BN(new Date().getTime() / 1000 + TIME_OFFSET);

const DEFAULT_SALE_END_TIME_BN = DEFAULT_SALE_START_TIME_BN.add(new BN(ONE_DAY_SECONDS));

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
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  console.log(publicKey ? publicKey.toBase58() : '');
  const wallet = useAnchorWallet();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof initializePoolArgsSchema>>({
    resolver: zodResolver(initializePoolArgsSchema),
  });

  const createPool = async (formData: z.infer<typeof initializePoolArgsSchema>) => {
    if (!wallet || !connection) {
      throw new Error('Wallet not connected');
    }

    const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
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

    const sdkClient = await FjordClientSdk.create(true, WalletAdapterNetwork.Devnet);

    const response = await sdkClient.createPool({ programId: programAddressPublicKey, keys, args, provider });

    return response;
  };

  const signTransactionA = async (transactionInstruction: TransactionInstruction) => {
    const transaction = new anchor.web3.Transaction({
      feePayer: publicKey,
      recentBlockhash: (await connection.getRecentBlockhash()).blockhash,
    });

    transaction.add(transactionInstruction);

    if (!wallet) {
      throw new Error('Wallet not connected');
    }
    try {
      if (!transaction || !sendTransaction) throw new Error('Transaction not found');
      const txid = await sendTransaction(transaction, connection);

      alert(`Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
      console.log(`Transaction submitted: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
      return txid;
    } catch (error) {
      console.error(error);
    }
  };

  const createPoolMutation = useMutation({
    mutationFn: createPool,
    onSuccess: async (data) => {
      try {
        console.log(data);
        const transaction = await signTransactionA(data);
        console.log(transaction);
      } catch (error) {
        console.error(error);
      }
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
