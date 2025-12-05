import { RulesController } from '../controllers/rules.js';
import express from 'express';

const router = express.Router();

router.get('/', RulesController.getAllRules);
router.post('/', RulesController.createRule);
router.patch('/:id', RulesController.updateRule);
router.delete('/:id', RulesController.deleteRule);

router.post('/:id/toggle-silence', RulesController.updateRuleSilenceMode);
router.post('/:id/toggle-execution', RulesController.updateRuleActiveStatus);

export default router;
