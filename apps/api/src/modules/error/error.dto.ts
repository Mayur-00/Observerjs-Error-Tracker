import z from "zod"



export const errorIdSchema = z.object({
    id:z.string().min(1, 'id is required')
});

export const errorProjectSchema = z.object({
    project_id:z.string().uuid('project_id must be a valid UUID')
});

export type errorIdDto = z.infer<typeof errorIdSchema>;
