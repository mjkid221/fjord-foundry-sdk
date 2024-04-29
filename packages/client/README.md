# @fjord-foundry/solana-sdk-client

## Table of Contents

- [Description](#description)
- [Installation](#installation)
  - [npm](#npm)
  - [Yarn](#yarn)
  - [pnpm](#pnpm)
- [Usage](#usage)
- [API](#api)
  - [Write Methods](#write-methods)
    - [Initialize Liquidity Bootstrap Pool](#initialize-liquidity-bootstrap-pool)
    - [Buy Operations](#buy-operations)
      - [Swap Assets For Exact Shares](#createswapassetsforexactsharestransaction)
      - [Swap Exact Assets For Shares](#createswapexactassetsforsharestransaction)
    - [Sell Operations](#sell-operations)
      - [Swap Exact Shares for Assets](#createswapexactsharesforassetsinstruction)
      - [Swap Shares for Exact Assets](#createswapsharesforexactassetsinstruction)
    -[Pool Management](#pool-management)
      -[Pause/Unpause](#pausepool-and-unpausepool)
    - [Admin](#admin)
      - [Nominate New Owner](#nominatenewowner)
      - [Accept New Owner Nomination](#acceptnewownernomination)
      - [Set New Pool Fees](#setnewpoolfees)
      - [Set Treasury Fee Recipients](#settreasuryfeerecipients)
  - [Read Methods](#read-methods)
    - [Retrieve All Pool Data](#retrieve-all-pool-data)
    - [Retrieve Specific Pool Data Value](#retrieve-specific-pool-data-value)
- [Enums](#enums)
  - [PoolDataValueKey](#pooldatavaluekey)
- [Features](#features)
- [License](#license)

## Description

TODO: Fill in description here.

## Installation

Install the package:

### npm

```bash
npm install @fjord-foundry/solana-sdk-client
```

### Yarn

```bash
yarn add @fjord-foundry/solana-sdk-client
```

### pnpm

```bash
pnpm add @fjord-foundry/solana-sdk-client
```

## Usage

To get started with the @fjord-foundry/solana-sdk-client, first import the SDK into your project:

```ts
import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
```

Then, you need to initialize the client using the `create` method.

**Parameters**

- `solanaNetwork` (WalletAdapterNetwork):
  - Specifies the Solana network (e.g., 'mainnet-beta', 'devnet', or 'testnet').
- `loggingEnabled` (boolean)
  - (optional: default = `false`) An optional boolean that enables sdk logging for debugging purposes.

**Returns**

- **`Promise<FjordClientSdk>`**: A promise that resolves to a new FjordClientSdk instance.

**Example (Solana Chain)**

```ts
import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

const clientSdk = new FjordClientSdk(WalletAdapterNetwork.Devnet)

```

## API

The FjordClientSdk provides a suite of methods to interact with blockchain contracts, specifically tailored for LBP (Liquidity Bootstrapping Pool) operations. Below are the methods available in the SDK:

## Write Methods

### Initialize Liquidity Bootstrap Pool

#### `async createPoolTransaction({ keys, args, programId, provider }: CreatePoolClientParams)`

This method is responsible for initializing a new liquidity bootstrapping pool (LBP) on the Solana blockchain using the Fjord Client SDK.

**Parameters**

- `poolCreationParams` (CreatePoolClientParams): An object containing the following properties:
  - keys: An object with public keys for the creator, share token mint, etc. (see InitializePoolPublicKeys type below).
  - args: An object with pool initialization arguments (see InitializePoolArgs type below).
  - programId: The PublicKey of your Solana program.
  - provider: An Anchor Provider for interacting with Solana.

**Returns**

- `InitializePoolResponse`: The `createPoolTransaction` method returns a promise resolving to an `InitializePoolResponse` object. This object has the following properties:
  - `transactionInstruction` (TransactionInstruction): The Solana transaction instruction for initializing the pool. This can be signed and submitted to the network.
  - `poolPda` (PublicKey): The Program Derived Address (PDA) of the newly created LBP pool. This can be used for further interactions with the pool.

**Prerequisites**

- Connected Wallet: A connected Solana wallet is required.

**Important Notes**

- Error Handling: Be sure to handle potential errors thrown by this method.
- Transaction Confirmation: Consider adding instructions on confirming the pool creation transaction on Solana.

**Example**

```ts

import { BN } from "@coral-xyz/anchor";
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { AnchorProvider } from '@project-serum/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useMutation } from '@tanstack/react-query';

const PERCENTAGE_BASIS_POINTS = 100;
const DEFAULT_SALE_START_TIME_BN = new BN(
  new Date().getTime() / 1000 + 1000
);
const DEFAULT_SALE_END_TIME_BN = DEFAULT_SALE_START_TIME_BN.add(
  new BN(hoursToSeconds(24))
);


export const createPool = async ({
  formData,
  connection,
  provider,
  sdkClient,
}: CreatePoolParams): Promise<InitializePoolResponse> => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

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

  const transaction = await sdkClient.createPoolTransaction({
    programId: programAddressPublicKey,
    keys,
    args,
    provider,
  });

  return transaction;
};

  const { connection } = useConnection()

  const wallet = useAnchorWallet();

  const sdkClient = await FjordClientSdk.create(true, WalletAdapterNetwork.Devnet);

  const provider = new AnchorProvider(connection, wallet, AnchorProvider.defaultOptions());

  const createPoolMutation = useMutation({
    mutationFn: createPool,
    onSuccess: async (data) => {
      // Your signing and sending transaction logic here.
    },
    onError: (error) => console.log('Error', error),
  });

  const onSubmit = (data) => {
    if (!connection || !provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    createPoolMutation.mutate({ formData: data, connection, provider, sdkClient });
  };

```

### Buy Operations

#### `createSwapAssetsForExactSharesTransaction`

This method prepares a Solana transaction instruction for performing a "swap assets for exact shares" operation within a Fjord liquidity bootstrapping pool (LBP). This allows a user to exchange a known quantity of the pool's underlying asset for a precise amount of pool shares.

**Parameters**

- `keys` (SwapExactSharesForAssetsOperationPublicKeys):
  - `userPublicKey`: The public key of the wallet performing the swap.
  - `creator`: The public key of the wallet that created the pool.
  - `referrer` (Optional): The public key of the referrer (if applicable).
  - `shareTokenMint`: The public key of the mint for the pool's share tokens.
  - `assetTokenMint`: The public key of the mint for the pool's underlying asset.
- `args` (SwapExactSharesForAssetsOperationArgs):
  - `poolPda`: The Program Derived Address (PDA) of the pool.
  - `sharesAmountOut`: The desired quantity of shares to receive.
- `programId` (PublicKey): The PublicKey of your Solana program.
- `provider` (AnchorProvider): An Anchor Provider for interacting with Solana.

**Returns**

- `TransactionInstruction`: The Solana transaction instruction for swapping assets for exact shares within the specified LBP. This needs to be signed and submitted to the network for execution.

**Prerequisites**

- Connected Wallet: A connected Solana wallet is required.

**Examples**

```ts
// Helper Function
export const swapAssetsForExactShares = async ({
  formData,
  connection,
  provider,
  sdkClient,
}: SwapAssetsForSharesParams): Promise<TransactionInstruction> => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  const programAddressPublicKey = new PublicKey('...'); // Your program's ID
  const creator = new PublicKey(formData.args.creator);
  const userPublicKey = new PublicKey(formData.args.userPublicKey); 
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const poolPda = new PublicKey(formData.args.poolPda);
  const sharesAmountOut = new BN(formData.args.sharesAmountOut);

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    sharesAmountOut,
  };

  const transaction = await sdkClient.createSwapAssetsForExactSharesTransaction({
    programId: programAddressPublicKey,
    keys,
    args,
    provider,
  });

  return transaction;
};

export const getPoolDataValue = async ({ poolPda, programId, sdkClient, valueKey }: GetSinglePoolDataValueParams) => {
  return await sdkClient.retrieveSinglePoolDataValue({ poolPda, programId, valueKey });
};

```

```ts
// Front-end implementation
import { swapAssetsForExactShares, getPoolDataValue } from "path-to-your-helpers"

const SwapAssetsForExactShares = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  const wallet = useAnchorWallet();

  const { register, handleSubmit, setValue } = useForm<z.infer<typeof swapAssetsForSharesArgsSchema>>({
    resolver: zodResolver(swapAssetsForSharesArgsSchema),
  });
  

  useQuery({
    queryKey: ['shareTokenAddress'],
    queryFn: async () => {
      if (!sdkClient || !poolAddress) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);
      const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

      const data = await getPoolDataValue({
        poolPda,
        programId: programAddressPublicKey,
        sdkClient,
        valueKey: PoolDataValueKey.ShareToken,
      });
      setValue('args.shareTokenMint', data as string);
      setValue('args.poolPda', poolAddress);

      return data;
    },
    enabled: !!poolAddress,
  });

  useQuery({
    queryKey: ['assetTokenAddress'],
    queryFn: async () => {
      if (!sdkClient || !poolAddress) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);
      const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

      const data = await getPoolDataValue({
        poolPda,
        programId: programAddressPublicKey,
        sdkClient,
        valueKey: PoolDataValueKey.AssetToken,
      });
      setValue('args.assetTokenMint', data as string);

      return data;
    },
    enabled: !!poolAddress,
  });

  const swapAssetsForExactSharesMutation = useMutation({
    mutationFn: swapAssetsForExactShares,
    onSuccess: async (data) => {
      const confirmation = await signAndSendSwapTransaction(data, wallet, connection, sendTransaction);
      console.log('Success', confirmation);
    },
    onError: (error) => console.log('Error', error),
  });

  const onSubmit = async (data: z.infer<typeof swapAssetsForSharesArgsSchema>) => {
    if (!connection || !provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    swapAssetsForExactSharesMutation.mutate({ formData: data, connection, provider, sdkClient });
  };
  return ( **Your Form Logic Here** )
}
```

#### `createSwapExactAssetsForSharesTransaction`

This method prepares a Solana transaction instruction for performing a "swap exact assets for shares" operation within a Fjord liquidity bootstrapping pool (LBP). This allows a user to exchange a precise quantity of the pool's underlying asset for a calculated amount of pool shares.

**Parameters**

- `keys` (SwapSharesForExactAssetsOperationPublicKeys):
  - `userPublicKey`: The public key of the wallet performing the swap.
  - `creator`: The public key of the wallet that created the pool.
  - `referrer` (Optional): The public key of the referrer (if applicable).
  - `shareTokenMint`: The public key of the mint for the pool's share tokens.
  - `assetTokenMint`: The public key of the mint for the pool's underlying asset.
- `args` (SwapSharesForExactAssetsOperationArgs):
  - `poolPda`: The Program Derived Address (PDA) of the pool.
  - `assetsAmountIn`: The exact quantity of assets to use in the swap.
- `programId` (PublicKey): The PublicKey of your Solana program.
- `provider` (AnchorProvider): An Anchor Provider for interacting with Solana.

**Returns**

- `TransactionInstruction`: The Solana transaction instruction for swapping exact assets for a calculated amount of shares within the specified LBP. This needs to be signed and submitted to the network for execution.

**Prerequisites**

- Connected Wallet: A connected Solana wallet is required.

**Examples**

```ts
// Helper functions

export const swapExactAssetsForShares = async ({
  formData,
  connection,
  provider,
  sdkClient,
}: SwapAssetsForSharesParams): Promise<TransactionInstruction> => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  const programAddressPublicKey = new PublicKey('...'); // Your program's ID
  const creator = new PublicKey(formData.args.creator);
  const userPublicKey = new PublicKey(formData.args.userPublicKey);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const poolPda = new PublicKey(formData.args.poolPda);
  const assetsAmountIn = new BN(formData.args.assetsAmountIn);

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    assetsAmountIn,
  };

  const transaction = await sdkClient.createSwapExactAssetsForSharesTransaction({
    programId: programAddressPublicKey,
    keys,
    args,
    provider,
  });

  return transaction;
};

export const getPoolDataValue = async ({ poolPda, programId, sdkClient, valueKey }: GetSinglePoolDataValueParams) => {
  return await sdkClient.retrieveSinglePoolDataValue({ poolPda, programId, valueKey });
};
```

```ts
// Front-end example
import { swapExactAssetsForShares, getPoolDataValue } from "path-to-your-helpers"

const SwapExactAssetsForShares = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const { sendTransaction } = useWallet();
  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);

  const wallet = useAnchorWallet();

  const { register, handleSubmit, setValue } = useForm<z.infer<typeof swapAssetsForSharesArgsSchema>>({
    resolver: zodResolver(swapAssetsForSharesArgsSchema),
  });
  

  useQuery({
    queryKey: ['shareTokenAddress'],
    queryFn: async () => {
      if (!sdkClient || !poolAddress) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);
      const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

      const data = await getPoolDataValue({
        poolPda,
        programId: programAddressPublicKey,
        sdkClient,
        valueKey: PoolDataValueKey.ShareToken,
      });
      setValue('args.shareTokenMint', data as string);
      setValue('args.poolPda', poolAddress);

      return data;
    },
    enabled: !!poolAddress,
  });

  useQuery({
    queryKey: ['assetTokenAddress'],
    queryFn: async () => {
      if (!sdkClient || !poolAddress) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);
      const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

      const data = await getPoolDataValue({
        poolPda,
        programId: programAddressPublicKey,
        sdkClient,
        valueKey: PoolDataValueKey.AssetToken,
      });
      setValue('args.assetTokenMint', data as string);

      return data;
    },
    enabled: !!poolAddress,
  });

  const swapAssetsForExactSharesMutation = useMutation({
    mutationFn: swapExactAssetsForShares,
    onSuccess: async (data) => {
      const confirmation = await signAndSendSwapTransaction(data, wallet, connection, sendTransaction);
      console.log('Success', confirmation);
    },
    onError: (error) => console.log('Error', error),
  });

  const onSubmit = async (data: z.infer<typeof swapAssetsForSharesArgsSchema>) => {
    if (!connection || !provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    swapAssetsForExactSharesMutation.mutate({ formData: data, connection, provider, sdkClient });
  };
  return ( **Your Form Logic Here** )
}
```

### Sell Operations

#### `createSwapExactSharesForAssetsInstruction`

This method prepares a Solana transaction instruction for performing a "swap exact shares for assets" operation within a Fjord liquidity bootstrapping pool (LBP). This allows a user to exchange a precise quantity of the pool's share token from their pool balance for a calculated amount of asset tokens.

**Parameters**

- `keys` (SwapExactSharesForAssetsOperationPublicKeys):
  - `userPublicKey`: The public key of the wallet performing the swap.
  - `creator`: The public key of the wallet that created the pool.
  - `shareTokenMint`: The public key of the mint for the pool's share tokens.
  - `assetTokenMint`: The public key of the mint for the pool's underlying asset.
- `args` (SwapExactSharesForAssetsOperationArgs):
  - `poolPda`: The Program Derived Address (PDA) of the pool.
  - `sharesAmountOut`: The exact quantity of shares to use in the swap.
- `programId` (PublicKey): The PublicKey of your Solana program.
- `provider` (AnchorProvider): An Anchor Provider for interacting with Solana.

**Returns**

- `TransactionInstruction`: The Solana transaction instruction for swapping exact shares for a calculated amount of assets within the specified LBP. This needs to be signed and submitted to the network for execution.

**Prerequisites**

- Connected Wallet: A connected Solana wallet is required.

**Example**

```ts
export const swapExactSharesForAssets = async ({
  formData,
  connection,
  provider,
  sdkClient,
}: SwapAssetsForSharesParams): Promise<TransactionInstruction> => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  const programAddressPublicKey = new PublicKey('...'); // Your program's ID
  const creator = new PublicKey(formData.args.creator);
  const userPublicKey = new PublicKey(formData.args.userPublicKey); 
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const poolPda = new PublicKey(formData.args.poolPda);
  const sharesAmountOut = new BN(formData.args.sharesAmountOut);

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    sharesAmountOut,
  };

  const transaction = await sdkClient.createSwapExactSharesForAssetsTransaction({
    programId: programAddressPublicKey,
    keys,
    args,
    provider,
  });

  return transaction;
};

```

#### `createSwapSharesForExactAssetsInstruction`

This method prepares a Solana transaction instruction for performing a "swap shares for exact assets" operation within a Fjord liquidity bootstrapping pool (LBP). This allows a user to exchange a precise quantity of the pool's asset token  for a calculated amount of share tokens from their pool balance.

**Parameters**

- `keys` (SwapSharesForExactAssetsOperationPublicKeys):
  - `userPublicKey`: The public key of the wallet performing the swap.
  - `creator`: The public key of the wallet that created the pool.
  - `shareTokenMint`: The public key of the mint for the pool's share tokens.
  - `assetTokenMint`: The public key of the mint for the pool's underlying asset.
- `args` (SwapSharesForExactAssetsOperationArgs):
  - `poolPda`: The Program Derived Address (PDA) of the pool.
  - `assetsAmountIn`: The exact quantity of assets to use in the swap.
- `programId` (PublicKey): The PublicKey of your Solana program.
- `provider` (AnchorProvider): An Anchor Provider for interacting with Solana.

**Returns**

- `TransactionInstruction`: The Solana transaction instruction for swapping shares for a calculated amount of exact assets within the specified LBP. This needs to be signed and submitted to the network for execution.

**Prerequisites**

- Connected Wallet: A connected Solana wallet is required.

**Example**

```ts
export const swapSharesForExactAssets = async ({
  formData,
  connection,
  provider,
  sdkClient,
}: SwapAssetsForSharesParams): Promise<TransactionInstruction> => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  const programAddressPublicKey = new PublicKey('...'); // Your program's ID
  const creator = new PublicKey(formData.args.creator);
  const userPublicKey = new PublicKey(formData.args.userPublicKey); 
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const poolPda = new PublicKey(formData.args.poolPda);
  const assetsAmountIn = new BN(formData.args.assetsAmountIn);

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    assetsAmountIn,
  };

  const transaction = await sdkClient.createSwapSharesForExactAssetsTransaction({
    programId: programAddressPublicKey,
    keys,
    args,
    provider,
  });

  return transaction;
};

```

### Redemption Operations

#### `closePoolTransaction`

This method facilitates the closing of a liquidity bootstrapping pool (LBP) on the Solana blockchain.

**Parameters**

- `params` (CloseOperationPublicKeys)
  - `keys`
    - `userPublicKey`: The public key of the wallet performing the close operation.
    - `creator`: The public key of the wallet that created the pool.
    - `shareTokenMint`: The public key of the mint for the pool's share tokens.
    - `assetTokenMint`: The public key of the mint for the pool's underlying asset.
  - `args`
    - `poolPda`: The Program Derived Address (PDA) of the pool.
  - `programId` (PublicKey): The PublicKey of your Solana program.
  - `provider` (AnchorProvider): An Anchor Provider for interacting with Solana.

**Returns**

`TransactionInstruction[]`: An array of transaction instructions required to perform the closure of an LBP.

**Examples**

```ts
// Example helpers

import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { ClosePoolParams } from '@/types';
import { PublicKey } from '@solana/web3.js';

export const closeLbpPool = async ({ formData, connection, provider, sdkClient }: ClosePoolParams) => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  // Get the program address
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);
  const creator = new PublicKey(formData.args.creator);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const userPublicKey = new PublicKey(formData.args.userPublicKey);
  const poolPda = new PublicKey(formData.args.poolPda);

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
  };

  const transactions = await sdkClient.closePoolTransaction({
    programId: programAddressPublicKey,
    keys,
    args,
    provider,
  });

  return transactions;
};


/**
 * Sign and send a transaction
 * @param transactionInstructions - Either a single or multiple transaction instructions
 * @param wallet - Anchor wallet instance
 * @param connection - Solana connection provider
 * @param sendTransaction - From the wallet adapter
 */
export const signAndSendTransaction = async (
  transactionInstructions: TransactionInstruction[] | TransactionInstruction,
  wallet: AnchorWallet | undefined,
  connection: Connection,
  sendTransaction: (
    transaction: Transaction,
    connection: Connection,
    options?: { minContextSlot?: number },
  ) => Promise<string>,
) => {
  const transaction = new Transaction().add(
    ...(Array.isArray(transactionInstructions) ? transactionInstructions : [transactionInstructions]),
  );

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

```

```ts
// Example react component

import WalletNotConnected from '@/components/WalletNotConnected';
import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { SolanaSdkClientContext } from '@/context/SolanaSdkClientContext';
import { getPoolDataValue } from '@/helpers';
import { closeLbpPool } from '@/helpers/redemption/closeLbpPool';
import { signAndSendTransaction } from '@/helpers/shared';
import { usePoolAddressStore } from '@/stores/usePoolAddressStore';
import { closePoolArgsSchema } from '@/types';
import { PoolDataValueKey } from '@fjord-foundry/solana-sdk-client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useConnection, useAnchorWallet, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useContext } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export const ClosePool = () => {
  const poolAddress = usePoolAddressStore((state) => state.poolAddress);

  const { connection } = useConnection();

  const { sdkClient, provider } = useContext(SolanaSdkClientContext);
  const { sendTransaction, publicKey, signTransaction } = useWallet();

  const wallet = useAnchorWallet();

  const { register, handleSubmit, setValue } = useForm<z.infer<typeof closePoolArgsSchema>>({
    resolver: zodResolver(closePoolArgsSchema),
  });

  useQuery({
    queryKey: ['shareTokenAddress'],
    queryFn: async () => {
      if (!sdkClient || !poolAddress) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);
      const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

      const data = await getPoolDataValue({
        poolPda,
        programId: programAddressPublicKey,
        sdkClient,
        valueKey: PoolDataValueKey.ShareToken,
      });
      setValue('args.shareTokenMint', data as string);
      setValue('args.poolPda', poolAddress);

      return data;
    },
    enabled: !!poolAddress,
  });

  useQuery({
    queryKey: ['assetTokenAddress'],
    queryFn: async () => {
      if (!sdkClient || !poolAddress) throw new Error('Provider not found');
      const poolPda = new PublicKey(poolAddress);
      const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

      const data = await getPoolDataValue({
        poolPda,
        programId: programAddressPublicKey,
        sdkClient,
        valueKey: PoolDataValueKey.AssetToken,
      });
      setValue('args.assetTokenMint', data as string);

      return data;
    },
    enabled: !!poolAddress,
  });

  const closePool = useMutation({
    mutationFn: closeLbpPool,
    onSuccess: async (data) => {
      if (!publicKey || !signTransaction) return;
      console.log(data);
      const confirmation = await signAndSendTransaction(data, wallet, connection, sendTransaction);
      console.log('Success', confirmation);
    },
    onError: (error) => console.log('Error', error),
  });

  const onSubmit = async (data: z.infer<typeof closePoolArgsSchema>) => {
    if (!connection || !provider || !sdkClient) {
      throw new Error('Wallet not connected');
    }
    console.log(data);
    closePool.mutate({ formData: data, connection, provider, sdkClient });
  };
  return (
    // Your jsx here
  );
};
```

#### `redeemTokensTransaction`

This method facilitates the redemption of LBP tokens on the Solana blockchain.

**Parameters**

- `params` (RedeemOperationPublicKeys)
  - `keys`
    - `userPublicKey`: The public key of the wallet performing the redeem operation.
    - `creator`: The public key of the wallet that created the pool.
    - `shareTokenMint`: The public key of the mint for the pool's share tokens.
    - `assetTokenMint`: The public key of the mint for the pool's underlying asset.
  - `args`
    - `poolPda`: The Program Derived Address (PDA) of the pool.
    - `isReferred`: A boolean value that indicates if the user was referred to the pool.
  - `programId` (PublicKey): The PublicKey of your Solana program.
  - `provider` (AnchorProvider): An Anchor Provider for interacting with Solana.

**Returns**

- `TransactionInstruction`: The Solana transaction instruction for redeeming LBP tokens. This needs to be signed and submitted to the network for execution.

**Example**

```ts
// Helper function example
import { INITIALIZE_LBP_ADDRESS } from '@/constants';
import { RedeemTokensParams } from '@/types';
import { PublicKey } from '@solana/web3.js';

export const redeemLbpPool = async ({ formData, connection, provider, sdkClient }: RedeemTokensParams) => {
  if (!connection || !provider || !sdkClient) {
    throw new Error('Wallet not connected');
  }

  // Get the program address
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);
  const creator = new PublicKey(formData.args.creator);
  const shareTokenMint = new PublicKey(formData.args.shareTokenMint);
  const assetTokenMint = new PublicKey(formData.args.assetTokenMint);
  const userPublicKey = new PublicKey(formData.args.userPublicKey);
  const poolPda = new PublicKey(formData.args.poolPda);

  const keys = {
    userPublicKey,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const args = {
    poolPda,
    isReferred: formData.args.isReferred,
  };

  const transaction = await sdkClient.redeemTokensTransaction({
    programId: programAddressPublicKey,
    keys,
    args,
    provider,
  });

  return transaction;
};
```

### Pool Management

#### `pausePool` and `unPausePool`

This methods enables an LBP creator to pause or unpause the buy/sell operations of their pool.

**Parameters**

- `args` (PausePoolParams):
  - `poolPda`: The Program Derived Address (PDA) of the pool.
  - `creator`: The public key of the wallet that created the pool.
  - `shareTokenMint`: The public key of the mint for the pool's share tokens.
  - `assetTokenMint`: The public key of the mint for the pool's underlying asset.
- `programId` (PublicKey): The PublicKey of your Solana program.
- `provider` (AnchorProvider): An Anchor Provider for interacting with Solana.

**Returns**

- `TransactionInstruction`: The Solana transaction instruction for pausing or unpausing the specified LBP. This needs to be signed and submitted to the network for execution.

**Prerequisites**

- Connected Wallet: A connected Solana wallet is required.

**Example**

```ts
export const pausePool = async ({ provider, sdkClient, args }: PausePoolParams) => {
  if (!provider || !sdkClient) {
    throw new Error('Required  provider, and sdkClient');
  }

  // Get the program address
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);
  const creator = new PublicKey(args.creator);
  const shareTokenMint = new PublicKey(args.shareTokenMint);
  const assetTokenMint = new PublicKey(args.assetTokenMint);
  const poolPda = new PublicKey(args.poolPda);

  const pausePoolArgs = {
    poolPda,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const transaction = await sdkClient.pausePool({ programId: programAddressPublicKey, args: pausePoolArgs, provider });

  return transaction;
};

export const unpausePool = async ({ provider, sdkClient, args }: PausePoolParams) => {
  if (!provider || !sdkClient) {
    throw new Error('Required  provider, and sdkClient');
  }

  // Get the program address
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);
  const creator = new PublicKey(args.creator);
  const shareTokenMint = new PublicKey(args.shareTokenMint);
  const assetTokenMint = new PublicKey(args.assetTokenMint);
  const poolPda = new PublicKey(args.poolPda);

  const unPausePoolArgs = {
    poolPda,
    creator,
    shareTokenMint,
    assetTokenMint,
  };

  const transaction = await sdkClient.unPausePool({
    programId: programAddressPublicKey,
    args: unPausePoolArgs,
    provider,
  });

  return transaction;
};

```

### Admin

#### `nominateNewOwner`

This method facilitates the nomination of a new owner for the Fjord Foundry liquidity bootstrapping pool (LBP) on Solana. Please ensure the connected wallet has the authority to nominate a new owner for the pool. After the transaction is confirmed, the nominee must run `acceptNewOwnerNomination` in order for the process to be completed.

**Parameters**

- `newOwnerPublicKey`: The public key of the prospective new owner
- `creator`: The public key of the wallet that created the pool.
- `programId` (PublicKey): The PublicKey of your Solana program.
- `provider` (AnchorProvider): An Anchor Provider for interacting with Solana.

**Returns**

- `TransactionInstruction`: The Solana transaction instruction for transferring the ownership of the protocol to prospective new address. This needs to be signed and submitted to the network for execution.

**Example**

```ts
export const nominateNewOwner = async ({ formData, provider, sdkClient }: NominateNewOwnerParams) => {
  const { creator, newOwnerPublicKey } = formData.args;
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS); // The LBP program address

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
```

#### `acceptNewOwnerNomination`

This method facilitates the acceptance of a new owner nomination for a liquidity bootstrapping pool (LBP). The `nominateNewOwner` program method must have been completed before this can be run. Ensure the connected wallet has the authority to accept a new owner nomination for the pool.

**Parameters**

- `newOwnerPublicKey`: The public key of the prospective new owner
- `programId` (PublicKey): The PublicKey of your Solana program.
- `provider` (AnchorProvider): An Anchor Provider for interacting with Solana.

**Returns**

- `TransactionInstruction`: The Solana transaction instruction for transferring the ownership of the protocol to the new address. This needs to be signed and submitted to the network for execution.

**Example**

```ts
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
```

#### `setNewPoolFees`

This method acilitates updating the fees of a liquidity bootstrapping pool (LBP). Please ensure the connected wallet has the authority to modify fees for the pool.

**Parameters**

- `feeParams` (NewFeeParams): Parameters for updating pool fees.
  - `platformFee`(optional): The new platform fee.
  - `referralFee` (optional): The new referral fee.
  - `swapFee` (optional): The new swap fee.
  - `ownerPublicKey`: The public key of the wallet authorized to modify fees.
- `programId` (PublicKey): The PublicKey of your Solana program.
- `provider` (AnchorProvider): An Anchor Provider for interacting with Solana.

*Note*: At least one of the `feeParams` are required.

**Returns**

A transaction instruction for updating the pool's fees. After calling this method, you will need to sign and submit the transaction to the Solana network.

**Example**

```ts
export const setNewPoolFees = async ({ formData, provider, sdkClient }: SetNewPoolFeesParams) => {
  const { ownerPublicKey, platformFee, referralFee, swapFee } = formData;
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

  const keys = {
    ownerPublicKey: new PublicKey(ownerPublicKey),
  };

  const transaction = await sdkClient.setNewPoolFees({
    programId: programAddressPublicKey,
    provider,
    feeParams: {
      ownerPublicKey: keys.ownerPublicKey,
      platformFee: platformFee ? parseFloat(platformFee) : undefined,
      referralFee: referralFee ? parseFloat(referralFee) : undefined,
      swapFee: swapFee ? parseFloat(swapFee) : undefined,
    },
  });

  return transaction;
};
```

#### `setTreasuryFeeRecipients`

This method facilitates updating the treasury fee recipients and distribution for a liquidity bootstrapping pool (LBP).

**Parameters**

- `treasuryFeeRecipientsParams` (TreasuryFeeRecipientsParams): Parameters for updating treasury fee recipients.
  - `swapFeeRecipient` - Public key of the wallet designated to receive swap fees.
  - `feeRecipients` - An array of fee recipient details:
    - `feeRecipient`: The public key of the wallet receiving a portion of fees.
    - `feePercentage`: The percentage of fees (0-100) allocated to this recipient.
  - `creator` - Public key of the wallet authorized to modify fee distribution.
- `programId` (PublicKey): The PublicKey of your Solana program.
- `provider` (AnchorProvider): An Anchor Provider for interacting with Solana.

**Returns**

A transaction instruction for updating treasury fee recipients. After calling this method, you will need to sign and submit the transaction to the Solana network.

**Example**

```ts
export const setNewTreasuryFeeRecipients = async ({
  formData,
  provider,
  sdkClient,
}: SetTreasuryFeeRecipientsParams) => {
  const { swapFeeRecipient, feeRecipients, creator } = formData;
  const programAddressPublicKey = new PublicKey(INITIALIZE_LBP_ADDRESS);

  const keys = {
    swapFeeRecipient: new PublicKey(swapFeeRecipient),
    creator: new PublicKey(creator),
    feeRecipients: feeRecipients.map(({ feeRecipient, feePercentage }) => ({
      feeRecipient: new PublicKey(feeRecipient),
      feePercentage: parseFloat(feePercentage),
    })),
  };

  const transaction = await sdkClient.setTreasuryFeeRecipients({
    programId: programAddressPublicKey,
    provider,
    feeParams: {
      swapFeeRecipient: keys.swapFeeRecipient,
      feeRecipients: keys.feeRecipients,
      creator: keys.creator,
    },
  });

  return transaction;
};
```

## Read Methods

### Retrieve All Pool Data

#### `async retrievePoolData({ poolPda, programId }: RetrievePoolDataParams): Promise<GetPoolDataResponse>`

This method fetches data associated with a liquidity bootstrapping pool (LBP) and formats it for front-end rendering.

**Parameters**

- `poolDataParams` (RetrievePoolDataParams): An object containing:
  - `poolPda` (PublicKey): The Program Derived Address (PDA) of the LBP pool.
  - `programId` (PublicKey): The PublicKey of your Solana program.

**Returns**

`Promise<GetPoolDataResponse>`: A promise resolving to a `GetPoolDataResponse` object. This object contains the fetched and formatted pool data.

**Example**

```ts
import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const sdkClient = await FjordClientSdk.create(true, WalletAdapterNetwork.Devnet);

const { data } = useQuery({
  queryKey: ['pool-args'],
  queryFn: async () => {
    const poolArgs: GetPoolArgs = { 
      poolPda: new PublicKey(poolAddress), // This is the address of the LBP that was created.
      programId: new PublicKey(INITIALIZE_LBP_ADDRESS), // This is the address of the program that created the LBP.
    }; 
    return await sdkClient.retrievePoolData(poolArgs);
  },
  enabled: !!poolAddress, // Ensure poolAddress exists
});

```

### Retrieve Specific Pool Data Value

#### `async retrieveSinglePoolDataValue({ poolPda, programId, provider, connection, valueKey }: RetrieveSinglePoolDataValueParams): Promise<string | number | number[] | boolean>`

This method retrieves a specific piece of data associated with a liquidity bootstrapping pool (LBP).

**Parameters**

- `poolDataParams` (RetrieveSinglePoolDataValueParams): An object containing:
  - `poolPda` (PublicKey): The Program Derived Address (PDA) of the LBP pool.
  - `programId` (PublicKey): The PublicKey of your Solana program.
  - `valueKey` (PoolDataValueKey): A member of the [PoolDataValueKey](#pooldatavaluekey) enum, indicating the specific data value to retrieve.

**Returns**

`Promise<string | number | number[] | boolean>`: A promise resolving to the requested pool data value. The return type varies based on the selected `valueKey`:

- **Strings:** Used for values like the asset token address (base58 format).
- **Numbers:** Used for values like weights, timestamps converted from epoch, etc.
- **Number Arrays:** Potentially used for values like Merkle roots.
- **Booleans:** Used for simple true/false flags.

**Example**

```ts
import { FjordClientSdk, PoolDataValueKey } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

const sdkClient = await FjordClientSdk.create(true, WalletAdapterNetwork.Devnet);

const { data } = useQuery({
  queryKey: ['pool-args'],
  queryFn: async () => {
    const poolArgs: RetrieveSinglePoolDataValueParams = { 
      poolPda: new PublicKey(poolAddress), // This is the address of the LBP that was created.
      programId: new PublicKey(INITIALIZE_LBP_ADDRESS), // This is the address of the program that created the LBP.
      valueKey: PoolDataValueKey.SaleStartTime // This is the key that will query the program value.
    }; 

    const saleStartTime =  await sdkClient.retrieveSinglePoolDataValue(poolArgs);
    return saleStartTime;
  },
  enabled: !!poolAddress, // Ensure poolAddress exists
});

```

**Important Notes:**

- **`PoolDataValueKey` Enum:** Ensure that the `PoolDataValueKey` enum contains all the possible data values that can be retrieved from an LBP pool.
- **Error Handling:**  The `default` case in the `switch` statement throws an error for invalid `valueKey` values.

## Enums

### PoolDataValueKey

Defines keys used to access specific data within an LBP.

- **AssetToken**: Key for the asset token mint.
- **Closed**: Key for determining if the pool is closed.
- **Creator**: Key for the address of the pool's creator.
- **Paused**: Key for the paused status of the pool.
- **EndWeightBasisPoints**: Key for the pool's ending weight (in basis points).
- **MaxAssetsIn**: Key for the maximum amount of assets allowed into the pool.
- **MaxSharePrice**: Key for the maximum price per share.
- **MaxSharesOut**: Key for the maximum amount of shares that can be issued.
- **SaleEndTime**: Key for the pool's sale end time.
- **SaleStartTime**: Key for the pool's sale start time.
- **SellingAllowed**: Key indicating whether selling assets is currently permitted.
- **ShareToken**: Key for the share token mint.
- **StartWeightBasisPoints**: Key for the pool's starting weight (in basis points).
- **TotalPurchased**: Key for the total number of shares purchased.
- **TotalReferred**: Key for the total number of shares referred.
- **TotalSwapFeesAsset**: Key for the total number of fees charged for asset swaps.
- **TotalSwapFeesShare**: Key for the total number of fess charged for share swaps.
- **VestCliff**: Key for the vesting cliff timestamp (if applicable).
- **VestEnd**: Key for the vesting end timestamp (if applicable).
- **VirtualAssets**: Key for the amount of virtual assets (if applicable).
- **VirtualShares**: Key for the number of virtual shares (if applicable).
- **WhitelistMerkleRoot**: Key for the Merkle root used for whitelist-based access control (if applicable).

## Features

TODO

## License

TBA
