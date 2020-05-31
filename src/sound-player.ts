import { VoiceChannel, VoiceConnection } from "discord.js";
import { log } from "./logging";

let isLocked = false;

async function playFileAsync(connection: VoiceConnection, file: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const dispatcher = connection.play(file);

        dispatcher.on('finish', resolve);
        dispatcher.on('error', reject);
    });
}

export async function playSoundFileAsync(voiceChannel: VoiceChannel, soundFile: string) {
    if (isLocked) {
        log('Ignoring concurrent playSoundFileAsync');
        return;
    }
    isLocked = true;

    log(`Connecting to voice channel ${voiceChannel.id}`);
    const connection = await voiceChannel.join();
    try {
        log(`Playing ${soundFile} in ${voiceChannel.id}`);
        await playFileAsync(connection, soundFile);
    } finally {
        try {
            log(`Disconnecting from voice channel ${voiceChannel.id}`);
            await voiceChannel.leave();
        } finally {
            isLocked = false;
        }        
    }
}