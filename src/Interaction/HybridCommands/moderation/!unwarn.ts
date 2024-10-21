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
    Client,
    EmbedBuilder,
    PermissionsBitField,
    BaseGuildTextChannel,
    ChatInputCommandInteraction,
    GuildMember,
    Message,
} from 'discord.js';

import { LanguageData } from '../../../../types/languageData.js';
import { SubCommandArgumentValue } from '../../../core/functions/method.js';
import { DatabaseStructure } from '../../../../types/database_structure.js';

export default {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached"> | Message, data: LanguageData, command: SubCommandArgumentValue, execTimestamp?: number, args?: string[]) => {
        let permCheck = await client.method.permission.checkCommandPermission(interaction, command.command!);
        if (!permCheck.allowed) return client.method.permission.sendErrorMessage(interaction, data, permCheck.neededPerm || 0);

        // Guard's Typing
        if (!client.user || !interaction.member || !interaction.guild || !interaction.channel) return;;

        if (interaction instanceof ChatInputCommandInteraction) {
            var member = interaction.options.getMember("member") as GuildMember | null;
            var warnID = interaction.options.getString("warn-id")!;
        } else {
            var _ = await client.method.checkCommandArgs(interaction, command, args!, data); if (!_) return;
            var member = client.method.member(interaction, args!, 0) as GuildMember | null;
            var warnID = client.method.longString(args!, 1)!;
        };

        const permissionsArray = [PermissionsBitField.Flags.ModerateMembers]
        const permissions = interaction instanceof ChatInputCommandInteraction ?
            interaction.memberPermissions?.has(permissionsArray)
            : interaction.member.permissions.has(permissionsArray);


        if (!permissions && permCheck.neededPerm === 0) {
            await client.method.interactionSend(interaction, {
                content: data.unmute_dont_have_permission.replace("${client.iHorizon_Emojis.icon.No_Logo}", client.iHorizon_Emojis.icon.No_Logo)
            });
            return;;
        };

        let allWarns: DatabaseStructure.WarnsData[] | null = await client.db.get(`${interaction.guildId}.USER.${member?.id}.WARNS`);

        if (!allWarns) {
            await client.method.interactionSend(interaction, {
                content: data.unwarn_cannot_found
                    .replace("${client.iHorizon_Emojis.icon.No_Logo}", client.iHorizon_Emojis.icon.No_Logo)
                    .replace("${member?.toString()}", member?.toString()!)
            })
            return;
        }

        if (!allWarns.find(x => x.id === warnID)) {
            await client.method.interactionSend(interaction, {
                content: data.unwarn_cannot_found_id
                    .replace("${client.iHorizon_Emojis.icon.No_Logo}", client.iHorizon_Emojis.icon.No_Logo)
                    .replace("${member?.toString()}", member?.toString()!)
            })
            return;
        }

        await client.db.set(`${interaction.guildId}.USER.${member?.id}.WARNS`,
            allWarns.filter(x => x.id !== warnID)
        )

        await client.method.interactionSend(interaction, {
            content: data.unwarn_command_ok
                .replace("${client.iHorizon_Emojis.icon.Yes_Logo}", client.iHorizon_Emojis.icon.Yes_Logo)
                .replace("${member?.toString()}", member?.toString()!)
        })

        await client.method.iHorizonLogs.send(interaction, {
            title: data.unwarn_logEmbed_title,
            description: data.unwarn_logEmbed_desc
                .replace("${interaction.member.toString()}", interaction.member.toString())
                .replace("${member?.toString()}", member?.toString()!)
        });

    },
};