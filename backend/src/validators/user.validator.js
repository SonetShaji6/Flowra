const { z } = require('zod');

const roleEnum = z.enum(['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER']);

const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(50).optional(),
  profileImage: z.string().trim().url().optional().or(z.literal('')),
});

const passwordSchema = z.object({
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
  profileUpdateSchema,
  passwordSchema,
  roleUpdateSchema,
  statusUpdateSchema,
};
