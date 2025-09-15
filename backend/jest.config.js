module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.{ts,js}", "!src/**/*.d.ts"],
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  testTimeout: 30000,
  silent: false,
  verbose: true,
  detectOpenHandles: true,
};
