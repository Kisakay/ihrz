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

import { Client, PermissionsBitField, ChannelType, Message } from 'discord.js';
import { BotEvent } from '../../../types/event.js';
import { DatabaseStructure } from '../../../types/database_structure.js';
import { axios } from '../../core/functions/axios.js';

export const event: BotEvent = {
	name: "messageCreate",
	run: async (client: Client, message: Message) => {

		if (!message.guild || message.author.bot || !message.channel) return;

		if (!message.guild || !message.channel || !message.member
			|| message.channel.type !== ChannelType.GuildText || message.author.bot
			|| message.author.id === client.user?.id) {
			return;
		}

		let type = await client.db.get(`${message.guild.id}.GUILD.GUILD_CONFIG.antipub`) as DatabaseStructure.GuildConfigSchema['antipub'];

		if (type === "off" || message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

		let member = message.guild.members.cache.get(message.author.id);

		if (type === "on") {
			let LOG = await client.db.get(`${message.guild.id}.GUILD.PUNISH.PUNISH_PUB`) as DatabaseStructure.PunishPubSchema;
			let table = client.db.table("TEMP");
			let LOGfetched = await table.get(`${message.guild.id}.PUNISH_DATA.${message.author.id}`);

			if (LOG?.amountMax === LOGfetched?.flags && LOG?.state === "true") {
				switch (LOG.punishementType) {
					case 'ban':
						message.guild.members.ban(message.author, { reason: "Ban by PUNISHPUB" }).catch(() => { });
						break;
					case 'kick':
						message.guild.members.kick(message.author).catch(() => { });
						break;
					case 'mute':
						await member?.timeout(40000, 'Timeout by PunishPUB');
						await client.func.method.warnMember(
							message.guild?.members.me!,
							message.member!,
							"Timeout by PunishPUB"
						).catch(() => { });

						await table.set(`${message.guildId}.PUNISH_DATA.${message.author.id}`, {});
						break;
				}
			}

			try {
				let blacklist = ["https://", "http://", ".gg/"];
				const whitelist = [
					"giphy.com",
					"tenor.com",
					"imgur.com",
					"gyazo.com",
					"ezgif.com",
					"reddit.com",
					"tumblr.com",
					"twitter.com",
					"flickr.com",
					"postimages.org",
					"imagebam.com"
				];

				let contentLower = message.content.toLowerCase();
				let sanction = false;

				const isMediaLink = async (url: string): Promise<boolean> => {
					try {
						const response = await axios.head(url, {
							timeout: 5000,
						});

						const contentType = response.headers.get('content-type')?.toLowerCase() || '';
						const mediaTypes = [
							'image/',
							'video/',
							'gif',
						];

						return mediaTypes.some(type => contentType.includes(type));
					} catch (error) {
						return false;
					}
				};

				const isWhitelisted = (url: string): boolean => {
					return whitelist.some(domain => url.includes(domain));
				};

				const links = contentLower.match(/https?:\/\/\S+/g) || [];

				if (links.length > 0) {
					const mediaChecks = await Promise.all(links.map(isMediaLink));
					const whitelistChecks = links.map(isWhitelisted);

					const hasOnlyValidMedia = mediaChecks.every(Boolean);
					const isValidWhitelisted = whitelistChecks.some(Boolean);

					if (hasOnlyValidMedia || isValidWhitelisted) return;
				}

				for (let word of blacklist) {
					if (contentLower.includes(word)) {
						sanction = true;
						break;
					}
				}

				if (sanction) {
					let FLAGS_FETCH = await table.get(`${message.guild.id}.PUNISH_DATA.${message.author.id}.flags`);
					FLAGS_FETCH = FLAGS_FETCH || 0;

					await table.set(`${message.guild.id}.PUNISH_DATA.${message.author.id}`, { flags: FLAGS_FETCH + 1 });
					message.delete()
						.catch(() => { })
						.then(() => { });
				}
			} catch {
				return;
			}
		}
	},
};
