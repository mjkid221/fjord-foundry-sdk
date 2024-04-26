import * as anchor from '@coral-xyz/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';

import { PoolDataValueKey } from './enums';
import { formatEpochDate, getTokenDivisor } from './helpers';
import {
  LbpBuyService,
  LbpInitializationService,
  LbpManagementService,
  LbpRedemptionService,
  LbpSellService,
  Logger,
  LoggerLike,
  SolanaConnectionService,
} from './services';
import {
  ClientSdkInterface,
  ClientServiceInterface,
  CreatePoolClientParams,
  GetPoolDataResponse,
  InitializePoolResponse,
  RetrievePoolDataParams,
  RetrieveSinglePoolDataValueParams,
  SwapExactSharesForAssetsInstructionClientParams,
  SwapSharesForExactAssetsInstructionClientParams,
  PausePoolClientParams,
  CreateNewOwnerNominationClientParams,
  SetNewPoolFeesClientParams,
  SetTreasuryFeeRecipientsClientParams,
} from './types';

export class FjordClientSdk implements ClientSdkInterface {
  private clientService: ClientServiceInterface;

  private lbpInitializationService!: LbpInitializationService;

  private lbpBuyService!: LbpBuyService;

  private lbpSellService!: LbpSellService;

  private lbpRedemptionService!: LbpRedemptionService;

  private lbpManagementService!: LbpManagementService;

  private solanaNetwork: WalletAdapterNetwork;

  private logger: LoggerLike;

  private loggerEnabled: boolean;

  // Expect an object that implements the ClientService interface
  constructor(clientService: ClientServiceInterface, network: WalletAdapterNetwork, loggerEnabled: boolean) {
    this.clientService = clientService;
    this.solanaNetwork = network;
    this.logger = Logger('SolanaSdkClient', loggerEnabled);
    this.loggerEnabled = loggerEnabled;
  }

  static async create(solanaNetwork: WalletAdapterNetwork, enableLogging = false): Promise<FjordClientSdk> {
    const service = await SolanaConnectionService.create(solanaNetwork);
    const client = new FjordClientSdk(service, solanaNetwork, enableLogging);
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
    this.lbpBuyService = await LbpBuyService.create(programId, provider, this.solanaNetwork, this.loggerEnabled);

    const transaction = await this.lbpBuyService.createSwapAssetsForExactSharesInstruction({ keys, args });

    return transaction;
  }

  public async createSwapExactAssetsForSharesTransaction({
    keys,
    args,
    programId,
    provider,
  }: SwapSharesForExactAssetsInstructionClientParams): Promise<TransactionInstruction> {
    this.lbpBuyService = await LbpBuyService.create(programId, provider, this.solanaNetwork, this.loggerEnabled);

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
    this.lbpSellService = await LbpSellService.create(programId, provider, this.solanaNetwork, this.loggerEnabled);

    const transaction = await this.lbpSellService.createSwapSharesForExactAssetsInstruction({ keys, args });

    return transaction;
  }

  public async createSwapExactSharesForAssetsTransaction({
    keys,
    args,
    programId,
    provider,
  }: SwapExactSharesForAssetsInstructionClientParams): Promise<TransactionInstruction> {
    this.lbpSellService = await LbpSellService.create(programId, provider, this.solanaNetwork, this.loggerEnabled);

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
    // Create a new instance of the LbpInitializationService
    this.lbpRedemptionService = await LbpRedemptionService.create(
      programId,
      provider,
      this.solanaNetwork,
      this.loggerEnabled,
    );

    // Call the closePool method from the LbpInitializationService
    const transaction = await this.lbpRedemptionService.closeLbpPool({ keys, args });

    return transaction;
  }

  // Pool Management Tools

  public async pausePool({ args, programId, provider }: PausePoolClientParams): Promise<TransactionInstruction> {
    this.lbpManagementService = await LbpManagementService.create(
      programId,
      provider,
      this.solanaNetwork,
      this.loggerEnabled,
    );

    const { poolPda, creator, shareTokenMint, assetTokenMint } = args;

    const transaction = await this.lbpManagementService.pauseLbp({ poolPda, creator, shareTokenMint, assetTokenMint });

    return transaction;
  }

  public async unPausePool({ args, programId, provider }: PausePoolClientParams): Promise<TransactionInstruction> {
    this.lbpManagementService = await LbpManagementService.create(
      programId,
      provider,
      this.solanaNetwork,
      this.loggerEnabled,
    );

    const { poolPda, creator, shareTokenMint, assetTokenMint } = args;

    const transaction = await this.lbpManagementService.unPauseLbp({
      poolPda,
      creator,
      shareTokenMint,
      assetTokenMint,
    });

    return transaction;
  }

  public async nominateNewOwner({
    programId,
    provider,
    newOwnerPublicKey,
    creator,
  }: CreateNewOwnerNominationClientParams): Promise<TransactionInstruction> {
    if (!creator) {
      throw new Error('Creator public key is required');
    }

    this.lbpManagementService = await LbpManagementService.create(
      programId,
      provider,
      this.solanaNetwork,
      this.loggerEnabled,
    );

    const transaction = await this.lbpManagementService.createNewOwnerNomination({ newOwnerPublicKey, creator });

    return transaction;
  }

  public async acceptNewOwnerNomination({
    programId,
    provider,
    newOwnerPublicKey,
  }: CreateNewOwnerNominationClientParams): Promise<TransactionInstruction> {
    this.lbpManagementService = await LbpManagementService.create(
      programId,
      provider,
      this.solanaNetwork,
      this.loggerEnabled,
    );

    const transaction = await this.lbpManagementService.acceptOwnerNomination({ newOwnerPublicKey });

    return transaction;
  }

  public async setNewPoolFees({
    feeParams,
    programId,
    provider,
  }: SetNewPoolFeesClientParams): Promise<TransactionInstruction> {
    this.lbpManagementService = await LbpManagementService.create(
      programId,
      provider,
      this.solanaNetwork,
      this.loggerEnabled,
    );

    const { platformFee, referralFee, swapFee, ownerPublicKey } = feeParams;

    const transaction = await this.lbpManagementService.setPoolFees({
      platformFee,
      referralFee,
      swapFee,
      ownerPublicKey,
    });

    return transaction;
  }

  public async setTreasuryFeeRecipients({
    programId,
    provider,
    feeParams,
  }: SetTreasuryFeeRecipientsClientParams): Promise<TransactionInstruction> {
    this.lbpManagementService = await LbpManagementService.create(
      programId,
      provider,
      this.solanaNetwork,
      this.loggerEnabled,
    );

    const { swapFeeRecipient, feeRecipients, creator } = feeParams;

    const transaction = await this.lbpManagementService.setTreasuryFeeRecipients({
      swapFeeRecipient,
      feeRecipients,
      creator,
    });

    return transaction;
  }

  public async retrievePoolData({ poolPda, programId }: RetrievePoolDataParams): Promise<GetPoolDataResponse> {
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
}
