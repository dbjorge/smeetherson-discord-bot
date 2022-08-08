import * as Discord from 'discord.js';
import * as util from 'util';
import { log } from './logging';

export function registerMessageHandler(
    bot: Discord.Client,
    handler: (msg: Discord.Message) => Promise<any>,
) {
    bot.on('messageCreate', async (msg) => {
        try {
            await handler(msg);
        } catch (e) {
            log(`MESSAGE HANDLER ERROR: ${util.inspect(e)}`);
        }
    });
}

export function registerCommandHandler(
    bot: Discord.Client,
    command: string,
    handler: (msg: Discord.Message) => Promise<any>,
) {
    const bangCommand = `!${command}`;

    registerMessageHandler(bot, async (msg) => {
        if (msg.content.startsWith(bangCommand)) {
            log(`Triggering command handler for ${bangCommand}`);
            await handler(msg);
        }
    });
}
