import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { log } from './logging';
import { Message } from 'discord.js';

const tauntsFolder = path.join(__dirname, '..', 'resources', 'aoe-taunts');

const existsAsync = util.promisify(fs.exists);

export async function handleAoeTauntMessage(msg: Message): Promise<void> {
    const tauntNumberMatches = /^\d+/.exec(msg.content);
    if (tauntNumberMatches == null) {
        return;
    }

    log(`Considering AOE taunt response for ${msg.content}`)

    const tauntNumber = parseInt(tauntNumberMatches[0]);
    const tauntFilename = `${tauntNumber}.mp3`;
    const tauntFile = path.join(tauntsFolder, tauntFilename);

    if (!(await existsAsync(tauntFile))) {
        log(`Ignoring ${tauntNumber}: no taunt file`);
        return;
    }

    const voiceChannel = msg.member.voiceChannel;
    if (voiceChannel == null) {
        log(`Ignoring ${tauntNumber}: sender not in voice channel`);
        return;
    }

    log(`Playing taunt file: ${tauntFile}`);
    const connection = await voiceChannel.join();
    const dispatcher = connection.playFile(tauntFile);

    dispatcher.on('finish', () => {
        log(`Finished playing taunt file ${tauntFile}`);
    });
}
