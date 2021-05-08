import * as Discord from 'discord.js';
import * as util from 'util';
import { log } from './logging';

// Will only receive interactions for the registered command
export type CommandHandler = (interaction: Discord.CommandInteraction) => Promise<void>;
// Will receive all messages; must filter on its own
export type MessageHandler = (message: Discord.Message) => Promise<void>;

export class CommandRegistrar {
    public constructor(
        private readonly bot: Discord.Client,
        private readonly testGuildId: string | undefined,
    ) {}

    public startListening() {
        this.bot.on('interaction', this.onInteraction);
        this.bot.on('message', this.onMessage);
    }

    public async register(commandData: Discord.ApplicationCommandData, handler: CommandHandler): Promise<void> {
        this.commandHandlers[commandData.name] = handler;
        // Register for all servers (has an hour cache delay)
        await this.bot.application.commands.create(commandData);
        // Doesn't have the hour cache delay
        if (this.testGuildId) {
            const testGuild = await this.bot.guilds.fetch(this.testGuildId);
            await testGuild.commands.create(commandData);
        }
    }

    public registerMessageHandler(handler: MessageHandler) {
        this.messageHandlers.push(handler);
    }

    private commandHandlers: { [commandName: string]: CommandHandler } = {};
    private messageHandlers: MessageHandler[] = [];

    private onInteraction = async (interaction: Discord.Interaction) => {
        if (!interaction.isCommand()) { return; }
        const handler = this.commandHandlers[interaction.commandName];
        if (handler) {
            try {
                await handler(interaction);
            } catch (e) {
                log(`COMMAND HANDLER ERROR: ${util.inspect(e)}`);
            }
        }
    }

    private onMessage = async (msg: Discord.Message) => {
        for (const handler of this.messageHandlers) {
            try {
                await handler(msg);
            } catch (e) {
                log(`MESSAGE HANDLER ERROR: ${util.inspect(e)}`);
            }
        }
    }
}
