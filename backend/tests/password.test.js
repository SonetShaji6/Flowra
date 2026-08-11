const { hashPassword, comparePassword } = require('../src/utils/password');

describe('Password utilities', () => {
  it('hashes a password and verifies it', async () => {
    const plain = 'StrongPass123';
    const hashed = await hashPassword(plain);

    expect(hashed).not.toBe(plain);
    expect(hashed).toMatch(/\$2[aby]\$\d{2}\$/);
    await expect(comparePassword(plain, hashed)).resolves.toBe(true);
    await expect(comparePassword('wrong-password', hashed)).resolves.toBe(false);
  });
});
