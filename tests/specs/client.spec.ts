import { FjordClientSdk, PoolDataValueKey } from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

/**
 * These are the actual addresses of a created pool and program on the Solana network devnet.
 * **Note** These addresses should be updated when new deployments of the program are made.
 * @see https://explorer.solana.com/address/AuTuRk4oAtb2QpQPBbqQgUtsqQwofcSrCdEM91x7oPVa?cluster=devnet
 * @see https://explorer.solana.com/address/HK6KFuWu9ZzEaiKy16LDcaQ2u1G1NAhib7pvNxzA3jKr?cluster=devnet
 */
const solanaPoolPda = new PublicKey('AuTuRk4oAtb2QpQPBbqQgUtsqQwofcSrCdEM91x7oPVa');
const programAddress = new PublicKey('HK6KFuWu9ZzEaiKy16LDcaQ2u1G1NAhib7pvNxzA3jKr');

describe('FjordClientSdk Solana Read Functions', () => {
  let sdk: FjordClientSdk;

  beforeEach(async () => {
    sdk = await FjordClientSdk.create({ solanaNetwork: WalletAdapterNetwork.Devnet, programId: programAddress });
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test if the class is defined
  it('should create an instance of FjordClientSdk', () => {
    expect(sdk).toBeInstanceOf(FjordClientSdk);
  });

  // Test the methods
  it('should call retrievePoolData with correct parameters and return the correct response', async () => {
    const response = await sdk.retrievePoolData({
      poolPda: solanaPoolPda,
    });

    expect(response).toBeDefined();
    expect(response).toBeInstanceOf(Object);
    expect(response).toHaveProperty('assetToken');
    expect(response).toHaveProperty('shareToken');
    expect(response).toHaveProperty('maxAssetsIn');
    expect(response).toHaveProperty('maxSharesOut');
    expect(response).toHaveProperty('virtualAssets');
    expect(response).toHaveProperty('virtualShares');
    expect(response).toHaveProperty('saleStartTime');
    expect(response).toHaveProperty('saleEndTime');
    expect(response).toHaveProperty('maxSharePrice');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.AssetToken and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      valueKey: PoolDataValueKey.AssetToken,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.ShareToken and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      valueKey: PoolDataValueKey.ShareToken,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.MaxAssetsIn and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      valueKey: PoolDataValueKey.MaxAssetsIn,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.Creator and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      valueKey: PoolDataValueKey.Creator,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.EndWeightBasisPoints and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      valueKey: PoolDataValueKey.EndWeightBasisPoints,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('number');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.MaxSharePrice and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      valueKey: PoolDataValueKey.MaxSharePrice,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.MaxSharesOut and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      valueKey: PoolDataValueKey.MaxSharesOut,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.SaleEndTime and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      valueKey: PoolDataValueKey.SaleEndTime,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });
});
