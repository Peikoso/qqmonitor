import { RolesController } from '../controllers/roles.js';
import express from 'express';

const router = express.Router();

router.get('/', RolesController.getAllRoles);
router.post('/', RolesController.createRole);
router.put('/:id', RolesController.updateRole);
router.delete('/:id', RolesController.deleteRole);

export default router;