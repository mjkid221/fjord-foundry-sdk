import * as anchor from '@coral-xyz/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Connection, Keypair, PublicKey, TransactionInstruction, clusterApiUrl } from '@solana/web3.js';

import { PoolDataValueKey } from './enums';
import { formatEpochDate, getTokenDivisor } from './helpers';
import {
  LbpBuyService,
  LbpInitializationService,
  LbpManagementService,
  LbpReadService,
  LbpRedemptionService,
  LbpSellService,
  Logger,
  LoggerLike,
  SolanaConnectionService,
} from './services';
import {
  ClientSdkInterface,
  ClientServiceInterface,
  CloseOperationPublicKeys,
  CreatePoolClientParams,
  GetPoolDataResponse,
  InitializePoolResponse,
  RedeemOperationPublicKeys,
  RetrievePoolDataParams,
  RetrieveSinglePoolDataValueParams,
  SwapExactSharesForAssetsInstructionClientParams,
  SwapSharesForExactAssetsInstructionClientParams,
  PausePoolClientParams,
  CreateNewOwnerNominationClientParams,
  SetNewPoolFeesClientParams,
  SetTreasuryFeeRecipientsClientParams,
  SolanaClientOptions,
  GetFeeRecipientsResponse,
  GetPoolFeesResponse,
  GetPoolTransactionsAfterParams,
  GetPoolLogsAfterParams,
  PoolTokenAccounts,
  PoolTokenBalances,
  CreatorTokenBalances,
  GetUserTokenBalanceParams,
  UserPoolStateBalances,
  GetPoolWeightsAndReserves,
  PoolReservesAndWeights,
  SwapAssetsForExactSharesInstructionClientParams,
  SwapExactAssetsForSharesInstructionClientParams,
  PoolTransaction,
} from './types';

export class FjordClientSdk implements ClientSdkInterface {
  private clientService: ClientServiceInterface;

  private lbpInitializationService!: LbpInitializationService;

  private lbpBuyService!: LbpBuyService;

  private lbpSellService!: LbpSellService;

  private lbpRedemptionService!: LbpRedemptionService;

  private lbpManagementService!: LbpManagementService;

  private lbpReadService!: LbpReadService;

  private solanaNetwork: WalletAdapterNetwork;

  private solanaConnection: Connection;

  private logger: LoggerLike;

  private loggerEnabled: boolean;

  private programId: PublicKey;

  // Expect an object that implements the ClientService interface
  constructor(
    clientService: ClientServiceInterface,
    network: WalletAdapterNetwork,
    connection: Connection,
    programId: PublicKey,
    loggerEnabled: boolean,
  ) {
    this.clientService = clientService;
    this.solanaNetwork = network;
    this.solanaConnection = connection;
    this.logger = Logger('SolanaSdkClient', loggerEnabled);
    this.loggerEnabled = loggerEnabled;
    this.programId = programId;
  }

  static async create({
    solanaNetwork,
    rpcUrl,
    programId,
    enableLogging = false,
  }: SolanaClientOptions): Promise<FjordClientSdk> {
    const connection = new Connection(rpcUrl || clusterApiUrl(solanaNetwork), 'confirmed');
    const service = await SolanaConnectionService.create(connection);
    const client = new FjordClientSdk(service, solanaNetwork, connection, programId, enableLogging);
    client.logger.debug('SolanaSdkClient initialized');
    return client;
  }

  // Pool Creation Function

  public async createPoolTransaction({
    keys,
    args,
    provider,
  }: CreatePoolClientParams): Promise<InitializePoolResponse> {
    // Create a new instance of the LbpInitializationService
    this.lbpInitializationService = await LbpInitializationService.create(
      this.programId,
      provider,
      this.solanaConnection,
    );

    // Call the initializePool method from the LbpInitializationService
    const transaction = await this.lbpInitializationService.initializePool({ keys, args });

    return transaction;
  }

  // Buy Functions

  public async createSwapAssetsForExactSharesTransaction({
    keys,
    args,
    provider,
  }: SwapAssetsForExactSharesInstructionClientParams): Promise<TransactionInstruction> {
    this.lbpBuyService = await LbpBuyService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const transaction = await this.lbpBuyService.createSwapAssetsForExactSharesInstruction({ keys, args });

    return transaction;
  }

  public async createSwapExactAssetsForSharesTransaction({
    keys,
    args,
    provider,
  }: SwapExactAssetsForSharesInstructionClientParams): Promise<TransactionInstruction> {
    this.lbpBuyService = await LbpBuyService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const transaction = await this.lbpBuyService.createSwapExactAssetsForSharesInstruction({ keys, args });

    return transaction;
  }

  // Sell Functions
  public async createSwapSharesForExactAssetsTransaction({
    keys,
    args,
    provider,
  }: SwapSharesForExactAssetsInstructionClientParams): Promise<TransactionInstruction> {
    this.lbpSellService = await LbpSellService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const transaction = await this.lbpSellService.createSwapSharesForExactAssetsInstruction({ keys, args });

    return transaction;
  }

  public async createSwapExactSharesForAssetsTransaction({
    keys,
    args,
    provider,
  }: SwapExactSharesForAssetsInstructionClientParams): Promise<TransactionInstruction> {
    this.lbpSellService = await LbpSellService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const transaction = await this.lbpSellService.createSwapExactSharesForAssetsInstruction({ keys, args });

    return transaction;
  }

  public async previewSharesOut({ keys, args, provider }: SwapExactAssetsForSharesInstructionClientParams) {
    this.lbpBuyService = await LbpBuyService.create(this.programId, provider, this.solanaNetwork, this.loggerEnabled);
    const { expectedSharesOut } = await this.lbpBuyService.previewSharesOut({ keys, args });
    return {
      expectedSharesOut,
    };
  }

  public async previewAssetsIn({ keys, args, provider }: SwapAssetsForExactSharesInstructionClientParams) {
    this.lbpBuyService = await LbpBuyService.create(this.programId, provider, this.solanaNetwork, this.loggerEnabled);
    const { expectedAssetsIn } = await this.lbpBuyService.previewAssetsIn({ keys, args });
    return {
      expectedAssetsIn,
    };
  }

  public async previewAssetsOut({ keys, args, provider }: SwapExactSharesForAssetsInstructionClientParams) {
    this.lbpSellService = await LbpSellService.create(this.programId, provider, this.solanaNetwork, this.loggerEnabled);
    const { expectedMinAssetsOut } = await this.lbpSellService.previewAssetsOut({ keys, args });
    return {
      expectedMinAssetsOut,
    };
  }

  public async previewSharesIn({ keys, args, provider }: SwapSharesForExactAssetsInstructionClientParams) {
    this.lbpSellService = await LbpSellService.create(this.programId, provider, this.solanaNetwork, this.loggerEnabled);
    const { expectedMaxSharesIn } = await this.lbpSellService.previewSharesIn({ keys, args });
    return {
      expectedMaxSharesIn,
    };
  }

  // Close Pool Function
  public async closePoolTransaction({ keys, args, provider }: CloseOperationPublicKeys) {
    // Create a new instance of the LbpInitializationService
    this.lbpRedemptionService = await LbpRedemptionService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    // Call the closePool method from the LbpInitializationService
    const transaction = await this.lbpRedemptionService.closeLbpPool({ keys, args });

    return transaction;
  }

  // Redeem tokens function
  public async redeemTokensTransaction({
    keys,
    args,
    provider,
  }: RedeemOperationPublicKeys): Promise<TransactionInstruction> {
    // Create a new instance of the LbpInitializationService
    this.lbpRedemptionService = await LbpRedemptionService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    // Call the closePool method from the LbpInitializationService
    const transaction = await this.lbpRedemptionService.redeemLbpTokens({ keys, args });

    return transaction;
  }

  public async pausePool({ args, provider }: PausePoolClientParams): Promise<TransactionInstruction> {
    this.lbpManagementService = await LbpManagementService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const { poolPda, creator, shareTokenMint, assetTokenMint } = args;

    const transaction = await this.lbpManagementService.pauseLbp({ poolPda, creator, shareTokenMint, assetTokenMint });

    return transaction;
  }

  public async unPausePool({ args, provider }: PausePoolClientParams): Promise<TransactionInstruction> {
    this.lbpManagementService = await LbpManagementService.create(
      this.programId,
      provider,
      this.solanaConnection,
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
    provider,
    newOwnerPublicKey,
    creator,
  }: CreateNewOwnerNominationClientParams): Promise<TransactionInstruction> {
    if (!creator) {
      throw new Error('Creator public key is required');
    }

    this.lbpManagementService = await LbpManagementService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const transaction = await this.lbpManagementService.createNewOwnerNomination({ newOwnerPublicKey, creator });

    return transaction;
  }

  public async acceptNewOwnerNomination({
    provider,
    newOwnerPublicKey,
  }: CreateNewOwnerNominationClientParams): Promise<TransactionInstruction> {
    this.lbpManagementService = await LbpManagementService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const transaction = await this.lbpManagementService.acceptOwnerNomination({ newOwnerPublicKey });

    return transaction;
  }

  public async setNewPoolFees({ feeParams, provider }: SetNewPoolFeesClientParams): Promise<TransactionInstruction> {
    this.lbpManagementService = await LbpManagementService.create(
      this.programId,
      provider,
      this.solanaConnection,
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
    provider,
    feeParams,
  }: SetTreasuryFeeRecipientsClientParams): Promise<TransactionInstruction> {
    this.lbpManagementService = await LbpManagementService.create(
      this.programId,
      provider,
      this.solanaConnection,
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

  public async retrievePoolData({ poolPda }: RetrievePoolDataParams): Promise<GetPoolDataResponse> {
    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    // Create a new instance of the LbpInitializationService
    this.lbpInitializationService = await LbpInitializationService.create(
      this.programId,
      provider,
      this.solanaConnection,
    );

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
      saleEndTime: poolData.saleEndTime,
      saleStartTime: poolData.saleStartTime,
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
    this.lbpInitializationService = await LbpInitializationService.create(
      this.programId,
      provider,
      this.solanaConnection,
    );

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

  public async readPoolFees(): Promise<GetPoolFeesResponse> {
    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    this.lbpReadService = await LbpReadService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const poolFees = await this.lbpReadService.getPoolFees();

    return poolFees;
  }

  public async readPoolOwner(): Promise<PublicKey> {
    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    this.lbpReadService = await LbpReadService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const poolOwner = await this.lbpReadService.getPoolOwner();

    return poolOwner;
  }

  public async readFeeRecipients(): Promise<GetFeeRecipientsResponse[]> {
    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    this.lbpReadService = await LbpReadService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const feeRecipients = await this.lbpReadService.getFeeRecipients();

    return feeRecipients;
  }

  public async readSwapFeeRecipient(): Promise<PublicKey> {
    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    this.lbpReadService = await LbpReadService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const swapFeeRecipient = await this.lbpReadService.getSwapFeeRecipient();

    return swapFeeRecipient;
  }

  public async readPoolTokenAccounts({ poolPda }: { poolPda: PublicKey }): Promise<PoolTokenAccounts> {
    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    this.lbpReadService = await LbpReadService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const poolTokenAccounts = await this.lbpReadService.getPoolTokenAccounts({ poolPda });

    return poolTokenAccounts;
  }

  public async readPoolTokenBalances({ poolPda }: { poolPda: PublicKey }): Promise<PoolTokenBalances> {
    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    this.lbpReadService = await LbpReadService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const poolBalances = await this.lbpReadService.getPoolTokenBalances({ poolPda });

    return poolBalances;
  }

  public async readPoolReservesAndWeights({ poolPda }: GetPoolWeightsAndReserves): Promise<PoolReservesAndWeights> {
    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    this.lbpReadService = await LbpReadService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    return this.lbpReadService.getPoolReservesAndWeights({ poolPda });
  }

  public async readCreatorTokenBalances({ poolPda }: { poolPda: PublicKey }): Promise<CreatorTokenBalances> {
    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    this.lbpReadService = await LbpReadService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const creatorBalances = await this.lbpReadService.getCreatorTokenBalances({ poolPda });

    return creatorBalances;
  }

  public async readUserTokenBalances({
    poolPda,
    userPublicKey,
  }: GetUserTokenBalanceParams): Promise<UserPoolStateBalances> {
    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    this.lbpReadService = await LbpReadService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const userBalances = await this.lbpReadService.getUserPoolStateBalances({ poolPda, userPublicKey });

    return userBalances;
  }

  public async readPoolTransactionsAfterSlot({
    poolPda,
    afterSlot,
  }: GetPoolTransactionsAfterParams): Promise<PoolTransaction[]> {
    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };

    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    this.lbpReadService = await LbpReadService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const transactions = await this.lbpReadService.getPoolTransactionsAfterSlot({ poolPda, afterSlot });

    return transactions;
  }

  public async readPoolLogsAfterSlot({ poolPda, afterSlot, logName }: GetPoolLogsAfterParams): Promise<anchor.Event[]> {
    // Mock wallet for AnchorProvider as we are only reading data
    const MockWallet = {
      publicKey: Keypair.generate().publicKey,
      signTransaction: () => Promise.reject(),
      signAllTransactions: () => Promise.reject(),
    };
    const connection = this.clientService.getConnection();

    const provider = new anchor.AnchorProvider(connection, MockWallet, anchor.AnchorProvider.defaultOptions());

    this.lbpReadService = await LbpReadService.create(
      this.programId,
      provider,
      this.solanaConnection,
      this.loggerEnabled,
    );

    const logs = await this.lbpReadService.getPoolLogsAfterSlot({ poolPda, afterSlot, logName });

    return logs;
  }
}
