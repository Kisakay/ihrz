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
	ApplicationCommandType,
	ChatInputCommandInteraction,
	Client,
	CommandInteractionOptionResolver,
	EmbedBuilder,
	Message,
} from 'discord.js'

import { Command } from '../../../../types/command.js';
import ping from 'ping';
import { LanguageData } from '../../../../types/languageData.js';

export const command: Command = {
	name: 'ping',

	description: 'Get the bot latency!',
	description_localizations: {
		"fr": "Obtenir la latence du bot"
	},

	aliases: ["speed", "pong", "vitesse"],

	category: 'bot',
	thinking: false,
	type: ApplicationCommandType.ChatInput,
	permission: null,
	run: async (client: Client, interaction: ChatInputCommandInteraction<"cached"> | Message, lang: LanguageData, args?: string[]) => {


		// Guard's Typing
		if (!client.user || !interaction.member || !interaction.guild || !interaction.channel) return;

		const ogI = await client.func.method.interactionSend(interaction, { content: client.iHorizon_Emojis.icon.iHorizon_Discord_Loading });

		let _net01: number | string = '';
		let _net02: number | string = '';
		let _net03: number | string = '';
		let _net04: number | string = '';

		await ping.promise.probe("google.com").then(result => { _net01 = Number(result.time) }).catch(() => { _net01 = lang.ping_down_msg });
		await ping.promise.probe("cloudflare.com").then(result => { _net02 = Number(result.time) }).catch(() => { _net02 = lang.ping_down_msg });
		await ping.promise.probe("discord.com").then(result => { _net03 = Number(result.time) }).catch(() => { _net03 = lang.ping_down_msg });
		await ping.promise.probe("ihorizon.org").then(result => { _net04 = Number(result.time) }).catch(() => { _net04 = lang.ping_down_msg });

		let averagePing = (parseInt(_net01) + parseInt(_net02) + parseInt(_net03) + parseInt(_net04)) / 4;

		let embed = new EmbedBuilder()
			.setColor(2829617)
			.setDescription(lang.ping_embed_desc
				.replaceAll('${interaction.client.user.username}', interaction.client.user.username)
				.replaceAll('${_net03}', _net03)
				.replaceAll('${_net02}', _net02)
				.replaceAll('${_net01}', _net01)
				.replaceAll('${client.iHorizon_Emojis.icon.Crown_Logo}', client.iHorizon_Emojis.icon.Crown_Logo)
				.replace('${_net04}', _net04)
				.replace('${client.ws.ping}', client.ws.ping.toString())
				.replace('${interaction.client.user.username}', interaction.client.user.username)
				.replace('${client.iHorizon_Emojis.icon.iHorizon_Pointer}', client.iHorizon_Emojis.icon.iHorizon_Pointer)
				.replace('${averagePing}', averagePing.toString())
			)
			.setFooter(await client.func.displayBotName.footerBuilder(interaction));

		await ogI.edit({
			content: null,
			embeds: [embed],
			files: [await client.func.displayBotName.footerAttachmentBuilder(interaction)],
		});
		return;
	},
};