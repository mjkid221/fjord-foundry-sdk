# @fjord-foundry/solana-sdk-client

## Table of Contents

- [Description](#description)
- [Installation](#installation)
  - [npm](#npm)
  - [Yarn](#yarn)
  - [pnpm](#pnpm)
- [Usage](#usage)
- [API](#api)
  - [Read Methods](#read-methods)
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

Then, you need to initialize the client in order to start interacting with it.
TODO: This will be refactored once we have signer logic.

```ts
import { FjordClientSdk, PublicClientService } from '@fjord-foundry/solana-sdk-client

export const initializeSdk = async () => {
  const clientService = await PublicClientService.create()
  const clientSdk = new FjordClientSdk(clientService);

  return clientSdk
}
```

Here's a simple example of a `Read` operation.

```ts
import initializeSdk from "./initializeSdk"

// Example: Fetching contract arguments
const contractAddress = '0x...' // Specify the contract address
const abi = [...] // ABI for the contract

const getTotalLbpSharesPurchased = async () => {
  // Create the sdk instance.
  const clientSdk = await initializeSdk();

  try {
    const totalSharesPurchased = await clientSdk.getTotalSharesPurchased({ contractAddress, abi });
    console.log(totalSharesPurchased)
    return totalSharesPurchased
  } catch (error) {
    console.error('Error fetching total shares purchased:', error);
  }
}
```

## API

The FjordClientSdk provides a suite of methods to interact with blockchain contracts, specifically tailored for LBP (Liquidity Bootstrapping Pool) operations. Below are the methods available in the SDK:

## Read Methods

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
