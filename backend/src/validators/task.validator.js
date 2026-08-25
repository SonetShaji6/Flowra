const { z } = require('zod');

const taskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']);
const taskPriorityEnum = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

const subtaskSchema = z.object({
  title: z.string().trim().min(1),
  isCompleted: z.boolean().optional().default(false),
});

const taskCreateSchema = z.object({
  project: z.string().min(1, 'Project ID is required'),
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200),
  description: z.string().trim().max(5000).optional().default(''),
  assignedTo: z.string().optional().nullable(),
  priority: taskPriorityEnum.optional().default('MEDIUM'),
  status: taskStatusEnum.optional().default('TODO'),
  deadline: z.string().optional().nullable(),
  subtasks: z.array(subtaskSchema).optional().default([]),
});

const taskUpdateSchema = z.object({
  title: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  assignedTo: z.string().optional().nullable(),
  priority: taskPriorityEnum.optional(),
  status: taskStatusEnum.optional(),
  deadline: z.string().optional().nullable(),
  subtasks: z.array(subtaskSchema).optional(),
});

const taskStatusSchema = z.object({
  status: taskStatusEnum,
});

module.exports = {
  taskCreateSchema,
  taskUpdateSchema,
  taskStatusSchema,
};
