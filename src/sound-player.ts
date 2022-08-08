import { VoiceBasedChannel } from 'discord.js';
import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    NoSubscriberBehavior,
    VoiceConnection,
    VoiceConnectionStatus,
} from '@discordjs/voice';
import { log } from './logging';

let isLocked = false;

async function playFileAsync(
    connection: VoiceConnection,
    file: string,
): Promise<void> {
    const audioPlayer = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Stop,
        },
    });

    try {
        connection.subscribe(audioPlayer);

        await new Promise((resolve, reject) => {
            audioPlayer.play(createAudioResource(file));

            audioPlayer.on('error', reject);
            audioPlayer.on(AudioPlayerStatus.Idle, resolve);
        });
    } finally {
        audioPlayer.stop();
    }
}

export async function playSoundFileAsync(
    voiceChannel: VoiceBasedChannel,
    soundFile: string,
) {
    if (isLocked) {
        log('Ignoring concurrent playSoundFileAsync');
        return;
    }
    isLocked = true;

    log(`Connecting to voice channel ${voiceChannel.id}`);
    const connection = await joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    try {
        log('Waiting for voice connection to become ready');
        await new Promise((resolve, reject) => {
            connection.on(VoiceConnectionStatus.Ready, resolve);
            connection.on(VoiceConnectionStatus.Disconnected, () =>
                reject(new Error('Voice connection disconnected')),
            );
            connection.on(VoiceConnectionStatus.Destroyed, () =>
                reject(new Error('Voice connection destroyed')),
            );
        });

        log(`Playing ${soundFile} in ${voiceChannel.id}`);
        await playFileAsync(connection, soundFile);
    } finally {
        try {
            log(`Disconnecting from voice channel ${voiceChannel.id}`);
            await connection.destroy();
        } finally {
            isLocked = false;
        }
    }
}
