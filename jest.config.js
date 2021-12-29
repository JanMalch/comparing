/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  "transform": {
    ".ts": "ts-jest",
  },
  "testEnvironment": "node",
  "testRegex": "test\\.ts$",
  "moduleFileExtensions": [
    "ts",
    "js",
  ],
  "coveragePathIgnorePatterns": [
    "/node_modules/",
    "/test/",
  ],
  "coverageThreshold": {
    "global": {
      "branches": 100,
      "functions": 100,
      "lines": 100,
      "statements": 100,
    }
  },
  "collectCoverageFrom": [
    "src/**/*.ts",
  ],
}

module.exports = config;
