const { Client: TwitchClient, ChatUserstate } = require('tmi.js');
const { REST: DiscordREST } = require('discord.js');
const { readdirSync } = require('fs');
const { join } = require('path');

module.exports = {
    readCommands: () => {
        const commandMap = new Map();
        const commandFiles = readdirSync(join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const cmd = require(join(__dirname, `../commands/${file}`));
            console.log(join(__dirname, `../commands/${file}`));
            commandMap.set(cmd.command, cmd);
        }
        console.log(JSON.stringify(commandMap));
        return commandMap;
    },
    commandHandlerFactory: (commands) => {
        /**
         * @param {TwitchClient} bot
         * @param {DiscordREST} discord
         * @param {string} channel 
         * @param {ChatUserstate} userstate 
         * @param {string} message 
         */
        return (bot, discord, channel, userstate, message) => {

            const splitTrimmedMessage = message.substring((process.env.PREFIX || '!').length).split(' ')
            const cmd = commands.get(splitTrimmedMessage[0]);
            const sub = splitTrimmedMessage.length > 1 ? splitTrimmedMessage[1] : undefined;
            let subcmd = cmd.subcommands.get(sub);
            let args = [];
            let i = 0;
            if (subcmd) {
                i = 2;
            } else {
                i = 1;
            }
            while (i < splitTrimmedMessage.length) {
                args.push(splitTrimmedMessage[i]);
            }
            subcmd ? subcmd(bot, discord, channel, userstate, message, args) : cmd.cmd(bot, discord, channel, userstate, message, args);

        }
    }
}