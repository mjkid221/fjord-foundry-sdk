import { GetContractArgsResponse, GetContractManagerAddressResponse, ReadContractRequest } from './client';

export interface ClientSdkInterface {
  /**
   * Retrieves arguments for a specified LBP contract on the blockchain.
   *
   * This method is designed to query the blockchain for specific contract arguments,
   * utilizing the provided contract address and ABI to make the request. It is primarily
   * used for fetching contract details that are essential for interacting with the contract,
   * such as asset information, shares, and other financial or ownership details.
   *
   * @param {ReadContractRequest} request An object containing the contract address and ABI needed for the query.
   * @param {ContractAddress} request.contractAddress The blockchain address of the contract, must start with '0x'.
   * @param {any} request.abi The Application Binary Interface of the contract which defines how to interact with it.
   *
   * @returns {Promise<GetContractArgsResponse>} A promise that resolves to an object containing details about the
   * contract's arguments, such as asset, share, assets, shares, virtual assets, and others.
   *
   * @example
   * const sdk = new FjordClientSdk();
   * const contractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBd';
   * const abi = [...]; // ABI for the contract
   * sdk.getContractArgs({ contractAddress, abi })
   *    .then(response => console.log(response))
   *    .catch(error => console.error(error));
   */
  getContractArgs(request: ReadContractRequest): Promise<GetContractArgsResponse>;

  /**
   * Retrieves the manager address for a specified contract.
   *
   * This method queries the blockchain for the manager address of a specific contract,
   * using the contract's address and ABI to make the request. The manager address is
   * typically the account that deployed or manages the contract, holding permissions
   * for administrative actions on the contract.
   *
   * @param {ReadContractRequest} request An object containing the contract address and ABI.
   * @param {ContractAddress} request.contractAddress The blockchain address of the contract, must start with '0x'.
   * @param {any} request.abi The Application Binary Interface of the contract which outlines the methods and variables.
   *
   * @returns {Promise<GetContractManagerAddressResponse>} A promise that resolves to the blockchain address of the
   * contract's manager. The address is a string that starts with '0x'.
   *
   * @example
   * const sdk = new FjordClientSdk();
   * const contractAddress = '0xa2d8f923Cb02C94445D3e027ad4Ee3df4a167dBd';
   * const abi = [...]; // ABI for the contract
   * sdk.getContractManagerAddress({ contractAddress, abi })
   *    .then(managerAddress => console.log(managerAddress))
   *    .catch(error => console.error(error));
   */
  getContractManagerAddress({ contractAddress, abi }: ReadContractRequest): Promise<GetContractManagerAddressResponse>;
}
