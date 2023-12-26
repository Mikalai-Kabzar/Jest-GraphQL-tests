module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  //testEnvironment: 'allure-jest/jsdom',
  coverageProvider: 'babel',
  coveragePathIgnorePatterns: [
    './src/BaseTest.ts',
    // Add more patterns as needed
  ],
  reporters: ['default'],
  "testMatch": [
    "<rootDir>/src/*.test.ts"
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
  // globals: {
  //   'ts-jest': {
  //     tsconfig: './tsconfig.json',
  //   },
  // },
  //testRunner: "jest-jasmine2",
  //setupFilesAfterEnv: ["jest-allure/dist/setup"]
  // Other Jest configuration options...
};
