import * as Discord from 'discord.js';
import * as lodash from 'lodash';

export interface IAuthConfig {
    token: string
}

var authConfig = require('../auth.json') as IAuthConfig;

var bot = new Discord.Client();
var log = console.log;

bot.on('ready', () => {
    log(`Logged in as ${bot.user.tag}`);
});

bot.on('message', msg => {
    switch(msg.content) {
        case '!smeetherson_ping': {
            log(`Received ping message: ${msg}`);
            msg.reply('Pong!');
        }

        case '!codenames': {
            log(`Received !codenames request`);
            var players = msg.member.voiceChannel.members;
            
            var red_team_size = Math.ceil(players.size / 2);
            
            var red_team_players = players.random(red_team_size);
            var blue_team_players = players.filter(p => !red_team_players.some(rtp => rtp.id === p.id)).array();
            
            function format_team_list(players: Discord.GuildMember[]): string {
                return lodash.join(
                    players.map(p => `* <@${p.user.id}>`),
                    "\n");
            };

            msg.reply(
`Playing codenames at https://hackervoiceim.in/buttdestroyer with teams:

:red_circle: **Red team** :red_circle:
${format_team_list(red_team_players)}

:blue_heart: **Blue team** :blue_heart:
${format_team_list(blue_team_players)}`);
        }
    }
});

bot.login(authConfig.token);