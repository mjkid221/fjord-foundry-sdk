import {
  FjordClientSdk,
  getContractArgsResponseSchema,
  getContractManagerAddressResponseSchema,
  getReservesAndWeightsResponseSchema,
  getVestingStateResponseSchema,
} from '@fjord-foundry/solana-sdk-client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { Keypair, PublicKey } from '@solana/web3.js';

import { abi } from '../mocks/abi';

const contractAddress = '0xC17374e2C8FebaBf509F2671F5fB8Aaac3236031';
const tooLongContractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBdbbbbbb';
const incorrectContractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBa';

const solAddress = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN';

describe('FjordClientSdk Solana Functions', () => {
  let sdk: FjordClientSdk;
  let mockConnectWallet: jest.Mock;
  let mockGetConnectedWallet: jest.Mock;

  beforeEach(async () => {
    sdk = await FjordClientSdk.create(true, WalletAdapterNetwork.Mainnet);
    mockConnectWallet = jest.fn();
    mockGetConnectedWallet = jest.fn();
    jest.mock('@fjord-foundry/solana-sdk-client', () => ({
      FjordClientSdk: jest.fn().mockImplementation(async () => ({
        connectWallet: mockConnectWallet,
        getConnectedWallet: mockGetConnectedWallet,
      })),
    }));

    sdk.connectWallet = mockConnectWallet;
    sdk.getConnectedWallet = mockGetConnectedWallet;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it('should create instances of FjordClientSdk and SolanaConnectionService', () => {
    expect(sdk).toBeInstanceOf(FjordClientSdk);
  });

  it('calls connection.getConnection with correct parameters and returns the correct response', async () => {
    const { value: response } = await sdk.readAddress(new PublicKey(solAddress));

    expect(response).toBeDefined();
    expect(response).toBeInstanceOf(Object);
    expect(response).toHaveProperty('lamports');
    expect(response).toHaveProperty('owner');
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('executable');
  });

  it('calls connection.connectWallet with correct parameters and returns the public key', async () => {
    const keypair = Keypair.generate();
    const mockPublicKey = new PublicKey(keypair.publicKey);
    mockConnectWallet.mockResolvedValue(mockPublicKey);

    const network = WalletAdapterNetwork.Mainnet;
    const publicKey = await sdk.connectWallet(network);

    expect(mockConnectWallet).toHaveBeenCalledWith(network);
    expect(publicKey).toEqual(mockPublicKey);
  });

  it('calls clientService.getConnectedWallet and returns the wallet', async () => {
    let mockWallet: any; // Define your mock wallet object
    mockGetConnectedWallet.mockResolvedValue(mockWallet);

    const result = await sdk.getConnectedWallet();

    expect(mockGetConnectedWallet).toHaveBeenCalled();
    expect(result).toEqual(mockWallet);
  });

  it('throws an error if clientService.getConnectedWallet is not implemented', async () => {
    const clientServiceWithoutMethod = false; // Create a mock clientService without the method
    const sdkWithoutMethod = await FjordClientSdk.create(clientServiceWithoutMethod);

    await expect(sdkWithoutMethod.getConnectedWallet()).rejects.toThrow(
      'getConnectedWallet method not supported for this client',
    );
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
