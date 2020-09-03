import { join } from 'lodash';
import { log } from './logging';
import { Message, GuildMember } from 'discord.js';

export async function handleCodenamesCommand(msg: Message): Promise<void> {
    log(`Received !codenames request`);
    const codenamesDomain = 'horsepaste.com';

    var players = msg.member?.voice?.channel?.members;
    if (players == null) {
        log('Ignoring !codenames from member not in voice channel')
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
        `Playing codenames at https://${codenamesDomain}/buttdestroyer with teams:

:red_circle: **Red team** :red_circle:
${format_team_list(red_team_players)}

:blue_heart: **Blue team** :blue_heart:
${format_team_list(blue_team_players)}`,
    );
}
