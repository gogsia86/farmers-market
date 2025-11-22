/**
 * Global bcrypt mock for all tests
 * Prevents native compilation issues
 */

const hash = jest.fn(async (password: string, _rounds: number) => {
  return `mocked_hash_${password}`;
});

const compare = jest.fn(async (password: string, hash: string) => {
  return hash === `mocked_hash_${password}`;
});

const genSalt = jest.fn(async (_rounds: number) => {
  return "mocked_salt";
});

const hashSync = jest.fn((password: string, _rounds: number) => {
  return `mocked_hash_sync_${password}`;
});

const compareSync = jest.fn((password: string, hash: string) => {
  return hash === `mocked_hash_sync_${password}`;
});

const genSaltSync = jest.fn((_rounds: number) => {
  return "mocked_salt_sync";
});

export { compare, compareSync, genSalt, genSaltSync, hash, hashSync };

export default {
  hash,
  compare,
  genSalt,
  hashSync,
  compareSync,
  genSaltSync,
};
