const { client } = require('tmi.js');
const { config } = require('dotenv');
config();

const bot = client({
	options: { debug: true },
    connection: {
        cluster: 'aws',
        reconnect: true,
    },
	identity: {
		username: 'jerry-the-pogchamp',
		password: process.env.OAUTH
	},
	channels: [ 'w0rthyTV' ]
});

bot.on('connected', () => {
    bot.action('w0rthyTV', 'Hello w0rthy few! Jerry is here to help the stream!');
});

bot.on('message', (channel, userstate, message, self) => {
    if (self || !(channel === 'w0rthyTV')) return;

    if (message === '!hello Jerry') {
        bot.action(channel, `Hi ${userstate['display-name'] || 'dude'}!`);
    }
})