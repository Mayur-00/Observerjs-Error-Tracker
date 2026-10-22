import { Router } from 'express';

import { requireAuth } from '../../middlewares';
import { ProjectController } from './project.controller.js';

export function createProjectRouts(controller: ProjectController): Router {
  const router = Router();

  // OAuth flow
  router.post('/create', requireAuth, controller.createProject);
  return router;
}
