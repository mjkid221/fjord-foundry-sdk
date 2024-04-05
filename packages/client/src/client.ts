import { ReadFunction } from './enums';
import { PublicClientService } from './services';
import {
  ReadContractRequest,
  GetContractArgsResponse,
  GetContractManagerAddressResponse,
  ClientSdkInterface,
} from './types';

export class FjordClientSdk implements ClientSdkInterface {
  private publicClient: PublicClientService;
  constructor(publicClientService: PublicClientService) {
    this.publicClient = publicClientService;
  }

  public async getContractArgs({ contractAddress, abi }: ReadContractRequest): Promise<GetContractArgsResponse> {
    return (await this.publicClient.getPublicClient().readContract({
      address: contractAddress,
      abi,
      functionName: ReadFunction.GetContractArgs,
      args: [], // No arguments needed for this function
    })) as GetContractArgsResponse;
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

  public async getContractManagerAddress({
    contractAddress,
    abi,
  }: ReadContractRequest): Promise<GetContractManagerAddressResponse> {
    return (await this.publicClient.getPublicClient().readContract({
      address: contractAddress,
      abi,
      functionName: ReadFunction.GetContractManager,
      args: [], // No arguments needed for this function
    })) as GetContractManagerAddressResponse;
  }

  /**
   *  **This is a scaffold for the Solana implementation.**
   */
  // public async getContractManagerAddress(contractPublicKey: string) {
  //   const connection = this.publicClient.getConnection();
  //   const contract = await connection.getAccountInfoAndContext(new PublicKey(contractPublicKey));

  //   if (!contract) {
  //     throw new Error('Contract not found');
  //   }

  // }
}
