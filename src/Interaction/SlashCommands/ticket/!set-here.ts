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
	ActionRowBuilder,
	CategoryChannel,
	ChatInputCommandInteraction,
	Client,
	ComponentType,
	PermissionsBitField,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';

import { CreateButtonPanel, CreateSelectPanel } from '../../../core/modules/ticketsManager.js';
import { LanguageData } from '../../../../types/languageData.js';
import { Command } from '../../../../types/command.js';


import { SubCommand } from '../../../../types/command.js';

export const subCommand: SubCommand = {
	run: async (client: Client, interaction: ChatInputCommandInteraction<"cached">, lang: LanguageData, args?: string[]) => {


		// Guard's Typing
		if (!interaction.member || !client.user || !interaction.user || !interaction.guild || !interaction.channel) return;

		let panelName = interaction.options.getString("name");
		let panelDesc = interaction.options.getString("description");
		let panelCategory = interaction.options.getChannel("category") as CategoryChannel | null;

		if (await client.db.get(`${interaction.guildId}.GUILD.TICKET.disable`)) {
			await interaction.editReply({ content: lang.ticket_disabled_command });
			return;
		};

		let comp = new StringSelectMenuBuilder()
			.setCustomId("choose_panel_type")
			.setPlaceholder(lang.sethereticket_command_type_menu_placeholder)
			.addOptions(
				new StringSelectMenuOptionBuilder()
					.setLabel(lang.sethereticket_command_type_menu_choice_1_label)
					.setValue("button_panel"),
				new StringSelectMenuOptionBuilder()
					.setLabel(lang.sethereticket_command_type_menu_choice_2_label)
					.setValue("select_panel")
			);

		let response = await interaction.editReply({
			content: lang.sethereticket_command_type_menu_question
				.replace("${interaction.user.id}", interaction.user.id),
			components: [
				new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(comp)
			]
		});

		response.awaitMessageComponent({
			componentType: ComponentType.StringSelect,
			time: 240_000,
			filter: (i) => i.user.id === interaction.user.id,
		}).then(async (i) => {

			if (i.values[0] === 'button_panel') {
				await CreateButtonPanel(interaction, {
					name: panelName,
					author: interaction.user.id,
					description: panelDesc,
					category: panelCategory?.id
				});

				await i.deferUpdate();

				interaction.editReply({
					components: [],
					content: lang.sethereticket_command_work
				});

			} else if (i.values[0] === 'select_panel') {

				await i.deferUpdate();

				await CreateSelectPanel(interaction, {
					name: panelName,
					author: interaction.user.id,
					description: panelDesc,
				});
			};
		});

		return;
	},
};