import express from 'express';
import { EscalationPoliciesController } from '../controllers/escalation-policies.js';

const router = express.Router();

router.get('/', EscalationPoliciesController.getEscalationPolicy);
router.post('/', EscalationPoliciesController.createEscalationPolicy);
router.patch('/', EscalationPoliciesController.updateEscalationPolicy);
//router.delete('/:id', EscalationPoliciesController.deleteEscalationPolicy);

export default router;