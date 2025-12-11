import { UsersController } from '../controllers/users.js';
import express from 'express';
import { RegisterLimiter } from '../middleware/rate-limit.js';

const router = express.Router();

router.get('/', UsersController.getAllUsers);
router.get('/basic-info', UsersController.getAllwithBasicInfo);
router.get('/me', UsersController.getSelf);
router.get('/:id/name', UsersController.getUserNameById);
router.post('/', UsersController.createUser);
router.post('/register', RegisterLimiter, UsersController.registerUser);
router.post('/:userId/approve', UsersController.approveUser)
router.patch('/me', UsersController.userUpdateSelf);
router.patch('/fcm-token', UsersController.updateFcmToken);
router.patch('/:id', UsersController.adminUpdateUser);
router.delete('/:id', UsersController.deleteUser);

export default router;
