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

import { ActionRowBuilder, BaseGuildVoiceChannel, ButtonInteraction, CacheType, ComponentType, Embed, EmbedBuilder, GuildMember, UserSelectMenuBuilder } from 'discord.js';
import { LanguageData } from '../../../../types/languageData.js';

export default async function (interaction: ButtonInteraction<"cached">) {

	let result = await interaction.client.db.get(`${interaction.guildId}.VOICE_INTERFACE.interface`);
	let table = interaction.client.db.table('TEMP');

	let lang = await interaction.client.func.getLanguageData(interaction.guildId);
	let member = interaction.member as GuildMember;

	let targetedChannel = (interaction.member as GuildMember).voice.channel;
	let getChannelOwner = await table.get(`CUSTOM_VOICE.${interaction.guildId}.${interaction.user.id}`);

	if (!result) return await interaction.deferUpdate();
	if (result.channelId !== interaction.channelId
		|| getChannelOwner !== targetedChannel?.id) return await interaction.deferUpdate();

	if (!member.voice.channel) {
		await interaction.deferUpdate()
		return;
	} else {

		let response = await interaction.reply({
			ephemeral: true,
			components: [
				new ActionRowBuilder<UserSelectMenuBuilder>()
					.addComponents(
						new UserSelectMenuBuilder()
							.setCustomId('temporary_voice_trust_selectmenue')
							.setPlaceholder(lang.temporary_voice_transfer_trust_placeholder)
							.setMinValues(0)
							.setMaxValues(10)
					)
			]
		});

		let collector = interaction.channel?.createMessageComponentCollector({
			componentType: ComponentType.UserSelect,
			filter: (u) => u.user.id === interaction.user.id,
			time: 200_000
		});

		collector?.on('collect', async i => {
			let membersArray: string[] = [];
			let listmembersArray: string[] = [];

			// Push all the member of the Selection on the Array
			i.members.each(async (i) => { membersArray.push(i.user?.id as string) });

			// Push all current Allowed users into the Array
			targetedChannel?.permissionOverwrites.cache.filter((i) => i.type === 1).each((i) => {
				listmembersArray.push(i.id)
			});

			// Declare the array
			let addedMembers: string[] = [];
			let removedMembers: string[] = [];

			// Remove member if are delete from the SelectMenu
			listmembersArray.forEach(async (overwriteId) => {
				if (!membersArray.includes(overwriteId) && i.user.id !== overwriteId) {
					removedMembers.push(overwriteId);
					await (targetedChannel as BaseGuildVoiceChannel).permissionOverwrites.delete(overwriteId);
				}
			});

			// Add member if are added from the SelectMenu
			membersArray.forEach(async (memberId) => {
				if (!listmembersArray.includes(memberId)) {
					(targetedChannel as BaseGuildVoiceChannel).permissionOverwrites.edit(memberId,
						{
							ViewChannel: true,
							Connect: true,
							Speak: true,
							Stream: true,

							SendMessages: true,
							ReadMessageHistory: true,
							AttachFiles: true,
							UseApplicationCommands: true
						}
					);
					addedMembers.push(memberId);
				};
			});

			await i.reply({
				embeds: [
					new EmbedBuilder()
						.setDescription(lang.temporary_voice_title_embec)
						.setColor(2829617)
						.setFields(
							{
								name: lang.temporary_voice_untrusted_member,
								value: removedMembers.map((memberId) => `<@${memberId}>`).join(' ') || lang.temporary_voice_no_one
							},
							{
								name: lang.temporary_voice_trusted_member,
								value: addedMembers.map((memberId) => `<@${memberId}>`).join(' ') || lang.temporary_voice_no_one
							},
						)
						.setImage(`https://ihorizon.org/assets/img/banner/ihrz_${await i.client.db.get(`${interaction.guildId}.GUILD.LANG.lang`) || 'en-US'}.png`)
						.setFooter(await interaction.client.func.displayBotName.footerBuilder(interaction))
				],
				files: [await interaction.client.func.displayBotName.footerAttachmentBuilder(interaction)],
				ephemeral: true
			});

			collector?.stop();
		});

		collector?.on('end', i => {
			response.delete();
		})

	}
};