import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { log } from './logging';
import { Message } from 'discord.js';

const tauntsFolder = path.join(__dirname, '..', 'resources', 'aoe-taunts');

const existsAsync = util.promisify(fs.exists);

export async function handleAoeTauntCommand(msg: Message): Promise<void> {
    log(`Received number message, interpreting as AOE taunt`);

    const matches = /^(\d+)/.exec(msg.content);
    if (matches == null || matches.length < 2) {
        log(
            'Confusing; received aoe taunt message that doesnt parse. Ignoring.',
        );
        return;
    }
    const tauntNumber = matches[1];
    const tauntFilename = `${tauntNumber}.mp3`;
    const tauntFile = path.join(tauntsFolder, tauntFilename);

    if (!(await existsAsync(tauntFile))) {
        log('Nonexistent taunt file; ignoring');
        return;
    }

    const voiceChannel = msg.member.voiceChannel;
    if (voiceChannel == null) {
        log('Sender not in a voice channel; ignoring');
        return;
    }

    log(`Playing taunt file ${tauntFile}`);
    const connection = await voiceChannel.join();
    const dispatcher = connection.playFile(tauntFile);

    dispatcher.on('finish', () => {
        log(`Finished playing taunt file ${tauntFile}`);
    });
}
