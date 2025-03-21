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

import { EmbedBuilder, PermissionsBitField, AuditLogEvent, Client, GuildMember, BaseGuildTextChannel } from 'discord.js';

import { BotEvent } from '../../../types/event.js';
import { LanguageData } from '../../../types/languageData.js';

export const event: BotEvent = {
	name: "guildMemberRemove",
	run: async (client: Client, member: GuildMember) => {

		let data = await client.func.getLanguageData(member.guild.id);

		if (!member.guild) return;
		if (!member.guild.members.me) return;

		if (!member.guild.members.me.permissions.has([
			PermissionsBitField.Flags.ViewAuditLog,
			PermissionsBitField.Flags.ManageGuild
		])) return;

		let fetchedLogs = await member.guild.fetchAuditLogs({
			type: AuditLogEvent.MemberKick,
			limit: 1,
		});

		let firstEntry = fetchedLogs.entries.first();
		if (!firstEntry || !firstEntry.target || member.id !== firstEntry.target.id) return;

		let someinfo = await client.db.get(`${member.guild.id}.GUILD.SERVER_LOGS.moderation`);
		if (!someinfo) return;

		let Msgchannel = member.guild.channels.cache.get(someinfo);
		if (!Msgchannel) return;

		let logsEmbed = new EmbedBuilder()
			.setColor("#000000")
			.setDescription(data.event_srvLogs_guildMemberRemove_description
				.replace("${firstEntry.executor.id}", firstEntry.executor?.id!)
				.replace("${firstEntry.target.id}", firstEntry.target.id)
			)
			.addFields({
				name: data.event_srvLogs_banAdd_fields_name,
				value: data.event_srvLogs_banAdd_fields_value.replace('{reason}', firstEntry?.reason || data.blacklist_var_no_reason)
			})
			.setTimestamp();

		await (Msgchannel as BaseGuildTextChannel).send({ embeds: [logsEmbed] }).catch(() => { });
	},
};