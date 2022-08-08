import { VoiceBasedChannel } from 'discord.js';
import {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    entersState,
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
    let audioPlayer;
    let subscription;

    try {
        audioPlayer = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Stop,
            },
        });

        subscription = connection.subscribe(audioPlayer);

        await new Promise((resolve, reject) => {
            audioPlayer.play(createAudioResource(file));

            audioPlayer.once('error', reject);
            audioPlayer.once(AudioPlayerStatus.Idle, resolve);
        });
    } finally {
        subscription?.unsubscribe();
        audioPlayer?.stop();
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
            log(
                `Waiting for voice connection to become ready (currently ${connection.state.status})`,
            );
            await entersState(connection, VoiceConnectionStatus.Ready, 5_000);
        }

        log(`Playing ${soundFile} in ${voiceChannel.id}`);
        await playFileAsync(connection, soundFile);
    } finally {
        try {
            log(
                `Destroying connection to voice channel ${voiceChannel.id} (final state ${connection.state.status})`,
            );
            await connection.destroy();
        } finally {
            isLocked = false;
        }
    }
}
