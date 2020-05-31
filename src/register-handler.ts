import * as Discord from 'discord.js';
import * as util from 'util';
import { log } from './logging';

export function registerMessageHandler(
    bot: Discord.Client,
    handler: (msg: Discord.Message) => Promise<any>,
) {
    bot.on('message', async (msg) => {
        try {
            await handler(msg);
        } catch (e) {
            log(`MESSAGE HANDLER ERROR: ${util.inspect(e)}`);
        }
    });
}

export function registerCommandHandler(
    bot: Discord.Client,
    command: string | RegExp,
    handler: (msg: Discord.Message) => Promise<any>,
) {
    const contentMatches =
        command instanceof RegExp
            ? command.test
            : (c: string) => c.startsWith(command);

    registerMessageHandler(bot, async (msg) => {
        if (contentMatches(msg.content)) {
            log(`Triggering command handler for ${command}`);
            await handler(msg);
        }
    });
}
