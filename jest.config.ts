import { createDefaultPreset, type JestConfigWithTsJest } from 'ts-jest';

const presetConfig = createDefaultPreset({
});

const jestConfig: JestConfigWithTsJest = {
  ...presetConfig,
  clearMocks: true,
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**'
  ],
  coverageDirectory: 'dev-tools/coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    'Interface\\.ts'
  ],
  coverageProvider: 'v8',
  roots: [
    'src/',
    'test/'
  ],
  setupFilesAfterEnv: [
    '<rootDir>/test/DomDocumentInit.ts'
  ],
  testEnvironment: 'jsdom',
  testMatch: [
    '**/test/**/?(*.)+(spec|test).[tj]s?(x)'
  ]
};

export default jestConfig;
