import { CreateChannelsDto } from "../dto/channels/create-channels-dto.js";
import { ResponseChannelsDto } from "../dto/channels/response-channels-dto.js";
import { ChannelService } from "../services/channels.js";

export const ChannelsController = {
    getAllChannels: async (req, res) => {
        const channels = await ChannelService.getAllChannels();

        const response = ResponseChannelsDto.fromArray(channels);

        return res.status(200).json(response);
    },

    createChannel: async (req, res) => {
        const channelData = req.body;

        const dto = new CreateChannelsDto(channelData).validate();
        
        const newChannel = await ChannelService.createChannel(dto);

        const response = new ResponseChannelsDto(newChannel);

        return res.status(201).json(response);
    },

    updateChannel: async (req, res) => {
        const id = req.params.id;

        const channelData = req.body;

        const dto = new CreateChannelsDto(channelData).validate();

        const updatedChannel = await ChannelService.updateChannel(id, dto);

        const response = new ResponseChannelsDto(updatedChannel);

        return res.status(200).json(response);
    },

    deleteChannel: async (req, res) => {
        const id = req.params.id;

        await ChannelService.deleteChannel(id);

        return res.status(204).send();
    },
};