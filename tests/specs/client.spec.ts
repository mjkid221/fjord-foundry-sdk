import {
  FjordClientSdk,
  PublicClientService,
  getContractArgsResponseSchema,
  getContractManagerAddressResponseSchema,
} from '@fjord-foundry/solana-sdk-client';

import { abi } from '../mocks/abi';

const contractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBd';
const tooLongContractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBdbbbbbb';
const incorrectContractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBa';

describe('FjordClientSdk', () => {
  let sdk: FjordClientSdk;
  let publicClientService: PublicClientService;

  beforeEach(() => {
    publicClientService = new PublicClientService();
    sdk = new FjordClientSdk(publicClientService);
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
});
