// import { ReadFunction } from './enums';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';

import {
  // PublicClientService,
  SolanaConnectionService,
} from './services';
import { ClientSdkInterfaceBeta } from './types';
// import {
//   ReadContractRequest,
//   GetContractArgsResponse,
//   GetContractManagerAddressResponse,
//   ClientSdkInterface,
//   GetVestingStateResponse,
//   GetReservesAndWeightsResponse,
// } from './types';

export class FjordClientSdk implements ClientSdkInterfaceBeta {
  private connection: SolanaConnectionService;

  constructor(connectionService: SolanaConnectionService) {
    this.connection = connectionService;
  }

  public async connectWallet(network: WalletAdapterNetwork): Promise<PublicKey | null> {
    return await this.connection.connectWallet(network);
  }

  public async signTransaction(transaction: Transaction): Promise<Transaction | null> {
    return await this.connection.signTransaction(transaction);
  }

  public async readAddress(address: PublicKey) {
    return await this.connection.getConnection().getAccountInfoAndContext(address);
  }
}

// implements ClientSdkInterface
// This is the EVM implementation of the public client. It exists for testing purposes until the Solana implementation is complete.
// private publicClient: PublicClientService;
// constructor(publicClientService: PublicClientService) {
//   this.publicClient = publicClientService;
// }

// /**
//  * Reads data from a smart contract.
//  *
//  * @template T - The type of data to be returned.
//  * @param {ReadContractRequest} request - The request object containing contract address, ABI, and arguments.
//  * @param {ReadFunction} functionName - The name of the function to be called.
//  * @returns {Promise<T>} - A promise that resolves to the data returned by the smart contract.
//  */
// private async readContract<T>(request: ReadContractRequest, functionName: ReadFunction): Promise<T> {
//   const { contractAddress, abi, args } = request;
//   return (await this.publicClient.getPublicClient().readContract({
//     address: contractAddress,
//     abi: abi,
//     functionName: functionName,
//     args: args ?? [],
//   })) as T;
// }
// public async getContractArgs(request: ReadContractRequest): Promise<GetContractArgsResponse> {
//   return await this.readContract<GetContractArgsResponse>(request, ReadFunction.GetContractArgs);
// }
// public async getContractManagerAddress(request: ReadContractRequest): Promise<GetContractManagerAddressResponse> {
//   return await this.readContract<GetContractManagerAddressResponse>(request, ReadFunction.GetContractManager);
// }
// public async isPoolClosed(request: ReadContractRequest): Promise<boolean> {
//   return await this.readContract<boolean>(request, ReadFunction.IsPoolClosed);
// }
// public async isSellingAllowed(request: ReadContractRequest): Promise<boolean> {
//   return await this.readContract<boolean>(request, ReadFunction.IsSellingAllowed);
// }
// public async getMaxTotalAssetsIn(request: ReadContractRequest): Promise<bigint> {
//   return await this.readContract<bigint>(request, ReadFunction.GetMaxTotalAssetsIn);
// }
// public async getMaxTotalSharesOut(request: ReadContractRequest): Promise<bigint> {
//   return await this.readContract<bigint>(request, ReadFunction.GetMaxTotalSharesOut);
// }
// public async getVestingState(request: ReadContractRequest): Promise<GetVestingStateResponse> {
//   const isVestingSharesEnabled = await this.readContract<boolean>(request, ReadFunction.IsVestingSharesEnabled);
//   // We only need to read the vesting timestamps if vesting is enabled.
//   if (!isVestingSharesEnabled) {
//     return {
//       isVestingSharesEnabled,
//       vestCliffTimestamp: undefined,
//       vestEndTimestamp: undefined,
//     };
//   }
//   const vestCliffTimestamp = await this.readContract<number>(request, ReadFunction.GetVestingCliffTimestamp);
//   const vestEndTimestamp = await this.readContract<number>(request, ReadFunction.GetVestingEndTimestamp);
//   return {
//     isVestingSharesEnabled,
//     vestCliffTimestamp,
//     vestEndTimestamp,
//   };
// }
// public async getTotalSharesPurchased(request: ReadContractRequest): Promise<bigint> {
//   return await this.readContract<bigint>(request, ReadFunction.GetTotalSharePurchased);
// }
// public async getReservesAndWeights(request: ReadContractRequest): Promise<GetReservesAndWeightsResponse> {
//   /**
//    * The reserves and weights array is structured as follows:
//    * `[assetReserve, shareReserve, assetWeight, shareWeight]`
//    */
//   const reservesAndWeightsArray: [bigint, bigint, bigint, bigint] = await this.readContract<
//     [bigint, bigint, bigint, bigint]
//   >(request, ReadFunction.GetReservesAndWeights);
//   return {
//     assetReserve: reservesAndWeightsArray[0],
//     shareReserve: reservesAndWeightsArray[1],
//     assetWeight: reservesAndWeightsArray[2],
//     shareWeight: reservesAndWeightsArray[3],
//   };
// }
/**
 *  **This is a scaffold for the Solana implementation.**
 */
// public async getContractArgs(contractPublicKey: string) {
//   const connection = this.publicClient.getConnection();
//   const contract = await connection.getAccountInfoAndContext(new PublicKey(contractPublicKey));
//   if (!contract) {
//     throw new Error('Contract not found');
//   }
// }
// }
