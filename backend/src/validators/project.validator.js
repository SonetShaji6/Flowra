const { z } = require('zod');

const projectStatusEnum = z.enum(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED']);
const projectPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const projectCreateSchema = z.object({
  name: z.string().trim().min(2, 'Project name must be at least 2 characters').max(100),
  description: z.string().trim().min(5, 'Description must be at least 5 characters').max(2000),
  manager: z.string().optional(),
  members: z.array(z.string()).optional().default([]),
  startDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  status: projectStatusEnum.optional().default('PLANNING'),
  priority: projectPriorityEnum.optional().default('MEDIUM'),
  progress: z.number().min(0).max(100).optional().default(0),
});

const projectUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().min(5).max(2000).optional(),
  manager: z.string().optional(),
  members: z.array(z.string()).optional(),
  startDate: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  status: projectStatusEnum.optional(),
  priority: projectPriorityEnum.optional(),
  progress: z.number().min(0).max(100).optional(),
});

const memberAddSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

module.exports = {
  projectCreateSchema,
  projectUpdateSchema,
  memberAddSchema,
};
