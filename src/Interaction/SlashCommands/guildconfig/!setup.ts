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
	Client,
	PermissionsBitField,
	ChannelType,
	PermissionFlagsBits,
	BaseGuildTextChannel,
	ChatInputCommandInteraction,
} from 'discord.js';
import { LanguageData } from '../../../../types/languageData.js';
import { Command } from '../../../../types/command.js';


import { SubCommand } from '../../../../types/command.js';

export const subCommand: SubCommand = {
	run: async (client: Client, interaction: ChatInputCommandInteraction<"cached">, lang: LanguageData, args?: string[]) => {


		// Guard's Typing
		if (!interaction.member || !client.user || !interaction.user || !interaction.guild || !interaction.channel) return;



		let logchannel = interaction.guild.channels.cache.find((channel: { name: string; }) => channel.name === 'ihorizon-logs');
		if (!logchannel) {
			interaction.guild.channels.create({
				name: 'ihorizon-logs',
				type: ChannelType.GuildText,
				permissionOverwrites: [
					{
						id: interaction.guild.roles.everyone,
						deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
					}
				],
			});

			await interaction.editReply({
				content: lang.setup_command_work.replace('${client.iHorizon_Emojis.icon.Yes_Logo}', client.iHorizon_Emojis.icon.Yes_Logo)
			});
			return;
		} else {
			await interaction.editReply({ content: lang.setup_command_error });
			return;
		};
	},
};