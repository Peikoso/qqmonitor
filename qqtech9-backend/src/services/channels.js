import { Channels } from "../models/channels.js";
import { ChannelsRepository } from "../repositories/channels.js";
import { NotFoundError } from "../utils/errors.js";
import { isValidUuid } from "../utils/validations.js";
import { AuthService } from "./auth.js";

export const ChannelService = {
    getAllChannels: async (currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);
        
        const channels = await ChannelsRepository.findAll();

        return Channels.fromArray(channels);
    },

    getAllChannelsActive: async () => {
        const channels = await ChannelsRepository.findActiveChannels();

        return channels;
    },

    getChannelById: async (id) => {
        if(!isValidUuid(id)) {
            throw new NotFoundError("Invalid channel UUID.");
        }

        const channel = await ChannelsRepository.findById(id);
        
        if(!channel) {
            throw new NotFoundError("Channel not found.");
        }
        
        return channel;
    },

    createChannel: async (dto, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        const newChannel = new Channels(dto);

        const savedChannel = await ChannelsRepository.create(newChannel);

        return savedChannel;
    },

    updateChannel: async (id, dto, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        const existingChannel = await ChannelService.getChannelById(id);

        const updatedChannel = new Channels({
            ...existingChannel,
            ...dto,
            updatedAt: new Date(),
        });

        const savedChannel = await ChannelsRepository.update(updatedChannel);

        return savedChannel;
    },

    deleteChannel: async (id, currentUserFirebaseUid) => {
        await AuthService.requireAdmin(currentUserFirebaseUid);

        await ChannelService.getChannelById(id);

        await ChannelsRepository.delete(id);
    },
};