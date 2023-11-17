import { client } from 'tmi.js';
import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readCommands, commandHandlerFactory } from './handlers/commands';
config();

const discordREST = new REST().setToken(process.env.DISCORD_TOKEN ?? "");

const twitchClient = client({
    options: { debug: true },
    connection: {
        reconnect: true,
    },
    identity: {
        username: 'jerrythepogchamp',
        password: process.env.TWITCH_OAUTH
    },
    channels: ['jerrythepogchamp']
});

const twitchCommands = readCommands();
const onCommand = commandHandlerFactory(twitchCommands);

twitchClient.on('connected', () => {
    twitchClient.action('jerrythepogchamp', 'Hello w0rthy few! Jerry is here to help the stream!');
});

twitchClient.on('message', async (channel, userstate, message, self) => {

    if (message.startsWith(process.env.PREFIX || '!')) {
        onCommand(twitchClient, discordREST, channel, userstate, message);
    }
    console.log(`channel: ${channel}, message: ${message}`);
});

twitchClient.connect();