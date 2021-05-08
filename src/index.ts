import * as Discord from 'discord.js';
import * as process from 'process';
import { log } from './logging';
import { CommandRegistrar } from './command-registrar';
import { codenamesCommand, handleCodenamesCommand } from './codenames';
import { tauntCommand, handleTauntCommand, handleTauntMessage } from './taunt';
import { handlePingCommand, pingCommand } from './ping';

let testGuildId: string | undefined = process.env['DISCORD_TEST_GUILD_ID'];
let token: string | undefined = process.env['DISCORD_AUTH_TOKEN'];
if (token === undefined) {
    token = require('../auth.json').token;
}

var bot = new Discord.Client();
var commandRegistrar = new CommandRegistrar(bot, testGuildId);

bot.once('ready', async () => {
    log(`Logged in as ${bot.user?.tag}`);

    commandRegistrar.startListening();
    await commandRegistrar.register(pingCommand, handlePingCommand);
    await commandRegistrar.register(codenamesCommand, handleCodenamesCommand);
    await commandRegistrar.register(tauntCommand, handleTauntCommand);
    commandRegistrar.registerMessageHandler(handleTauntMessage);
});


bot.login(token);
