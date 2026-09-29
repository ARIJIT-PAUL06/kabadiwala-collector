/* global jest */
// Jest setup file
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('expo-crypto', () => ({
  randomUUID: () => require('crypto').randomUUID(),
  digestStringAsync: jest.fn().mockImplementation(async (algorithm, str) => {
    return require('crypto').createHash('sha256').update(str).digest('hex');
  }),
  CryptoDigestAlgorithm: {
    SHA256: 'SHA-256',
  },
}));
