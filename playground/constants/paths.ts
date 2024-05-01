export const SHOW_POOL_ADDRESS_PATHS = {
  read: {
    basePath: '/read/solana',
    paths: [
      '/[value]',
      '/pool-args',
      '/utility/pool-token-accounts',
      '/utility/pool-token-balances',
      '/utility/user-pool-state',
    ],
  },
  write: {
    basePath: '/write/solana',
    paths: [
      '/management/accept-ownership',
      '/management/new-owner',
      '/management/new-treasury-fees',
      '/management/pause',
      '/management/pool-fees',
      '/management/unpause',
      '/redemption/close',
      '/redemption/redeem-shares',
      '/buy/assets-for-exact-shares',
      '/buy/exact-assets-for-shares',
      '/sell/exact-shares-for-assets',
      '/sell/shares-for-exact-assets',
    ],
  },
};
