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
	EmbedBuilder,
	Message,
	PermissionsBitField,
	time
} from 'discord.js';

import { LanguageData } from '../../../../types/languageData.js';
import { Command } from '../../../../types/command.js';


import { SubCommand } from '../../../../types/command.js';

export const subCommand: SubCommand = {
	run: async (client: Client, interaction: ChatInputCommandInteraction<"cached"> | Message, lang: LanguageData, args?: string[]) => {

		// Guard's Typing
		if (!interaction.member || !client.user || !interaction.guild || !interaction.channel) return;

		if (interaction instanceof ChatInputCommandInteraction) {
			var giveawayId = interaction.options.getString("giveaway-id")!;
		} else {

			var giveawayId = client.func.method.string(args!, 0)!;
		};

		client.giveawaysManager.getGiveawayData(giveawayId)
			.then(async giveawayData => {
				let embed = new EmbedBuilder()
					.setAuthor({
						name: interaction.guild?.name as string,
						iconURL: interaction.guild?.iconURL({ size: 512, forceStatic: false })!
					})
					.setColor("#0099ff")
					.setTitle(lang.gw_getdata_embed_title)
					.setFields(
						{
							name: lang.gw_getdata_embed_fields_channel,
							value: `<#${giveawayData.channelId}>`,
							inline: true
						},
						{
							name: lang.gw_getdata_embed_fields_amountWinner,
							value: lang.gw_getdata_embed_fields_value_amountWinner
								.replace('${giveawayData.winnerCount}', giveawayData.winnerCount),
							inline: true
						},
						{
							name: lang.gw_getdata_embed_fields_prize,
							value: lang.gw_getdata_embed_fields_value_prize
								.replace('${giveawayData.prize}', giveawayData.prize),
							inline: true
						},
						{
							name: lang.gw_getdata_embed_fields_hostedBy,
							value: `<@${giveawayData.hostedBy}>`,
							inline: true
						},
						{
							name: lang.gw_getdata_embed_fields_isEnded,
							value: giveawayData.ended ? lang.gw_getdata_yes : lang.gw_getdata_no,
							inline: true
						},
						{
							name: lang.gw_getdata_embed_fields_isValid,
							value: giveawayData.isValid ? lang.gw_getdata_yes : lang.gw_getdata_no,
							inline: true
						},
						{
							name: lang.gw_getdata_embed_fields_time,
							value: time(new Date(giveawayData.expireIn), 'd'),
							inline: true
						},
						{
							name: lang.gw_getdata_embed_fields_entriesAmount,
							value: lang.gw_getdata_embed_fields_value_entriesAmount
								.replace('${(giveawayData.entries as string[]).length}', (giveawayData.entries as string[]).length.toString())
								.replace('${giveawayId}', giveawayId)
						},
					)

				if (giveawayData.ended) {
					embed.addFields(
						{
							name: lang.gw_getdata_embed_fields_winners,
							value: `${giveawayData.winners.map((x: string) => `<@${x}>`)}`
						}
					)
				}
				await client.func.method.interactionSend(interaction, { embeds: [embed] });
			}).catch(async () => {
				await client.func.method.interactionSend(interaction, { content: lang.gw_doesnt_exit });
			})
		return;
	},
};