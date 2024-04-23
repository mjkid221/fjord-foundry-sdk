# @fjord-foundry/solana-sdk-client

## Table of Contents

- [Description](#description)
- [Installation](#installation)
  - [npm](#npm)
  - [Yarn](#yarn)
  - [pnpm](#pnpm)
- [Usage](#usage)
- [API](#api)
  - [Write Methods Solana](#write-methods-solana)
    - [Initialize Liquidity Bootstrap Pool](#initialize-liquidity-bootstrap-pool)
    - [Buy Operations](#buy-operations)
      - [Swap Assets For Exact Shares](#createswapassetsforexactsharestransaction)
      - [Swap Exact Assets For Shares](#createswapexactassetsforsharestransaction)
  - [Read Methods Solana](#read-methods-solana)
    - [Retrieve All Pool Data](#retrieve-all-pool-data)
    - [Retrieve Specific Pool Data Value](#retrieve-specific-pool-data-value)
  - [Read Methods EVM](#read-methods-evm)
    - [getContractArgs](#get-contract-arguments)
    - [getContractManagerAddress](#get-contract-manager-address)
    - [isPoolClosed](#is-pool-closed)
    - [isSellingAllowed](#is-selling-allowed)
    - [getMaxTotalAssetsIn](#get-max-total-assets-in)
    - [getMaxTotalSharesOut](#get-max-total-shares-out)
    - [getVestingState](#get-vesting-state)
    - [getTotalSharesPurchased](#get-total-shares-purchased)
    - [getReservesAndWeights](#get-reserves-and-weights)
- [Enums](#enums)
  -[PoolDataValueKey](#pooldatavaluekey)
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

- `useSolana` (boolean):
  - true: Creates a Solana-based client enabling interactions with the Solana blockchain.
  - false: Creates a client limited to public, non-Solana operations.
- `solanaNetwork` (WalletAdapterNetwork, optional):
  - Required when useSolana is true.
  - Specifies the Solana network (e.g., 'mainnet-beta', 'devnet', or 'testnet').

**Returns**

- **`Promise<FjordClientSdk>`**: A promise that resolves to a new FjordClientSdk instance.

**Example (Solana Chain)**

```ts
import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

const clientSdk = new FjordClientSdk(true, WalletAdapterNetwork.Devnet)

```

**Example (EVM Chain)**

```ts
import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client'

const myPublicSdk = await FjordClientSdk.create(false); 

```

## API

The FjordClientSdk provides a suite of methods to interact with blockchain contracts, specifically tailored for LBP (Liquidity Bootstrapping Pool) operations. Below are the methods available in the SDK:

## Write Methods Solana

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

- Solana-Based Client: This method is only available when your FjordClientSdk was created with useSolana: true.
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

- Solana-Based Client: This method is only available when your `FjordClientSdk` was created with `useSolana: true`.
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

- Solana-Based Client: This method is only available when your `FjordClientSdk` was created with `useSolana: true`.
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

## Read Methods Solana

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

## Read Methods EVM

All read methods require the following arguments:

- `request: ReadContractRequest` - Contains the contract address and ABI.

### Get Contract Arguments

#### `async getContractArgs(request: ReadContractRequest): Promise<GetContractArgsResponse>`

- Retrieves contract arguments for a specified LBP contract.
- **Returns:** A promise resolving to `GetContractArgsResponse`.

### Get Contract Manager Address

#### `async getContractManagerAddress(request: ReadContractRequest): Promise<GetContractManagerAddressResponse>`

- Fetches the manager address of a specified contract.
- **Returns:** A promise with the manager's blockchain address.

### Is Pool Closed

#### `async isPoolClosed(request: ReadContractRequest): Promise<boolean>`

- Determines if a particular LBP is closed.
- **Returns:** Boolean value indicating the pool's status.

### Is Selling Allowed

#### `async isSellingAllowed(request: ReadContractRequest): Promise<boolean>`

- Checks if selling operations are permitted for a specific LBP.
- **Returns:** Boolean value reflecting selling permissions.

### Get Max Total Assets In

#### `async getMaxTotalAssetsIn(request: ReadContractRequest): Promise<bigint>`

- Retrieves the maximum total assets allowed in a given LBP.
- **Returns:** Maximum total assets as a `bigint`.

### Get Max Total Shares Out

#### `async getMaxTotalSharesOut(request: ReadContractRequest): Promise<bigint>`

- Fetches the maximum total shares out for a specified LBP.
- **Returns:** Maximum total shares as a `bigint`.

### Get Vesting State

#### `async getVestingState(request: ReadContractRequest): Promise<GetVestingStateResponse>`

- Retrieves the vesting state for a given LBP.
- **Returns:** Object containing the vesting state details.

### Get Total Shares Purchased

#### `async getTotalSharesPurchased(request: ReadContractRequest): Promise<bigint>`

- Fetches the total number of shares purchased in a specific LBP.
- **Returns:** Total shares as a `bigint`.

### Get Reserves And Weights

#### `async getReservesAndWeights(request: ReadContractRequest): Promise<GetReservesAndWeightsResponse>`

- Retrieves the reserves and weights for a given LBP.
- **Returns:** Object containing the reserves and weights details.

## Enums

### PoolDataValueKey

Defines keys used to access specific data within an LBP.

- **AssetToken**: Key for the asset token mint.
- **Closed**: Key for determining if the pool is closed.
- **Creator**: Key for the address of the pool's creator.
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
