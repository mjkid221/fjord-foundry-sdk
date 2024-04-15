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
- [Features](#features)
- [License](#license)

## Description

TODO: Fill in description here

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

import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';
import { AnchorProvider } from '@project-serum/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useMutation } from '@tanstack/react-query';

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

## Features

TODO

## License

TBA
