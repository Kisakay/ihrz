/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2024 iHorizon
*/

import {
    BaseGuildTextChannel,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    Message,
    PermissionsBitField,
} from 'discord.js';


import logger from '../../../core/logger.js';
import backup from 'discord-rebackup';
import { LanguageData } from '../../../../types/languageData';
import { Command } from '../../../../types/command.js';
import { Option } from '../../../../types/option.js';
export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached"> | Message, lang: LanguageData, command: Command, neededPerm: number, args?: string[]) => {

        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.guild || !interaction.channel) return;

        const permissionsArray = [PermissionsBitField.Flags.Administrator]
        const permissions = interaction instanceof ChatInputCommandInteraction ?
            interaction.memberPermissions?.has(permissionsArray)
            : interaction.member.permissions.has(permissionsArray);

        if (!permissions && neededPerm === 0) {
            await client.method.interactionSend(interaction, { content: lang.backup_not_admin });
            return;
        };

        if (!interaction.guild.members.me?.permissions.has(PermissionsBitField.Flags.Administrator)) {
            await client.method.interactionSend(interaction, { content: lang.backup_i_dont_have_permission });
            return;
        };

        let i: number = 0;
        let j: number = 0;

        if (interaction instanceof ChatInputCommandInteraction) {
            var svMsg = interaction.options.getString('save-message')!;
        } else {
            
            var svMsg = client.method.string(args!, 0)!;
        };

        // @ts-ignore
        backup.create(interaction.guild, {
            maxMessagesPerChannel: svMsg === "yes" ? 10 : 0,
            jsonBeautify: true
        }).then(async (backupData) => {

            backupData.channels.categories.forEach(category => {
                i++;
                category.children.forEach(() => {
                    j++;
                });
            });

            let ellData = { guildName: backupData.name, categoryCount: i, channelCount: j };

            await client.db.set(`BACKUPS.${interaction.member?.user.id}.${backupData.id}`, ellData);

            client.method.channelSend(interaction, { content: lang.backup_command_work_on_creation });

            await client.method.interactionSend(interaction, {
                content: lang.backup_command_work_info_on_creation
                    .replace("${backupData.id}", backupData.id)
            });

            await client.method.iHorizonLogs.send(interaction, {
                title: lang.backup_logs_embed_title_on_creation,
                description: lang.backup_logs_embed_description_on_creation
                    .replace('${interaction.user.id}', interaction.member?.user.id!)
            });
        });
    },
};