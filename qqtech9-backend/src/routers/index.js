import express  from 'express';

import rulesRouter from './rules.js';
import usersRouter from './users.js';
import rolesRouter from './roles.js';
import incidentsRouter from './incidents.js'
import schedulesRouter from './schedules.js';
import escalationPoliciesRouter from './escalation-policies.js';
import runnersRouter from './runners.js';
import sqlTestsRouter from './sql-test.js';
import userPreferencesRouter from './user-preferences.js';
import channelsRouter from './channels.js';
import notificationsRouter from './notifications.js';
import auditLogsRouter from './audit-logs.js';
import dbTestRouter from './db-test.js';
import loginRouter from './login.js';
import metricsRouter from './metrics.js';

const router = express.Router();

router.use('/rules', rulesRouter);
router.use('/users', usersRouter);
router.use('/roles', rolesRouter);
router.use('/incidents', incidentsRouter);
router.use('/schedules', schedulesRouter);
router.use('/escalation-policies', escalationPoliciesRouter);
router.use('/runners', runnersRouter);
router.use('/sql-tests', sqlTestsRouter);
router.use('/user-preferences', userPreferencesRouter);
router.use('/config', channelsRouter);
router.use('/notifications', notificationsRouter);
router.use('/audit-logs', auditLogsRouter);
router.use('/db-test', dbTestRouter);
router.use('/login', loginRouter);
router.use('/metrics', metricsRouter);

export default router;
