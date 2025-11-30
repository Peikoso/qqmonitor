import express from 'express';
import { AppSettingsController } from '../controllers/app-settings.js';

const router = express.Router();

router.get('/', AppSettingsController.getAllAppSettings);
router.post('/', AppSettingsController.createAppSettings);
router.put('/', AppSettingsController.updateAppSettings);
router.delete('/:key', AppSettingsController.deleteAppSettings);

export default router;