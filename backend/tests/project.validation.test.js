const { projectCreateSchema, projectUpdateSchema } = require('../src/validators/project.validator');

describe('Project validation', () => {
  it('accepts a valid project payload', () => {
    const result = projectCreateSchema.safeParse({
      name: 'Website Revamp',
      description: 'Redesign the marketing site and improve conversion paths.',
      manager: '64b0a0b0f0f0f0f0f0f0f0f',
      members: ['64b0a0b0f0f0f0f0f0f0f0f'],
      deadline: '2026-09-30T00:00:00.000Z',
      status: 'PLANNING',
      priority: 'HIGH',
      progress: 25,
    });

    expect(result.success).toBe(true);
  });

  it('rejects an invalid status value', () => {
    const result = projectUpdateSchema.safeParse({
      status: 'INVALID_STATUS',
    });

    expect(result.success).toBe(false);
  });
});
