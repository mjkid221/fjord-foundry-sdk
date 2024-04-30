# Playground Application

## Purpose

This NextJs/Typescript application is designed to provide implementation examples for the Fjord Foundry dev team. It also enables testing of Solana program methods and the capabilities of the [`@fjord-foundry/solana-sdk-client`](/packages/client/README.md)

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

## Important Notes

- The [`INITIALIZE_LBP_ADDRESS`](/playground/constants/initialize-pool.ts) constant represents the deployed address of the main LBP program. Please ensure this is up to date with the most current deployment.