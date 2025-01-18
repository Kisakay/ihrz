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
    BaseGuildTextChannel,
    ButtonInteraction,
    CacheType,
    ChatInputCommandInteraction,
    Client,
} from 'discord.js';

import { TicketTranscript } from '../../../core/modules/ticketsManager.js';
import { LanguageData } from '../../../../types/languageData';
import { Command } from '../../../../types/command';


import { SubCommand } from '../../../../types/command';

export const subCommand: SubCommand = {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached">, lang: LanguageData, args?: string[]) => {        


        // Guard's Typing
        if (!interaction.member || !client.user || !interaction.user || !interaction.guild || !interaction.channel) return;

        if (await client.db.get(`${interaction.guildId}.GUILD.TICKET.disable`)) {
            await interaction.editReply({ content: lang.ticket_disabled_command });
            return;
        };

        if (!await client.method.isTicketChannel(interaction.channel as BaseGuildTextChannel)) {
            await interaction.editReply({ content: lang.transript_not_in_ticket });
            return;
        } 
        await TicketTranscript(interaction as unknown as ButtonInteraction<"cached">);
    }
};