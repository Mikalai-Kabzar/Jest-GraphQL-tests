module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  //testEnvironment: 'allure-jest/jsdom',
  coverageProvider: 'babel',
  coveragePathIgnorePatterns: [
    './src/test/BaseTest.ts',
    // Add more patterns as needed
  ],
  reporters: ['default'],
  "testMatch": [
    "<rootDir>/src/test/*.test.ts"
  ],
  // reporters: ['default',   
  // ["jest-html-reporters", {
  //   "publicPath": "./html-report",
  //   "filename": "report.html",
  //   "openReport": true
  // }]],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.mjs$': 'babel-jest',
  },
};
