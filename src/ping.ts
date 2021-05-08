import { ApplicationCommandData, CommandInteraction } from 'discord.js';

export const pingCommand: ApplicationCommandData = {
    name: 'smeetherson_ping',
    description: 'test command to verify that Smeetherson lives'
};

export async function handlePingCommand(msg: CommandInteraction): Promise<void> {
    await msg.reply('Pong!');
}
