import { join } from 'lodash';
import { log } from './logging';
import { ApplicationCommandData, CommandInteraction, GuildMember } from 'discord.js';

const defaultServer = 'horsepaste.com';
const defaultGameid = 'buttdestroyer';

export const codenamesCommand: ApplicationCommandData = {
    name: 'codenames',
    description: 'Splits your current voice channel members into two teams for a game of Codenames',
    options: [{
        name: 'gameid',
        type: 'STRING',
        description: `The game ID (name part of the URL) (by default, ${defaultGameid})`,
        required: false,
    }, {
        name: 'server',
        type: 'STRING',
        description: `The codenames domain (by default, ${defaultServer})`,
        required: false,
    }]
};

export async function handleCodenamesCommand(msg: CommandInteraction): Promise<void> {
    log(`Received /codenames request`);
    const gameid = msg.options.filter(o => o.name === 'gameid')?.value || defaultGameid;
    const server = msg.options.filter(o => o.name === 'server')?.value || defaultServer;

    var players = msg.member?.voice?.channel?.members;
    if (players == null) {
        log('Ignoring /codenames from member not in voice channel')
        return;
    }

    var red_team_size = Math.ceil(players.size / 2);

    var red_team_players = players.random(red_team_size);
    var blue_team_players = players
        .filter((p) => !red_team_players.some((rtp) => rtp.id === p.id))
        .array();

    function format_team_list(players: GuildMember[]): string {
        return join(
            players.map((p) => `* <@${p.user.id}>`),
            '\n',
        );
    }

    await msg.reply(
        `Playing codenames at https://${server}/${gameid} with teams:

:red_circle: **Red team** :red_circle:
${format_team_list(red_team_players)}

:blue_heart: **Blue team** :blue_heart:
${format_team_list(blue_team_players)}`,
    );
}
