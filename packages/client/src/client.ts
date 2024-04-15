import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

import { PoolDataValueKey, ReadFunction } from './enums';
import { getTokenDivisor, formatEpochDate } from './helpers';
import { LbpInitializationService, PublicClientService, SolanaConnectionService } from './services';
import {
  ClientSdkInterface,
  ClientService,
  CreatePoolClientParams,
  GetContractArgsResponse,
  GetContractManagerAddressResponse,
  GetPoolDataResponse,
  GetReservesAndWeightsResponse,
  GetVestingStateResponse,
  InitializePoolResponse,
  ReadContractRequest,
  RetrievePoolDataParams,
  RetrieveSinglePoolDataValueParams,
} from './types';

export class FjordClientSdk implements ClientSdkInterface {
  private clientService: ClientService;
  private lbpInitializationService!: LbpInitializationService;
  private isSolana: boolean;
  private solanaNetwork: WalletAdapterNetwork | undefined = undefined;

  // Expect an object that implements the ClientService interface
  constructor(clientService: ClientService, isSolana: boolean, network?: WalletAdapterNetwork) {
    this.clientService = clientService;
    this.isSolana = isSolana;
    this.solanaNetwork = network ?? undefined;
  }

  static async create(useSolana: boolean, solanaNetwork?: WalletAdapterNetwork): Promise<FjordClientSdk> {
    let service: ClientService;

    if (useSolana) {
      if (!solanaNetwork) {
        throw new Error('Solana network is required when using Solana');
      }
      service = await SolanaConnectionService.create(solanaNetwork);
      const client = new FjordClientSdk(service, useSolana, solanaNetwork);
      return client;
    }
    service = await PublicClientService.create();
    const client = new FjordClientSdk(service, useSolana);
    return client;
  }

  public async createPoolTransaction({
    keys,
    args,
    programId,
    provider,
  }: CreatePoolClientParams): Promise<InitializePoolResponse> {
    if (!this.isSolana || !this.solanaNetwork) {
      throw new Error('LbpInitializationService method not supported for this client');
    }

    this.lbpInitializationService = await LbpInitializationService.create(programId, provider, this.solanaNetwork);
    // Call the initializePool method from the LbpInitializationService
    const transaction = await this.lbpInitializationService.initializePool({ keys, args });

    return transaction;
  }

  public async retrievePoolData({
    poolPda,
    programId,
    provider,
    connection,
  }: RetrievePoolDataParams): Promise<GetPoolDataResponse> {
    // Client and service validation
    if (!this.isSolana || !this.solanaNetwork) {
      throw new Error('LbpInitializationService method not supported for this client');
    }

    if (!this.lbpInitializationService) {
      this.lbpInitializationService = await LbpInitializationService.create(programId, provider, this.solanaNetwork);
    }

    // Fetch pool data
    const poolData = await this.lbpInitializationService.getPoolData(poolPda);

    // Format pool data
    const assetTokenData = await connection.getTokenSupply(poolData.assetToken);
    const shareTokenData = await connection.getTokenSupply(poolData.shareToken);

    const shareTokenDivisor = getTokenDivisor(shareTokenData.value.decimals);
    const assetTokenDivisor = getTokenDivisor(assetTokenData.value.decimals);

    const formattedMaxSharesOut = poolData.maxSharesOut.toNumber() / shareTokenDivisor;
    const formattedMaxAssetsIn = poolData.maxAssetsIn.toNumber() / assetTokenDivisor;

    const formattedSaleStartTime = formatEpochDate(poolData.saleStartTime);
    const formattedSaleEndTime = formatEpochDate(poolData.saleEndTime);

    return {
      ...poolData,
      assetToken: poolData.assetToken.toBase58(),
      creator: poolData.creator.toBase58(),
      shareToken: poolData.shareToken.toBase58(),
      maxSharesOut: formattedMaxSharesOut,
      maxSharePrice: poolData.maxSharePrice.toString(),
      maxAssetsIn: formattedMaxAssetsIn,
      saleEndTime: formattedSaleEndTime,
      saleStartTime: formattedSaleStartTime,
      vestCliff: poolData.vestCliff.toString(),
      vestEnd: poolData.vestEnd.toString(),
      virtualAssets: poolData.virtualAssets.toString(),
      virtualShares: poolData.virtualShares.toString(),
    };
  }

  public async retrieveSinglePoolDataValue({
    poolPda,
    programId,
    provider,
    connection,
    valueKey,
  }: RetrieveSinglePoolDataValueParams): Promise<string | number | number[] | boolean> {
    // Client and service validation
    if (!this.isSolana || !this.solanaNetwork) {
      throw new Error('LbpInitializationService method not supported for this client');
    }

    if (!this.lbpInitializationService) {
      this.lbpInitializationService = await LbpInitializationService.create(programId, provider, this.solanaNetwork);
    }

    // Fetch pool data
    const poolData = await this.lbpInitializationService.getPoolData(poolPda);

    // Determine and return value based on valueKey
    switch (valueKey) {
      case PoolDataValueKey.AssetToken:
        return poolData.assetToken.toBase58();
      case PoolDataValueKey.Creator:
        return poolData.creator.toBase58();
      case PoolDataValueKey.EndWeightBasisPoints:
        return poolData.endWeightBasisPoints;
      case PoolDataValueKey.MaxAssetsIn: {
        const assetTokenData = await connection.getTokenSupply(poolData.assetToken);
        const assetTokenDivisor = getTokenDivisor(assetTokenData.value.decimals);
        return poolData.maxAssetsIn.toNumber() / assetTokenDivisor;
      }
      case PoolDataValueKey.MaxSharePrice:
        return poolData.maxSharePrice.toString();
      case PoolDataValueKey.MaxSharesOut: {
        const shareTokenData = await connection.getTokenSupply(poolData.shareToken);
        const shareTokenDivisor = getTokenDivisor(shareTokenData.value.decimals);
        return poolData.maxSharesOut.toNumber() / shareTokenDivisor;
      }
      case PoolDataValueKey.SaleEndTime:
        return formatEpochDate(poolData.saleEndTime);
      case PoolDataValueKey.SaleStartTime:
        return formatEpochDate(poolData.saleStartTime);
      case PoolDataValueKey.SellingAllowed:
        return poolData.sellingAllowed;
      case PoolDataValueKey.ShareToken:
        return poolData.shareToken.toBase58();
      case PoolDataValueKey.StartWeightBasisPoints:
        return poolData.startWeightBasisPoints;
      case PoolDataValueKey.VestCliff:
        return poolData.vestCliff.toString();
      case PoolDataValueKey.VestEnd:
        return poolData.vestEnd.toString();
      case PoolDataValueKey.VirtualAssets:
        return poolData.virtualAssets.toString();
      case PoolDataValueKey.VirtualShares:
        return poolData.virtualShares.toString();
      case PoolDataValueKey.WhitelistMerkleRoot:
        return poolData.whitelistMerkleRoot;
      default:
        throw new Error(`Invalid value key: ${valueKey}`);
    }
  }

  public async readAddress(address: PublicKey) {
    if (!this.clientService.getConnection) {
      throw new Error('getConnection method not supported for this client');
    }
    return await this.clientService.getConnection().getAccountInfoAndContext(address);
  }

  /**
   * Reads data from a smart contract.
   *
   * @template T - The type of data to be returned.
   * @param {ReadContractRequest} request - The request object containing contract address, ABI, and arguments.
   * @param {ReadFunction} functionName - The name of the function to be called.
   * @returns {Promise<T>} - A promise that resolves to the data returned by the smart contract.
   */
  private async readContract<T>(request: ReadContractRequest, functionName: ReadFunction): Promise<T> {
    if (!this.clientService.getPublicClient) {
      throw new Error('getPublicClient method not supported for this client');
    }
    const { contractAddress, abi, args } = request;
    return (await this.clientService.getPublicClient().readContract({
      address: contractAddress,
      abi: abi,
      functionName: functionName,
      args: args ?? [],
    })) as T;
  }
  public async getContractArgs(request: ReadContractRequest): Promise<GetContractArgsResponse> {
    if (!this.clientService.getPublicClient) {
      throw new Error('getPublicClient method not supported for this client');
    }
    return await this.readContract<GetContractArgsResponse>(request, ReadFunction.GetContractArgs);
  }
  public async getContractManagerAddress(request: ReadContractRequest): Promise<GetContractManagerAddressResponse> {
    if (!this.clientService.getPublicClient) {
      throw new Error('getPublicClient method not supported for this client');
    }
    return await this.readContract<GetContractManagerAddressResponse>(request, ReadFunction.GetContractManager);
  }
  public async isPoolClosed(request: ReadContractRequest): Promise<boolean> {
    if (!this.clientService.getPublicClient) {
      throw new Error('getPublicClient method not supported for this client');
    }
    return await this.readContract<boolean>(request, ReadFunction.IsPoolClosed);
  }
  public async isSellingAllowed(request: ReadContractRequest): Promise<boolean> {
    if (!this.clientService.getPublicClient) {
      throw new Error('getPublicClient method not supported for this client');
    }
    return await this.readContract<boolean>(request, ReadFunction.IsSellingAllowed);
  }
  public async getMaxTotalAssetsIn(request: ReadContractRequest): Promise<bigint> {
    if (!this.clientService.getPublicClient) {
      throw new Error('getPublicClient method not supported for this client');
    }
    return await this.readContract<bigint>(request, ReadFunction.GetMaxTotalAssetsIn);
  }
  public async getMaxTotalSharesOut(request: ReadContractRequest): Promise<bigint> {
    if (!this.clientService.getPublicClient) {
      throw new Error('getPublicClient method not supported for this client');
    }
    return await this.readContract<bigint>(request, ReadFunction.GetMaxTotalSharesOut);
  }
  public async getVestingState(request: ReadContractRequest): Promise<GetVestingStateResponse> {
    if (!this.clientService.getPublicClient) {
      throw new Error('getPublicClient method not supported for this client');
    }
    const isVestingSharesEnabled = await this.readContract<boolean>(request, ReadFunction.IsVestingSharesEnabled);
    // We only need to read the vesting timestamps if vesting is enabled.
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
  public async getTotalSharesPurchased(request: ReadContractRequest): Promise<bigint> {
    if (!this.clientService.getPublicClient) {
      throw new Error('getPublicClient method not supported for this client');
    }
    return await this.readContract<bigint>(request, ReadFunction.GetTotalSharePurchased);
  }
  public async getReservesAndWeights(request: ReadContractRequest): Promise<GetReservesAndWeightsResponse> {
    if (!this.clientService.getPublicClient) {
      throw new Error('getPublicClient method not supported for this client');
    }
    /**
     * The reserves and weights array is structured as follows:
     * `[assetReserve, shareReserve, assetWeight, shareWeight]`
     */
    const reservesAndWeightsArray: [bigint, bigint, bigint, bigint] = await this.readContract<
      [bigint, bigint, bigint, bigint]
    >(request, ReadFunction.GetReservesAndWeights);
    return {
      assetReserve: reservesAndWeightsArray[0],
      shareReserve: reservesAndWeightsArray[1],
      assetWeight: reservesAndWeightsArray[2],
      shareWeight: reservesAndWeightsArray[3],
    };
  }

  // private static async initLbpInitializationService(client: FjordClientSdk) {
  //   if (!client.clientService.getConnection || !client.clientService.getConnectedWallet) {
  //     throw new Error('LbpInitializationService method not supported for this client');
  //   }
  //   const connection = client.clientService.getConnection();
  //   const wallet = await client.clientService.getConnectedWallet();
  //   if (!wallet) {
  //     throw new Error('Wallet not connected');
  //   }

  //   const programId = Keypair.generate().publicKey; //TODO: Use the actual program ID

  //   client.lbpInitializationService = await LbpInitializationService.create(
  //     connection,
  //     wallet as any as Wallet,
  //     programId,
  //   );
  // }
}
