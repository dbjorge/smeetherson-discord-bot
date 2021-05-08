import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import { log } from './logging';
import { ApplicationCommandData, ApplicationCommandOptionType, CommandInteraction, GuildMember, Message } from 'discord.js';
import { playSoundFileAsync } from './sound-player';

const tauntsFolder = path.join(__dirname, '..', 'resources', 'taunts');

const existsAsync = util.promisify(fs.exists);

export const tauntCommand: ApplicationCommandData = {
    name: 'taunt',
    description: 'Play an Age of Empires taunt sound',
    options: [{
       name: 'num',
       type: 'INTEGER', // ApplicationCommandOptionType.INTEGER?,
       required: true,
       description: 'The taunt number (1-32)',
    }]
};

export async function handleTauntCommand(interaction: CommandInteraction): Promise<void> {
    const numOption = interaction.options.filter(o => o.name === 'num');
    if (numOption) {
        await tryPlayTauntFor(numOption.value as number, interaction.member);    
    }
}

export async function handleTauntMessage(msg: Message): Promise<void> {
    const tauntNumberMatches = /^\d+/.exec(msg.content);
    if (tauntNumberMatches == null) {
        return;
    }

    log(`Considering taunt response for ${msg.content}`)

    const tauntNumber = parseInt(tauntNumberMatches[0]);

    await tryPlayTauntFor(tauntNumber, msg?.member);
}

async function tryPlayTauntFor(tauntNumber: number, member: GuildMember | undefined) {
    const tauntFilename = `${tauntNumber}.mp3`;
    const tauntFile = path.join(tauntsFolder, tauntFilename);

    if (!(await existsAsync(tauntFile))) {
        log(`Ignoring ${tauntNumber}: no taunt file`);
        return;
    }

    const voiceChannel = member?.voice?.channel;
    if (voiceChannel == null) {
        log(`Ignoring ${tauntNumber}: sender not in voice channel`);
        return;
    }

    log(`Connecting and playing taunt file: ${tauntFile}`);
    await playSoundFileAsync(voiceChannel, tauntFile);
}
