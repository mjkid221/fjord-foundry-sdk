import { ReadFunction } from './enums';
import { PublicClientService } from './services';
import {
  ReadContractRequest,
  GetContractArgsResponse,
  GetContractManagerAddressResponse,
  ClientSdkInterface,
  GetVestingStateResponse,
} from './types';

export class FjordClientSdk implements ClientSdkInterface {
  // This is the EVM implementation of the public client. It exists for testing purposes until the Solana implementation is complete.
  private publicClient: PublicClientService;

  constructor(publicClientService: PublicClientService) {
    this.publicClient = publicClientService;
  }

  private async readContract<T>(request: ReadContractRequest, functionName: ReadFunction): Promise<T> {
    const { contractAddress, abi, args } = request;
    return (await this.publicClient.getPublicClient().readContract({
      address: contractAddress,
      abi: abi,
      functionName: functionName,
      args: args ?? [],
    })) as T;
  }

  public async getContractArgs(request: ReadContractRequest): Promise<GetContractArgsResponse> {
    return await this.readContract<GetContractArgsResponse>(request, ReadFunction.GetContractArgs);
  }

  public async getContractManagerAddress(request: ReadContractRequest): Promise<GetContractManagerAddressResponse> {
    return await this.readContract<GetContractManagerAddressResponse>(request, ReadFunction.GetContractManager);
  }

  public async isPoolClosed(request: ReadContractRequest): Promise<boolean> {
    return await this.readContract<boolean>(request, ReadFunction.IsPoolClosed);
  }

  public async isSellingAllowed(request: ReadContractRequest): Promise<boolean> {
    return await this.readContract<boolean>(request, ReadFunction.IsSellingAllowed);
  }

  public async getMaxTotalAssetsIn(request: ReadContractRequest): Promise<bigint> {
    return await this.readContract<bigint>(request, ReadFunction.GetMaxTotalAssetsIn);
  }

  public async getMaxTotalSharesOut(request: ReadContractRequest): Promise<bigint> {
    return await this.readContract<bigint>(request, ReadFunction.GetMaxTotalSharesOut);
  }

  public async getVestingState(request: ReadContractRequest): Promise<GetVestingStateResponse> {
    const isVestingSharesEnabled = await this.readContract<boolean>(request, ReadFunction.IsVestingSharesEnabled);

    if (!isVestingSharesEnabled) {
      return {
        isVestingSharesEnabled,
        vestCliffTimestamp: undefined,
        vestEndTimestamp: undefined,
      };
    }

    const vestCliffTimestamp = await this.readContract<number>(request, ReadFunction.GetVestingCliffTimestamp);
    const vestEndTimestamp = await this.readContract<number>(request, ReadFunction.GetVestingEndTimestamp);

    return {
      isVestingSharesEnabled,
      vestCliffTimestamp,
      vestEndTimestamp,
    };
  }

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
}
