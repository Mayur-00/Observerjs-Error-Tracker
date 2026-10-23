import { Router } from 'express';
import { SdkController } from './sdk.controller.js';
import { requireAuth, verifykey } from '../../middlewares/index.js';

export function createSdkRoutes(controller: SdkController): Router {
  const router = Router();

  // OAuth flow
  router.post('/', verifykey, controller.createOrIncreamentError);
  return router;
}
