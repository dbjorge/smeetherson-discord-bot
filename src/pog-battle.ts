import { log } from './logging';
import { Message, TextChannel } from 'discord.js';

// returns without # prefix
function channelName(msg: Message): string | null {
    if (msg.channel.type !== 'text') {
        return null;
    }
    const channel = msg.channel as TextChannel;
    return channel.name;
}

export async function handlePogBattleMessage(msg: Message): Promise<void> {
    if (channelName(msg) !== 'pog-battle') {
        return;
    }

    log('adding default votes to pog battle');
    await msg.react('👈');
    await msg.react('👉');
}
