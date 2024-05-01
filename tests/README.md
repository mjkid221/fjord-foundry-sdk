# Tests

## Important

### After Program Upgrade

When the governing Solana program is redeployed or updated on devnet, you may be required to update the PDA values and `MOCK_WALLET` public key in the constants file. The for the purpose of testing, `MOCK_WALLET` should be a burner wallet and should be set as the governing program owner.

Depending on the nature of the changes made, it may also be necessary to create new utility tokens and a new test LBP. If this is required the following flow should be undertaken:

1. Create a new burner wallet address
1. Send some devnet SOL to the wallet [HERE](https://faucet.solana.com/)
1. Create 2 utility tokens [HERE](https://coinfactory.app/generator/solana/spl-token)
1. Update the `INITIALIZE_LBP_ADDRESS` variable in the playground app constants file.
1. Create a new LBP in the playground app using the burner wallet and the newly created tokens as shares and assets. **NOTE** *Remember to save your newly created pool PDA. It will save having to go the block explorer to extract it.*
1. If the burner wallet is not currently set as the governing program owner, connect the wallet that currently owns the program and:
  a. Navigate to `/write/solana/management/new-owner` and send a request to the burner wallet for ownership.
  b. Connect the burner wallet, navigate to `/write/solana/management/accept-ownership` and accept the invite.
1. In `tests/mocks/constants.ts` updated the following values

   a. `DEFAULT_PROGRAM_ADDRESS` - This should be the redeployed/upgraded governing program address.

   b. `MOCK_WALLET.publicKey` - This should be the public key of your burner wallet.

   c. `TOKEN_A` and `TOKEN_B` - These should be your new tokens.

   d. `BUY_SELL_POOL_PDA` - The PDA of your newly created pool.

1. Run `npm run test`
1. Update `TEST_POOL_PDA` if necessary
