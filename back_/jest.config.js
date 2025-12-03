export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.test.js'],
  transformIgnorePatterns: [
    "node_modules/(?!variables/)"
  ],
};
