import express from 'express';
import { ChannelsController } from '../controllers/channels.js';

const router = express.Router();

router.get('/', ChannelsController.getAllChannels);
router.get('/active', ChannelsController.getAllActiveChannels);
router.post('/', ChannelsController.createChannel);
router.patch('/:id', ChannelsController.updateChannel);
router.delete('/:id', ChannelsController.deleteChannel);

export default router;