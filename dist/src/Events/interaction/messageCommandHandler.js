/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2025 iHorizon
*/
import { ApplicationCommandOptionType, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } from 'discord.js';
export async function parseMessageCommand(client, message) {
    const prefix = await client.func.prefix.guildPrefix(client, message.guildId);
    if (!message.content.startsWith(prefix.string)) {
        return { success: false };
    }
    const args = message.content.slice(prefix.string.length).trim().split(/ +/g);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) {
        return { success: false };
    }
    if (message.reference && message.reference.messageId) {
        const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
        if (referencedMessage && referencedMessage.author) {
            const mainCommand = client.message_commands.get(commandName);
            if (mainCommand && mainCommand.options) {
                const userOptionIndex = mainCommand.options.findIndex(opt => opt.type === ApplicationCommandOptionType.User);
                if (userOptionIndex !== -1 && args.length < mainCommand.options.length) {
                    args.splice(userOptionIndex, 0, referencedMessage.author.id);
                }
            }
        }
    }
    const directSubCommand = client.subCommands.get(commandName);
    if (directSubCommand) {
        const parentCommand = client.commands.find(cmd => cmd.options?.some(opt => opt.name === directSubCommand.name));
        return {
            success: true,
            args: args,
            command: parentCommand,
            subCommand: directSubCommand
        };
    }
    const mainCommand = client.message_commands.get(commandName);
    if (mainCommand) {
        const potentialSubCommandName = args[0]?.toLowerCase();
        if (potentialSubCommandName && mainCommand.options) {
            const subCommand = mainCommand.options.find(opt => (opt.name === potentialSubCommandName ||
                opt.aliases?.includes(potentialSubCommandName))
                &&
                    opt.type === (1 || 2) //sub or subgroup
            );
            if (subCommand) {
                args.shift();
                return {
                    success: true,
                    args: args,
                    command: mainCommand,
                    subCommand: subCommand
                };
            }
        }
        return {
            success: true,
            args: args,
            command: mainCommand
        };
    }
    return { success: false };
}
async function executeCommand(message, command, args, lang) {
    const channel = message.channel;
    const permissions = channel.permissionsFor(message.member);
    const canUseCommands = permissions.has(PermissionsBitField.Flags.UseApplicationCommands);
    if (!canUseCommands)
        return;
    let fetchFullCommandName = message.client.content.find(c => c.desc === command.description);
    let permCheck = await message.client.method.permission.checkCommandPermission(message, fetchFullCommandName?.cmd);
    if (!permCheck.allowed)
        return message.client.method.permission.sendErrorMessage(message, lang, permCheck.neededPerm || 0);
    // for format like: "+utils" without subcommand behind
    if (!command?.run) {
        await message.client.method.interactionSend(message, {
            embeds: [await message.client.method.createAwesomeEmbed(lang, command, message.client, message)],
            files: [await message.client.method.bot.footerAttachmentBuilder(message)]
        });
        return;
    }
    var _ = await message.client.method.checkCommandArgs(message, command, Array.from(args), lang);
    if (!_)
        return;
    await command.run(message.client, message, lang, command, 0, args);
}
async function handleCommandError(message, command, error) {
    const errorBlock = `\`\`\`TS\nMessage: The command ran into a problem!\nCommand Name: ${command.name}\nError: ${error}\`\`\`\n`;
    const channel = message.client.channels.cache.get(message.client.config.core.reportChannelID);
    if (channel) {
        await channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('MSG_CMD_CRASH_NOT_HANDLE')
                    .setDescription(errorBlock)
                    .setTimestamp()
                    .setFields({
                    name: "🛡️ Bot Admin",
                    value: message.guild?.members.me?.permissions.has(PermissionFlagsBits.Administrator) ? "yes" : "no"
                }, {
                    name: "📝 User Admin",
                    value: message.member?.permissions.has(PermissionFlagsBits.Administrator) ? "yes" : "no"
                }, {
                    name: "** **",
                    value: message.content
                })
            ]
        });
    }
}
export const event = {
    name: "messageCreate",
    run: async (client, message) => {
        if (!message.guild || message.author.bot || !message.channel)
            return;
        if (await client.method.helper.coolDown(message, "msg_commands", 1000)) {
            return;
        }
        if (await client.db.table('BLACKLIST').get(`${message.author.id}.blacklisted`)) {
            return;
        }
        const result = await parseMessageCommand(client, message);
        if (!result.success)
            return;
        try {
            const lang = await client.func.getLanguageData(message.guildId);
            if (result.subCommand) {
                await executeCommand(message, result.subCommand, result.args || [], lang);
            }
            else if (result.command) {
                await executeCommand(message, result.command, result.args || [], lang);
            }
        }
        catch (error) {
            await handleCommandError(message, result.subCommand || result.command, error);
        }
    }
};
