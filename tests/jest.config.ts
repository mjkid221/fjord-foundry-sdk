import 'ts-jest';
import * as path from 'path';

import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  verbose: true,
  testTimeout: 100000,

  testMatch: ['<rootDir>/specs/**/*.spec.ts'],
  globalSetup: './setup/global-setup.ts',
  globalTeardown: './setup/global-teardown.ts',
  setupFilesAfterEnv: ['./setup/setup.ts'],

  transform: {
    '\\.(js|ts)$': [
      'ts-jest',
      {
        tsconfig: path.resolve(__dirname, '../tsconfig.build.json'),
      },
    ],
  },
};

export default config;
