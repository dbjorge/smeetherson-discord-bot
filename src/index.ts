import * as Discord from 'discord.js';
import * as process from 'process';
import { log } from './logging';
import {
    registerCommandHandler,
    registerMessageHandler,
} from './register-handler';
import { handleCodenamesCommand } from './codenames';
import { handlePogBattleMessage } from './pog-battle';
import { handleTauntMessage } from './taunts';

let token: string | undefined = process.env['DISCORD_AUTH_TOKEN'];
if (token === undefined) {
    token = require('../auth.json').token;
}

var bot = new Discord.Client({
    intents: [
        // Guilds is an undocumented requirement for the bot to see
        // messages before it has sent one itself. See
        // https://stackoverflow.com/a/70087792
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.DirectMessages,
        Discord.GatewayIntentBits.MessageContent,
    ],
    partials: [
        Discord.Partials.Message,
        Discord.Partials.Channel,
        Discord.Partials.Reaction,
    ]
});

bot.on('ready', () => {
    log(`Logged in as ${bot.user?.tag}`);
});

registerCommandHandler(bot, 'smeetherson_ping', (m) => m.reply({ content: 'Pong!' }));
registerCommandHandler(bot, 'codenames', handleCodenamesCommand);
registerMessageHandler(bot, handleTauntMessage);
registerMessageHandler(bot, handlePogBattleMessage);

bot.login(token);
