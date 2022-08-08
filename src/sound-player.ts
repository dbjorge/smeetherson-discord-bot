import { VoiceBasedChannel } from 'discord.js';
import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    joinVoiceChannel,
    NoSubscriberBehavior,
    VoiceConnection,
    VoiceConnectionState,
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

            audioPlayer.once('error', reject);
            audioPlayer.once(AudioPlayerStatus.Idle, resolve);
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
        if (connection.state.status !== VoiceConnectionStatus.Ready) {
            log(`Waiting for voice connection to become ready (currently ${connection.state.status})`);
            await new Promise((resolve, reject) => {
                connection.once(VoiceConnectionStatus.Ready, resolve);
                connection.once(VoiceConnectionStatus.Disconnected, () =>
                    reject(new Error('Voice connection disconnected')),
                );
                connection.once(VoiceConnectionStatus.Destroyed, () =>
                    reject(new Error('Voice connection destroyed')),
                );
            });
        }

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
