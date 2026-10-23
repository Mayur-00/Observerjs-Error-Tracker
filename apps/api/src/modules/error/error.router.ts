import { Router } from 'express';

import { requireAuth } from '../../middlewares';
import { IErrorController } from './error.types';


export function createErrorRoutes(controller: IErrorController): Router {
  const router = Router();

  router.patch('/state', requireAuth, controller.updateState);
  router.get('/project/:project_id', requireAuth, controller.getProjectErrors);
  router.get('/:id', requireAuth, controller.getError);
  return router;
}
