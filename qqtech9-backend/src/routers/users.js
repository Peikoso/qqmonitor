import { UsersController } from '../controllers/users.js';
import express from 'express';

const router = express.Router();

router.get('/', UsersController.getAllUsers);
router.get('/me', UsersController.getSelf);
router.get('/:id', UsersController.getUserById);
router.post('/', UsersController.createUser);
router.post('/register', UsersController.registerUser);
router.post('/approve/:userId', UsersController.approveUser)
router.put('/me', UsersController.userUpdateSelf);
router.put('/:id', UsersController.adminUpdateUser);
router.delete('/:id', UsersController.deleteUser);

export default router;
