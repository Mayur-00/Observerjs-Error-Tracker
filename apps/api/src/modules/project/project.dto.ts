import { z } from 'zod';

export const createProjectSchema = z.object({
    name:z.string().min(1, "name is required").max(15, "maximum character length is 15")
})
export type createProjectDto = z.infer<typeof createProjectSchema>;

export const getProjectSchema = z.object({
    project_id:z.string().min(1, "name is required")
})
export type getProjectDto = z.infer<typeof getProjectSchema>;