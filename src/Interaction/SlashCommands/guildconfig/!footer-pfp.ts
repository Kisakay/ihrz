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
	PermissionsBitField,
} from 'discord.js';

import { LanguageData } from '../../../../types/languageData.js';
import { axios } from '../../../core/functions/axios.js';

import { Command } from '../../../../types/command.js';


import { SubCommand } from '../../../../types/command.js';

export const subCommand: SubCommand = {
	run: async (client: Client, interaction: ChatInputCommandInteraction<"cached">, lang: LanguageData, args?: string[]) => {


		// Guard's Typing
		if (!interaction.member || !client.user || !interaction.user || !interaction.guild || !interaction.channel) return;

		let action = interaction.options.getString("action");
		let footerAvatar = interaction.options.getAttachment("avatar")!;



		if (action === "reset") {
			await client.db.delete(`${interaction.guildId}.BOT.botPFP`);
			await interaction.editReply({ content: lang.guildconfig_setbot_footeravatar_is_reset });
			return;
		} else if (footerAvatar && footerAvatar.contentType?.startsWith("image")) {
			const fileBuffer = (await axios.get(footerAvatar.url!, { responseType: "arrayBuffer" })).data;
			const buffer = Buffer.from(fileBuffer);
			const base64String = buffer.toString('base64');

			await client.db.set(`${interaction.guildId}.BOT.botPFP`, base64String);

			await interaction.editReply({ content: lang.guildconfig_setbot_footeravatar_is_good });
			return;
		} else {
			await interaction.editReply({ content: lang.guildconfig_setbot_footeravatar_incorect });
			return;
		}
	},
};