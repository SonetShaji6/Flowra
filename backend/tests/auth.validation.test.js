const { registerSchema, loginSchema } = require('../src/validators/auth.validator');

describe('Auth validation', () => {
  it('rejects invalid email format on register', () => {
    const result = registerSchema.safeParse({
      name: 'Jane Doe',
      email: 'not-an-email',
      password: 'StrongPass123',
      role: 'TEAM_MEMBER',
    });

    expect(result.success).toBe(false);
  });

  it('rejects privileged role registration for a public user', () => {
    const result = registerSchema.safeParse({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'StrongPass123',
      role: 'ADMIN',
    });

    expect(result.success).toBe(false);
  });

  it('accepts valid login payload', () => {
    const result = loginSchema.safeParse({
      email: 'jane@example.com',
      password: 'StrongPass123',
    });

    expect(result.success).toBe(true);
  });
});
