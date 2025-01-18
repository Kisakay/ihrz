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

import {
    ChatInputCommandInteraction,
    Client,
    Message,
    PermissionsBitField,
} from 'discord.js';
import { LanguageData } from '../../../../types/languageData';
import { Command } from '../../../../types/command';


import { SubCommand } from '../../../../types/command';

export const subCommand: SubCommand = {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached"> | Message, lang: LanguageData, args?: string[]) => {

        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.guild || !interaction.channel) return;

        if (await client.db.get(`${interaction.guildId}.ECONOMY.disabled`) === true) {
            await client.method.interactionSend(interaction, {
                content: lang.economy_disable_msg
                    .replace('${interaction.user.id}', interaction.member.user.id)
            });
            return;
        };

        if (interaction instanceof ChatInputCommandInteraction) {
            var type = interaction.options.getString("type")!;
            var cooldown = interaction.options.getString("time")!;
        } else {
            var type = client.method.string(args!, 0)!;
            var cooldown = client.method.string(args!, 1)!;
        };

        let time = client.timeCalculator.to_ms(cooldown);

        if (!time) {
            await client.method.interactionSend(interaction, {
                content: "Invalid time format. Please use a valid time format."
            });
            return;
        }

        await client.db.set(`${interaction.guildId}.ECONOMY.settings.${type}.cooldown`, time);

        await client.method.interactionSend(interaction, {
            content: `Successfully set the cooldown for ${type} to ${client.timeCalculator.to_beautiful_string(time)}`
        });
    },
};