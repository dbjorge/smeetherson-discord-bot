import { log } from './logging';
import { ChannelType, Message, TextChannel } from 'discord.js';

// returns without # prefix
function channelName(msg: Message): string | null {
    if (msg.channel.type !== ChannelType.GuildText) {
        return null;
    }

    return msg.channel.name;
}

export async function handlePogBattleMessage(msg: Message): Promise<void> {
    if (channelName(msg) !== 'pog-battle') {
        return;
    }

    log('adding default votes to pog battle');
    await msg.react('👈');
    await msg.react('👉');
}
