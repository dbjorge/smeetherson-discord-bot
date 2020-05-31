import * as Discord from 'discord.js';
import * as process from 'process';
import { log } from './logging';
import {
    registerCommandHandler,
    registerMessageHandler,
} from './register-handler';
import { handleCodenamesCommand } from './codenames';
import { handlePogBattleMessage } from './pog-battle';
import { handleAoeTauntMessage } from './aoe-taunts';

let token: string | undefined = process.env['DISCORD_AUTH_TOKEN'];
if (token === undefined) {
    token = require('../auth.json').token;
}

var bot = new Discord.Client();

bot.on('ready', () => {
    log(`Logged in as ${bot.user.tag}`);
});

registerCommandHandler(bot, '!smeetherson_ping', (m) => m.reply('Pong!'));
registerCommandHandler(bot, '!codenames', handleCodenamesCommand);
registerMessageHandler(bot, handleAoeTauntMessage);
registerMessageHandler(bot, handlePogBattleMessage);

bot.login(token);
