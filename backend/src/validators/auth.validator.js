const { z } = require('zod');

const roleEnum = z.enum(['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER']);

const registerSchema = z.object({
  name: z.string().trim().min(2).max(50),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  role: roleEnum.optional().default('TEAM_MEMBER'),
}).superRefine((data, ctx) => {
  if (data.role === 'ADMIN') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'ADMIN role is not allowed for public registration',
      path: ['role'],
    });
  }
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  profileImage: z.string().trim().optional(),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
});

const roleUpdateSchema = z.object({
  role: roleEnum,
});

const statusUpdateSchema = z.object({
  isActive: z.boolean(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  passwordChangeSchema,
  roleUpdateSchema,
  statusUpdateSchema,
};
