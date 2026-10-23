import { Router } from 'express';

import { requireAuth } from '../../middlewares';
import { ProjectController } from './project.controller.js';

export function createProjectRouts(controller: ProjectController): Router {
  const router = Router();

  router.post('/', requireAuth, controller.createProject);
  router.get('/all', requireAuth, controller.getAllProjects);
  router.get('/:project_id', requireAuth, controller.getProject);
  return router;
}
