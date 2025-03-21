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
	MessageReaction,
	User
} from 'discord.js';

import { BotEvent } from '../../../types/event.js';

export const event: BotEvent = {
	name: "messageReactionRemove",
	run: async (client: Client, reaction: MessageReaction, user: User) => {

		try {
			if (user.id == client.user?.id || !reaction.message.guild) return;
			let fetched = await client.db.get(`${reaction.message.guildId}.GUILD.REACTION_ROLES.${reaction.message.id}.${reaction.emoji.name}`);

			if (fetched) {
				let role = reaction.message.guild!.roles.cache.get(fetched.rolesID) || await reaction.message.guild.roles.fetch(fetched.rolesID);
				if (!role) return;

				let member = reaction.message.guild!.members.cache.get(user.id) || await reaction.message.guild.members.fetch(user.id);
				await member?.roles.remove(role.id, "[ReactionRoles] Module").catch(() => { });
				return;
			};

			let fetchedForNitro = await client.db.get(`${reaction.message.guildId}.GUILD.REACTION_ROLES.${reaction.message.id}.${reaction.emoji.name}`);

			if (fetchedForNitro) {
				let role = reaction.message.guild!.roles.cache.get(fetchedForNitro.rolesID) || await reaction.message.guild.roles.fetch(fetchedForNitro.rolesID);
				if (!role) return;

				let member = reaction.message.guild!.members.cache.get(user.id) || await reaction.message.guild.members.fetch(user.id);
				await member?.roles.remove(role, "[ReactionRoles] Module").catch(() => { });
				return;
			};
		} catch { return; };
	},
};