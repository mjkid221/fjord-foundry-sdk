import { PublicClientService } from './services/public-client.service';
import { ContractAddress, GetContractArgsRequest, GetContractArgsResponse } from './types';

export class FjordClientSdk {
  private publicClient: PublicClientService;
  constructor() {
    this.publicClient = new PublicClientService();
  }

  public async getContractArgs({ contractAddress, abi }: GetContractArgsRequest): Promise<GetContractArgsResponse> {
    return (await this.publicClient.getPublicClient().readContract({
      address: contractAddress as ContractAddress,
      abi,
      functionName: 'args',
      args: [],
    })) as GetContractArgsResponse;
  }
}
