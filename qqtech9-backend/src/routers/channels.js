import express from 'express';
import { ChannelsController } from '../controllers/channels.js';

const router = express.Router();

router.get('/', ChannelsController.getAllChannels);
router.post('/', ChannelsController.createChannel);
router.put('/:id', ChannelsController.updateChannel);
router.delete('/:id', ChannelsController.deleteChannel);

export default router;