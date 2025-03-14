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
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	ApplicationCommandType,
	ChannelType,
	PermissionFlagsBits,
} from 'discord.js';

import { Command } from '../../../../types/command.js';
import { LanguageData } from '../../../../types/languageData.js';

export const command: Command = {
	name: "automod",

	description: "Subcommand for automod category!",
	description_localizations: {
		"fr": "Commande sous-groupé pour la catégorie de protection via l'automod"
	},

	options: [
		{
			name: 'block',

			description: 'Block/Protect someting/behaviours into this guild!',
			description_localizations: {
				"fr": "Bloquer/Protéger certains comportements/comportements dans ce serveur"
			},

			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					name: 'pub',

					description: 'Allow/Unallow the user to send a server invites into them messages!',
					description_localizations: {
						"fr": "Autoriser/Interdire à l'utilisateur d'envoyer une invitations de serveur dans ses messages"
					},

					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'action',
							type: ApplicationCommandOptionType.String,

							description: 'What you want to do?',
							description_localizations: {
								"fr": "Que veux-tu faire?"
							},

							required: true,
							choices: [
								{
									name: "Power On",
									value: "on"
								},
								{
									name: 'Power Off',
									value: "off"
								},
							],
							permission: null
						},
						{
							name: 'logs-channel',

							description: 'The channel you want logs when user break the rules!',
							description_localizations: {
								"fr": "Le canal où vous souhaitez mettre les logs lorsque l'utilisateur enfreint les règles"
							},

							type: ApplicationCommandOptionType.Channel,
							channel_types: [ChannelType.GuildText],

							required: false,
							permission: null
						}
					],

					permission: PermissionFlagsBits.Administrator
				},
				{
					name: 'link',

					description: 'Allow/Unallow the user to send links into them messages!',
					description_localizations: {
						"fr": "Autoriser/Interdire à l'utilisateur d'envoyer des liens dans ses messages"
					},

					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'action',
							type: ApplicationCommandOptionType.String,

							description: 'What you want to do?',
							description_localizations: {
								"fr": "Que veux-tu faire?"
							},

							required: true,
							choices: [
								{
									name: "Power On",
									value: "on"
								},
								{
									name: 'Power Off',
									value: "off"
								},
							],
							permission: null
						},
						{
							name: 'logs-channel',

							description: 'The channel you want logs when user break the rules!',
							description_localizations: {
								"fr": "Le canal où vous souhaitez mettre les logs lorsque l'utilisateur enfreint les règles"
							},

							type: ApplicationCommandOptionType.Channel,
							channel_types: [ChannelType.GuildText],

							required: false,
							permission: null
						}
					],

					permission: PermissionFlagsBits.Administrator
				},
				{
					name: 'spam',

					description: 'Block the spam message in this server!',
					description_localizations: {
						"fr": "Bloquer le message spam sur ce serveur"
					},

					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'action',
							type: ApplicationCommandOptionType.String,

							description: 'What you want to do?',
							description_localizations: {
								"fr": "Que veux-tu faire?"
							},

							required: true,
							choices: [
								{
									name: 'Power On',
									value: "on"
								},
								{
									name: "Power Off",
									value: "off"
								}
							],
							permission: null
						},
						{
							name: 'logs-channel',

							description: 'The channel you want logs when user break the rules',
							description_localizations: {
								"fr": "Le canal où vous souhaitez mettre les logs lorsque l'utilisateur enfreint les règles"
							},

							type: ApplicationCommandOptionType.Channel,
							channel_types: [ChannelType.GuildText],

							required: false,
							permission: null
						}
					],

					permission: PermissionFlagsBits.Administrator
				},
				{
					name: 'mass-mention',

					description: 'Block the spam which have mass-mention in this message!',
					description_localizations: {
						"fr": "Bloquez les spams mentionnés en masse dans ce message"
					},

					type: ApplicationCommandOptionType.Subcommand,
					options: [
						{
							name: 'action',
							type: ApplicationCommandOptionType.String,

							description: 'What you want to do?',
							description_localizations: {
								"fr": "Que voulez-vous faire?"
							},

							required: true,
							choices: [
								{
									name: 'Power On',
									value: "on"
								},
								{
									name: "Power Off",
									value: "off"
								}
							],
							permission: null
						},
						{
							name: 'max-mention-allowed',
							type: ApplicationCommandOptionType.Number,

							description: "Max amount of mention allowed in only one message !",
							description_localizations: {
								"fr": "Nombre maximum de mentions autorisées dans un seul message"
							},

							required: false,
							permission: null
						},
						{
							name: 'logs-channel',

							description: "The channel you want logs when user break the rules",
							description_localizations: {
								"fr": "Le canal où vous souhaitez mettre les logs lorsque l'utilisateur enfreint les règles"
							},

							type: ApplicationCommandOptionType.Channel,
							channel_types: [ChannelType.GuildText],

							required: false,
							permission: null
						}
					],

					permission: PermissionFlagsBits.Administrator
				}
			],
			permission: null
		},
	],
	thinking: true,
	category: 'guildconfig',
	type: ApplicationCommandType.ChatInput,

	permission: null
};