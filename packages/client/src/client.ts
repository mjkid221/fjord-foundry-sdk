import * as anchor from '@coral-xyz/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { PoolDataValueKey, ReadFunction } from './enums';
import { formatEpochDate, getTokenDivisor } from './helpers';
import {
  LbpBuyService,
  LbpInitializationService,
  LbpManagementService,
  LbpRedemptionService,
  LbpSellService,
  Logger,
  LoggerLike,
  PublicClientService,
  SolanaConnectionService,
} from './services';
import {
  ClientSdkInterface,
  ClientServiceInterface,
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
  SwapExactSharesForAssetsInstructionClientParams,
  SwapSharesForExactAssetsInstructionClientParams,
  PausePoolClientParams,
} from './types';

export class FjordClientSdk implements ClientSdkInterface {
  private clientService: ClientServiceInterface;

  private lbpInitializationService!: LbpInitializationService;

  private lbpBuyService!: LbpBuyService;

  private lbpSellService!: LbpSellService;

  private lbpRedemptionService!: LbpRedemptionService;

  private lbpManagementService!: LbpManagementService;

  private isSolana: boolean;

  private solanaNetwork: WalletAdapterNetwork | undefined = undefined;

  private logger: LoggerLike;

  // Expect an object that implements the ClientService interface
  constructor(clientService: ClientServiceInterface, isSolana: boolean, network?: WalletAdapterNetwork) {
    this.clientService = clientService;
    this.isSolana = isSolana;
    this.solanaNetwork = network ?? undefined;
    this.logger = Logger('SolanaSdkClient', true);
  }

  static async create(useSolana: boolean, solanaNetwork?: WalletAdapterNetwork): Promise<FjordClientSdk> {
    let service: ClientServiceInterface;

    if (useSolana) {
      if (!solanaNetwork) {
        throw new Error('Solana network is required when using Solana');
      }
      service = await SolanaConnectionService.create(solanaNetwork);
      const client = new FjordClientSdk(service, useSolana, solanaNetwork);
      client.logger.debug('SolanaSdkClient initialized');
      return client;
    }
    service = await PublicClientService.create();
    const client = new FjordClientSdk(service, useSolana);
    client.logger.debug('SolanaSdkClient initialized');
    return client;
  }

  // Pool Creation Function

  public async createPoolTransaction({
    keys,
    args,
    programId,
    provider,
  }: CreatePoolClientParams): Promise<InitializePoolResponse> {
    if (!this.isSolana || !this.solanaNetwork) {
      this.logger.error('LbpInitializationService method not supported for this client');
      throw new Error('LbpInitializationService method not supported for this client');
    }

    // Create a new instance of the LbpInitializationService
    this.lbpInitializationService = await LbpInitializationService.create(programId, provider, this.solanaNetwork);

    // Call the initializePool method from the LbpInitializationService
    const transaction = await this.lbpInitializationService.initializePool({ keys, args });

    return transaction;
  }

  // Buy Functions

  public async createSwapAssetsForExactSharesTransaction({
    keys,
    args,
    programId,
    provider,
  }: SwapExactSharesForAssetsInstructionClientParams): Promise<TransactionInstruction> {
    if (!this.isSolana || !this.solanaNetwork) {
      this.logger.error('LbpBuyService method not supported for this client');
      throw new Error('LbpBuyService method not supported for this client');
    }

    this.lbpBuyService = await LbpBuyService.create(programId, provider, this.solanaNetwork);

    const transaction = await this.lbpBuyService.createSwapAssetsForExactSharesInstruction({ keys, args });

    return transaction;
  }

  public async createSwapExactAssetsForSharesTransaction({
    keys,
    args,
    programId,
    provider,
  }: SwapSharesForExactAssetsInstructionClientParams): Promise<TransactionInstruction> {
    if (!this.isSolana || !this.solanaNetwork) {
      this.logger.error('LbpBuyService method not supported for this client');
      throw new Error('LbpBuyService method not supported for this client');
    }

    this.lbpBuyService = await LbpBuyService.create(programId, provider, this.solanaNetwork);

    const transaction = await this.lbpBuyService.createSwapExactAssetsForSharesInstruction({ keys, args });

    return transaction;
  }

  // Sell Functions

  public async createSwapSharesForExactAssetsTransaction({
    keys,
    args,
    programId,
    provider,
  }: SwapSharesForExactAssetsInstructionClientParams): Promise<TransactionInstruction> {
    if (!this.isSolana || !this.solanaNetwork) {
      this.logger.error('LbpBuyService method not supported for this client');
      throw new Error('LbpBuyService method not supported for this client');
    }
    this.lbpSellService = await LbpSellService.create(programId, provider, this.solanaNetwork);

    const transaction = await this.lbpSellService.createSwapSharesForExactAssetsInstruction({ keys, args });

    return transaction;
  }

  public async createSwapExactSharesForAssetsTransaction({
    keys,
    args,
    programId,
    provider,
  }: SwapExactSharesForAssetsInstructionClientParams): Promise<TransactionInstruction> {
    if (!this.isSolana || !this.solanaNetwork) {
      this.logger.error('LbpBuyService method not supported for this client');
      throw new Error('LbpBuyService method not supported for this client');
    }
    this.lbpSellService = await LbpSellService.create(programId, provider, this.solanaNetwork);

    const transaction = await this.lbpSellService.createSwapExactSharesForAssetsInstruction({ keys, args });

    return transaction;
  }

  // Close Pool Function
  public async closePoolTransaction({
    keys,
    args,
    programId,
    provider,
  }: SwapSharesForExactAssetsInstructionClientParams) {
    if (!this.isSolana || !this.solanaNetwork) {
      this.logger.error('LbpInitializationService method not supported for this client');
      throw new Error('LbpInitializationService method not supported for this client');
    }

    // Create a new instance of the LbpInitializationService
    this.lbpRedemptionService = await LbpRedemptionService.create(programId, provider, this.solanaNetwork);

    // Call the closePool method from the LbpInitializationService
    const transaction = await this.lbpRedemptionService.closeLbpPool({ keys, args });

    return transaction;
  }

  // Pool Management Tools

  public async pausePool({ args, programId, provider }: PausePoolClientParams): Promise<TransactionInstruction> {
    if (!this.isSolana || !this.solanaNetwork) {
      this.logger.error('LbpInitializationService method not supported for this client');
      throw new Error('LbpInitializationService method not supported for this client');
    }

    this.lbpManagementService = await LbpManagementService.create(programId, provider, this.solanaNetwork);

    const { poolPda, creator, shareTokenMint, assetTokenMint } = args;

    const transaction = await this.lbpManagementService.pauseLbp({ poolPda, creator, shareTokenMint, assetTokenMint });

    return transaction;
  }

  public async unPausePool({ args, programId, provider }: PausePoolClientParams): Promise<TransactionInstruction> {
    if (!this.isSolana || !this.solanaNetwork) {
      this.logger.error('LbpInitializationService method not supported for this client');
      throw new Error('LbpInitializationService method not supported for this client');
    }

    this.lbpManagementService = await LbpManagementService.create(programId, provider, this.solanaNetwork);

    const { poolPda, creator, shareTokenMint, assetTokenMint } = args;

    const transaction = await this.lbpManagementService.unPauseLbp({
      poolPda,
      creator,
      shareTokenMint,
      assetTokenMint,
    });

    return transaction;
  }

  public async retrievePoolData({ poolPda, programId }: RetrievePoolDataParams): Promise<GetPoolDataResponse> {
    // Client and service validation
    if (!this.isSolana || !this.solanaNetwork || !this.clientService.getConnection) {
      this.logger.error('LbpInitializationService method not supported for this client');
      throw new Error('LbpInitializationService method not supported for this client');
    }

    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    // Create a new instance of the LbpInitializationService
    this.lbpInitializationService = await LbpInitializationService.create(programId, provider, this.solanaNetwork);

    // Fetch pool data
    const poolData = await this.lbpInitializationService.getPoolData(poolPda);

    this.logger.debug('Pool data retrieved', poolData);

    // Format pool data
    const assetTokenData = await connection.getTokenSupply(poolData.assetToken);
    const shareTokenData = await connection.getTokenSupply(poolData.shareToken);

    const shareTokenDivisor = getTokenDivisor(shareTokenData.value.decimals);
    const assetTokenDivisor = getTokenDivisor(assetTokenData.value.decimals);

    const formattedMaxSharesOut: string = poolData.maxSharesOut.div(new anchor.BN(shareTokenDivisor)).toString();
    const formattedMaxAssetsIn: string = poolData.maxAssetsIn.div(new anchor.BN(assetTokenDivisor)).toString();

    const formattedSaleStartTime = formatEpochDate(poolData.saleStartTime);
    const formattedSaleEndTime = formatEpochDate(poolData.saleEndTime);

    return {
      ...poolData,
      assetToken: poolData.assetToken.toBase58(),
      creator: poolData.creator.toBase58(),
      closed: poolData.closed.toString(),
      paused: poolData.paused.toString(),
      shareToken: poolData.shareToken.toBase58(),
      maxSharesOut: formattedMaxSharesOut,
      maxSharePrice: poolData.maxSharePrice.toString(),
      maxAssetsIn: formattedMaxAssetsIn,
      saleEndTime: formattedSaleEndTime,
      saleStartTime: formattedSaleStartTime,
      totalPurchased: poolData.totalPurchased.toString(),
      totalReferred: poolData.totalReferred.toString(),
      totalSwapFeesAsset: poolData.totalSwapFeesAsset.toString(),
      totalSwapFeesShare: poolData.totalSwapFeesShare.toString(),
      vestCliff: poolData.vestCliff.toString(),
      vestEnd: poolData.vestEnd.toString(),
      virtualAssets: poolData.virtualAssets.toString(),
      virtualShares: poolData.virtualShares.toString(),
      sellingAllowed: poolData.sellingAllowed.toString(),
    };
  }

  public async retrieveSinglePoolDataValue({
    poolPda,
    programId,
    valueKey,
  }: RetrieveSinglePoolDataValueParams): Promise<string | number | number[] | boolean> {
    // Client and service validation
    if (!this.isSolana || !this.solanaNetwork || !this.clientService.getConnection) {
      this.logger.error('LbpInitializationService method not supported for this client');
      throw new Error('LbpInitializationService method not supported for this client');
    }

    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    // Create a new instance of the LbpInitializationService
    this.lbpInitializationService = await LbpInitializationService.create(programId, provider, this.solanaNetwork);

    // Fetch pool data
    const poolData = await this.lbpInitializationService.getPoolData(poolPda);

    // Determine and return value based on valueKey
    switch (valueKey) {
      case PoolDataValueKey.AssetToken:
        return poolData.assetToken.toBase58();
      case PoolDataValueKey.Creator:
        return poolData.creator.toBase58();
      case PoolDataValueKey.Closed:
        return poolData.closed.toString();
      case PoolDataValueKey.Paused:
        return poolData.paused.toString();
      case PoolDataValueKey.EndWeightBasisPoints:
        return poolData.endWeightBasisPoints;
      case PoolDataValueKey.MaxAssetsIn: {
        const assetTokenData = await connection.getTokenSupply(poolData.assetToken);
        const assetTokenDivisor = getTokenDivisor(assetTokenData.value.decimals);
        return poolData.maxAssetsIn.div(new anchor.BN(assetTokenDivisor)).toString();
      }
      case PoolDataValueKey.MaxSharePrice:
        return poolData.maxSharePrice.toString();
      case PoolDataValueKey.MaxSharesOut: {
        const shareTokenData = await connection.getTokenSupply(poolData.shareToken);
        const shareTokenDivisor = getTokenDivisor(shareTokenData.value.decimals);
        return poolData.maxSharesOut.div(new anchor.BN(shareTokenDivisor)).toString();
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
      case PoolDataValueKey.TotalPurchased:
        return poolData.totalPurchased.toString();
      case PoolDataValueKey.TotalReferred:
        return poolData.totalReferred.toString();
      case PoolDataValueKey.TotalSwapFeesAsset:
        return poolData.totalSwapFeesAsset.toString();
      case PoolDataValueKey.TotalSwapFeesShare:
        return poolData.totalSwapFeesShare.toString();
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
}
