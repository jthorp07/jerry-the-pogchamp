import { ChatUserstate, Client as TwitchClient } from 'tmi.js';
import { REST as DiscordREST } from 'discord.js';
import { types, execute } from '../util/spin_free_vod_forum.ts';
import {  } from '../util/discord_rest';

const queue = {
    buf: new Array(),
    running: false,
    async start() {
        if (!this.running) {
            this.running = true;
            while (!(this.buf.length == 0)) {
                this.buf.shift().call();
            }
            this.running = false;
        }
    },

}
var joinable = false;
const discordIds = new Map();
const subcommands = new Map();
subcommands.set(
    'open', 
    async (bot: TwitchClient, discord: DiscordREST, channel: string, userstate: ChatUserstate, message: string, args: string[]) => {
        let uname = userstate.username;
        if (uname != 'w0rthytv' && uname != 'veragault2012' && uname != 'ostival') {
            bot.action(channel, 'You don\'t have permission to use this command!');
            return;
        }
        if (joinable) {
            bot.action(channel, 'The raffle is already open!');
            return;
        }
        bot.action(channel, 'The raffle is now open!');
        joinable = true;
    }
);
subcommands.set(
    'close', 

    async (bot: TwitchClient, discord: DiscordREST, channel: string, userstate: ChatUserstate, message: string, args: string[]) => {
        let uname = userstate.username;
        if (uname != 'w0rthytv' && uname != 'veragault2012' && uname != 'ostival') {
            bot.action(channel, 'You don\'t have permission to use this command!');
            return;
        }
        if (!joinable) {
            bot.action(channel, 'The raffle is already closed!');
            return;
        }
        bot.action(channel, 'used subcommand close!');
        joinable = false;
    }
);
subcommands.set(
    'roll', 
    async (bot: TwitchClient, discord: DiscordREST, channel: string, userstate: ChatUserstate, message: string, args: string[]) => {
        let uname = userstate.username;
        console.log(`uname = ${uname}`);
        console.log(JSON.stringify(args));
        if (uname != 'w0rthytv' && uname != 'veragault2012' && uname != 'ostival') {
            bot.action(channel, 'You don\'t have permission to use this command!');
            return;
        }
        if (joinable) {
            bot.action(channel, 'Subcommand [roll] cannot be used while the raffle is joinable. Use subcommand [close] first to close the raffle!');
            return;
        }
        if (args[0] != types.patreon && args[0] != types.standard) {
            bot.action(channel, `Subcommand [roll] requires an extra argument that is either [${types.patreon}] or [${types.standard}]`);
            return;
        }
        // execute(await getWca(discord), bot, args[0], discordIds);
        bot.action(channel, 'executing a raffle roll...');
    }
);
subcommands.set(
    'join',
    async (bot: TwitchClient, discord: DiscordREST, channel: string, userstate: ChatUserstate, message: string, args: string[]) => {
        if (!joinable) {
            bot.action(channel, 'Sorry, the raffle is closed right now!');
            return;
        }
        if (discordIds.has(args[0])) {
            bot.action(channel, 'You are already in the raffle!');
            return;
        }
        discordIds.set(args[0], userstate.username);
        bot.action(channel, 'You are now in the raffle assuming you have an approved VoD post in w0rthy\'s discord!');
    }
);
subcommands.set(
    'reset',
    async (bot: TwitchClient, discord: DiscordREST, channel: string, userstate: ChatUserstate, message: string, args: string[]) => {
        let uname = userstate.username;
        if (uname != 'w0rthytv' && uname != 'veragault2012' && uname != 'ostival') {
            bot.action(channel, 'You don\'t have permission to use this command!');
            return;
        }
        for (let key of discordIds.keys()) {
            discordIds.delete(key);
        }
        bot.action(channel, 'The raffle has been reset!');
    }
);

module.exports = {
    command: 'raffle',
    subcommands: subcommands,
    cmd: async (bot: TwitchClient, discord: DiscordREST, channel: string, userstate: ChatUserstate, message: string, args: string[]) => {
        bot.action(channel.substring(1), 'This command can only be used with the following subcommands: [open] [close] [roll] [join] [reset]');
    }
}