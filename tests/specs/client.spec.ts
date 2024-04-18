import {
  FjordClientSdk,
  PoolDataValueKey,
  getContractArgsResponseSchema,
  getContractManagerAddressResponseSchema,
  getReservesAndWeightsResponseSchema,
  getVestingStateResponseSchema,
} from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

import { abi } from '../mocks/abi';

/**
 * This is a contract address from an actual contract deployed on the Ethereum network.
 * @see https://etherscan.io/address/0xC17374e2C8FebaBf509F2671F5fB8Aaac3236031
 */
const contractAddress = '0xC17374e2C8FebaBf509F2671F5fB8Aaac3236031';

const tooLongContractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBdbbbbbb';
const incorrectContractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBa';

/**
 * These are the actual addresses of a created pool and program on the Solana network devnet.
 * **Note** These addresses should be updated when new deployments of the program are made.
 * @see https://explorer.solana.com/address/4TvxWEV1xsSZJL1W7qzeCRTrMYjJj6jWU6pzms2nfgcF?cluster=devnet
 * @see https://explorer.solana.com/address/AXRGWPXpgTKK9NrqLji4zbPeyiiDp2gkjLGUJJunLKUm?cluster=devnet
 */
const solanaPoolPda = new PublicKey('4TvxWEV1xsSZJL1W7qzeCRTrMYjJj6jWU6pzms2nfgcF');
const programAddress = new PublicKey('AXRGWPXpgTKK9NrqLji4zbPeyiiDp2gkjLGUJJunLKUm');

describe('FjordClientSdk Solana Read Functions', () => {
  let sdk: FjordClientSdk;

  beforeEach(async () => {
    sdk = await FjordClientSdk.create(true, WalletAdapterNetwork.Devnet);
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
      programId: programAddress,
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
      programId: programAddress,
      valueKey: PoolDataValueKey.AssetToken,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.ShareToken and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      programId: programAddress,
      valueKey: PoolDataValueKey.ShareToken,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.MaxAssetsIn and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      programId: programAddress,
      valueKey: PoolDataValueKey.MaxAssetsIn,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('number');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.Creator and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      programId: programAddress,
      valueKey: PoolDataValueKey.Creator,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.EndWeightBasisPoints and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      programId: programAddress,
      valueKey: PoolDataValueKey.EndWeightBasisPoints,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('number');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.MaxSharePrice and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      programId: programAddress,
      valueKey: PoolDataValueKey.MaxSharePrice,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.MaxSharesOut and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      programId: programAddress,
      valueKey: PoolDataValueKey.MaxSharesOut,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('number');
  });

  it('should call retrieveSinglePoolDataValues with PoolDataValueKey.SaleEndTime and return the correct response', async () => {
    const response = await sdk.retrieveSinglePoolDataValue({
      poolPda: solanaPoolPda,
      programId: programAddress,
      valueKey: PoolDataValueKey.SaleEndTime,
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe('string');
  });
});

describe('FjordClientSdk EVM Read Functions', () => {
  let sdk: FjordClientSdk;
  beforeEach(async () => {
    sdk = await FjordClientSdk.create(false);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  // Test if the class is defined
  it('should create an instance of FjordClientSdk', () => {
    expect(sdk).toBeInstanceOf(FjordClientSdk);
  });
  // Test the methods
  describe('getContractArgs tests', () => {
    it('calls readContract with correct parameters and returns the correct response', async () => {
      const response = await sdk.getContractArgs({ contractAddress, abi });
      // Check if the response is valid
      expect(() => getContractArgsResponseSchema.parse(response)).not.toThrow();
      // Check if the response is correct
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Object);
      // Check if the response has the correct properties
      expect(response).toHaveProperty('asset');
      expect(response).toHaveProperty('share');
      expect(response).toHaveProperty('assets');
      expect(response).toHaveProperty('shares');
      expect(response).toHaveProperty('virtualAssets');
      expect(response).toHaveProperty('virtualShares');
      expect(response).toHaveProperty('weightStart');
      expect(response).toHaveProperty('weightEnd');
      expect(response).toHaveProperty('saleStart');
      expect(response).toHaveProperty('saleEnd');
      expect(response).toHaveProperty('totalPurchased');
      expect(response).toHaveProperty('maxSharePrice');
    });
    it('throws an error if contract address is too long', async () => {
      await expect(sdk.getContractArgs({ contractAddress: tooLongContractAddress, abi })).rejects.toThrow();
    });
    it('throws an error if contract address is incorrect', async () => {
      await expect(sdk.getContractArgs({ contractAddress: incorrectContractAddress, abi })).rejects.toThrow();
    });
  });
  describe('getContractManagerAddress tests', () => {
    it('calls readContract with correct parameters and returns the correct response', async () => {
      const response = await sdk.getContractManagerAddress({ contractAddress, abi });
      // Check if the response is valid
      expect(() => getContractManagerAddressResponseSchema.parse(response)).not.toThrow();
      expect(response).toBeDefined();
      // Check if the response is correct
      expect(typeof response).toBe('string');
      expect(response).toMatch(/^0x/);
    });
    it('throws an error if contract address is too long', async () => {
      await expect(sdk.getContractManagerAddress({ contractAddress: tooLongContractAddress, abi })).rejects.toThrow();
    });
    it('throws an error if contract address is incorrect', async () => {
      await expect(sdk.getContractManagerAddress({ contractAddress: incorrectContractAddress, abi })).rejects.toThrow();
    });
  });
  describe('isPoolClosed tests', () => {
    it('calls readContract with correct parameters and returns the correct response', async () => {
      const response = await sdk.isPoolClosed({ contractAddress, abi });
      expect(response).toBeDefined();
      expect(typeof response).toBe('boolean');
    });
    it('throws an error if contract address is too long', async () => {
      await expect(sdk.isPoolClosed({ contractAddress: tooLongContractAddress, abi })).rejects.toThrow();
    });
    it('throws an error if contract address is incorrect', async () => {
      await expect(sdk.isPoolClosed({ contractAddress: incorrectContractAddress, abi })).rejects.toThrow();
    });
  });
  describe('isSellingAllowed tests', () => {
    it('calls readContract with correct parameters and returns the correct response', async () => {
      const response = await sdk.isSellingAllowed({ contractAddress, abi });
      expect(response).toBeDefined();
      expect(typeof response).toBe('boolean');
    });
    it('throws an error if contract address is too long', async () => {
      await expect(sdk.isSellingAllowed({ contractAddress: tooLongContractAddress, abi })).rejects.toThrow();
    });
    it('throws an error if contract address is incorrect', async () => {
      await expect(sdk.isSellingAllowed({ contractAddress: incorrectContractAddress, abi })).rejects.toThrow();
    });
  });
  describe('getMaxTotalAssets tests', () => {
    it('calls readContract with correct parameters and returns the correct response', async () => {
      const response = await sdk.getMaxTotalAssetsIn({ contractAddress, abi });
      expect(response).toBeDefined();
      expect(typeof response).toBe('bigint');
    });
    it('throws an error if contract address is too long', async () => {
      await expect(sdk.getMaxTotalAssetsIn({ contractAddress: tooLongContractAddress, abi })).rejects.toThrow();
    });
    it('throws an error if contract address is incorrect', async () => {
      await expect(sdk.getMaxTotalAssetsIn({ contractAddress: incorrectContractAddress, abi })).rejects.toThrow();
    });
  });
  describe('getMaxTotalSharesOut tests', () => {
    it('calls readContract with correct parameters and returns the correct response', async () => {
      const response = await sdk.getMaxTotalSharesOut({ contractAddress, abi });
      expect(response).toBeDefined();
      expect(typeof response).toBe('bigint');
    });
    it('throws an error if contract address is too long', async () => {
      await expect(sdk.getMaxTotalSharesOut({ contractAddress: tooLongContractAddress, abi })).rejects.toThrow();
    });
    it('throws an error if contract address is incorrect', async () => {
      await expect(sdk.getMaxTotalSharesOut({ contractAddress: incorrectContractAddress, abi })).rejects.toThrow();
    });
  });
  describe('getVestingState tests', () => {
    it('calls readContract with correct parameters and returns the correct response', async () => {
      const response = await sdk.getVestingState({ contractAddress, abi });
      // Check if the response is valid
      expect(() => getVestingStateResponseSchema.parse(response)).not.toThrow();
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Object);
      expect(response).toHaveProperty('isVestingSharesEnabled');
      expect(response).toHaveProperty('vestCliffTimestamp');
      expect(response).toHaveProperty('vestEndTimestamp');
      expect(typeof response.isVestingSharesEnabled).toBe('boolean');
      expect(typeof response.vestCliffTimestamp).toBe('undefined');
      expect(typeof response.vestEndTimestamp).toBe('undefined');
    });
    it('throws an error if contract address is too long', async () => {
      await expect(sdk.getVestingState({ contractAddress: tooLongContractAddress, abi })).rejects.toThrow();
    });
    it('throws an error if contract address is incorrect', async () => {
      await expect(sdk.getVestingState({ contractAddress: incorrectContractAddress, abi })).rejects.toThrow();
    });
  });
  describe('getTotalSharesPurchased tests', () => {
    it('calls readContract with correct parameters and returns the correct response', async () => {
      const response = await sdk.getTotalSharesPurchased({ contractAddress, abi });
      expect(response).toBeDefined();
      expect(typeof response).toBe('bigint');
    });
    it('throws an error if contract address is too long', async () => {
      await expect(sdk.getTotalSharesPurchased({ contractAddress: tooLongContractAddress, abi })).rejects.toThrow();
    });
    it('throws an error if contract address is incorrect', async () => {
      await expect(sdk.getTotalSharesPurchased({ contractAddress: incorrectContractAddress, abi })).rejects.toThrow();
    });
  });
  describe('getReservesAndWeights tests', () => {
    it('calls readContract with correct parameters and returns the correct response', async () => {
      const { saleEnd } = await sdk.getContractArgs({ contractAddress, abi });

      if (new Date(Number(saleEnd)) < new Date()) {
        console.log('Sale has ended');
        return;
      }
      const response = await sdk.getReservesAndWeights({ contractAddress, abi });
      console.log(response);
      expect(() => getReservesAndWeightsResponseSchema.parse(response)).not.toThrow();
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Object);
      expect(response).toHaveProperty('assetReserve');
      expect(response).toHaveProperty('shareReserve');
      expect(response).toHaveProperty('assetWeight');
      expect(response).toHaveProperty('shareWeight');
    });
    it('throws an error if contract address is too long', async () => {
      await expect(sdk.getReservesAndWeights({ contractAddress: tooLongContractAddress, abi })).rejects.toThrow();
    });
    it('throws an error if contract address is incorrect', async () => {
      await expect(sdk.getReservesAndWeights({ contractAddress: incorrectContractAddress, abi })).rejects.toThrow();
    });
  });
});
