// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// Mock environment variables for testing
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ||
  "postgres://postgres@localhost:5432/gunpla-sekai-proto-test";
process.env.NODE_ENV = "test";
