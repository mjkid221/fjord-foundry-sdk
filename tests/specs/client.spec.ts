import { FjordClientSdk, getContractArgsResponseSchema } from '@fjord-foundry/solana-sdk-client';

import { abi } from '../mocks/abi';

const contractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBd';

describe('FjordClientSdk', () => {
  let sdk: FjordClientSdk;

  beforeEach(() => {
    sdk = new FjordClientSdk();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an instance of FjordClientSdk', () => {
    expect(sdk).toBeInstanceOf(FjordClientSdk);
  });

  describe('getContractArgs tests', () => {
    it('calls readContract with correct parameters and returns the correct response', async () => {
      const response = await sdk.getContractArgs({ contractAddress, abi });
      expect(() => getContractArgsResponseSchema.parse(response)).not.toThrow();
      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Object);
      expect(response).toHaveProperty('asset');
    });

    it('throws an error if contract address is too long', async () => {
      // Invalid contract address
      const contractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBdbbbbbb';

      await expect(sdk.getContractArgs({ contractAddress, abi })).rejects.toThrow();
    });

    it('throws an error if contract address is incorrect', async () => {
      // Invalid contract address
      const contractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBa';

      await expect(sdk.getContractArgs({ contractAddress, abi })).rejects.toThrow();
    });
  });
});
