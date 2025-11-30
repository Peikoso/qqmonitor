import { Channels } from "../models/channels.js";
import { ChannelsRepository } from "../repositories/channels.js";
import { ForbiddenError, NotFoundError } from "../utils/errors.js";
import { isValidUuid } from "../utils/validations.js";

export const ChannelService = {
    getAllChannels: async () => { 
        const channels = await ChannelsRepository.findAll();

        return Channels.fromArray(channels);
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

    createChannel: async (dto) => { 
        const newChannel = new Channels(dto);

        const savedChannel = await ChannelsRepository.create(newChannel);

        return savedChannel;
    },

    updateChannel: async (id, dto) => {
        const existingChannel = await ChannelService.getChannelById(id);

        const updatedChannel = new Channels({
            ...existingChannel,
            ...dto,
            updatedAt: new Date(),
        });

        const savedChannel = await ChannelsRepository.update(updatedChannel);

        return savedChannel;
    },

    deleteChannel: async (id) => {
        await ChannelService.getChannelById(id);

        await ChannelsRepository.delete(id);
    },
};