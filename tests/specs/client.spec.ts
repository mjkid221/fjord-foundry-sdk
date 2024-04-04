import { FjordClientSdk } from '@fjord-foundry/solana-sdk-client';

import { abi } from '../mocks/abi';

describe('FjordClientSdk', () => {
  let sdk: FjordClientSdk;

  beforeEach(() => {
    sdk = new FjordClientSdk();
  });

  it('should create an instance of FjordClientSdk', () => {
    expect(sdk).toBeInstanceOf(FjordClientSdk);
  });

  describe('readContractArgs', () => {
    it('calls readContract with correct parameters', async () => {
      const contractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBd';

      const response = await sdk.getContractArgs({ contractAddress, abi });

      console.log(response);

      expect(response).toBeDefined();
      expect(response).toBeInstanceOf(Object);
      expect(response).toHaveProperty('asset');
    });
  });
});
