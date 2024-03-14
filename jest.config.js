const esModules = ['lodash-es'].join('|');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",  
  testEnvironment: "jest-environment-jsdom",
  clearMocks: true,
  coverageProvider: "v8",
  coverageDirectory: "coverage",
  moduleNameMapper: {
    "^lodash-es$": "lodash"
  }
};