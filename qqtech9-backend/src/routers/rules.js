import { RulesController } from '../controllers/rules.js';
import express from 'express';

const router = express.Router();

router.get('/', RulesController.getAllRules);
router.post('/', RulesController.createRule);
router.put('/:id', RulesController.updateRule);
router.delete('/:id', RulesController.deleteRule);

export default router;
