# Fjord Foundry Solana SDK for JavaScript

The Solana SDK is a development kit for Liquidity Bootstrap Pools(LBPs) on the Solana blockchain. It can be used to perform read and write operations for LBPs in the Fjord Foundry protocol.

## Packages

- [`@fjord-foundry/solana-sdk-client`](packages/client/README.md) - The entrypoint for interaction with the Fjord Foundry Solana LBP programs.

## Demo

The playground app is a small NextJs application that demonstrates the read and write capabilities of the [`@fjord-foundry/solana-sdk-client`](packages/client/README.md)

- [Source Code](playground)
- Online Demo - *Coming Soon...*

## Quick Start

1. Prepare Node.JS version

  ```bash
  nvm use 18.19.1
  ```

2. Install dependencies

  ```bash
  npm i
  ```

3. Build all packages and Playground app:

  ```bash
  npm run build
  ```

4. Run playground application:

  ```bash
  npm run playground
  ```

  Out of the box the playground app will connect to the Solana `devnet`.

## Tests

Run tests

```bash
npm run test
```

## Publish

1. Create a release

  ```bash
  npm run release
  ```

  It will detect the next version (based on [Conventional Commits](https://www.conventionalcommits.org/) history), update `CHANGELOG.md`s, create release tag, commit and push changes to the current branch.

  To create an unstable release (`-rc.*`):

  ```bash
  npm run release:rc
  ```
  