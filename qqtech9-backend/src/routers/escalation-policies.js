import express from 'express';
import { EscalationPoliciesController } from '../controllers/escalation-policies.js';

const router = express.Router();

router.get('/', EscalationPoliciesController.getAllEscalationPolicies);
router.post('/', EscalationPoliciesController.createEscalationPolicy);
router.put('/:id', EscalationPoliciesController.updateEscalationPolicy);
router.delete('/:id', EscalationPoliciesController.deleteEscalationPolicy);

export default router;