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
	Message,
	PermissionFlagsBits,
} from "discord.js";

import { Command } from "../../../../types/command.js";


export const command: Command = {
	name: "fun",
	name_localizations: {
		fr: "fun",
	},

	description: "Subcommand for fun category!",
	description_localizations: {
		fr: "Commande sous-groupé pour la catégorie d'amusement",
	},

	options: [
		{
			name: "caracteres",
			name_localizations: {
				fr: "caractères",
			},

			description: "Transform a string into a DarkSasuke!",
			description_localizations: {
				fr: "Transformez une chaîne de caractères en DarkSasuke",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "nickname",
					type: ApplicationCommandOptionType.String,

					description: "your cool nickname to transform !",
					description_localizations: {
						fr: "ton surnom cool à transformer",
					},

					required: true,

					permission: null,
				},
			],

			permission: null,
		},
		{
			name: "cat",
			name_localizations: {
				fr: "chat",
			},

			description: "Get a picture of cat!",
			description_localizations: {
				fr: "Obtenez une photo du chat",
			},

			type: ApplicationCommandOptionType.Subcommand,

			permission: null,
		},
		{
			name: "dog",
			name_localizations: {
				fr: "chien",
			},

			description: "Get a picture of dog!",
			description_localizations: {
				fr: "Obtenez une photo du chien",
			},

			type: ApplicationCommandOptionType.Subcommand,

			permission: null,
		},
		{
			name: "fdisable",

			description: "Disable the fun category",
			description_localizations: {
				fr: "Désactiver la catégorie fun",
			},

			options: [
				{
					name: "action",

					description: "What do you want to do?",
					description_localizations: {
						fr: "Que voulez-vous faire ?",
					},

					choices: [
						{
							name: "Power On",
							value: "on",
						},
						{
							name: "Power Off",
							value: "off",
						},
					],

					required: true,
					type: ApplicationCommandOptionType.String,

					permission: null,
				},
			],

			type: ApplicationCommandOptionType.Subcommand,
			permission: PermissionFlagsBits.Administrator,
		},
		{
			name: "hack",
			name_localizations: {
				fr: "piratage",
			},

			description: "Hack a user!",
			description_localizations: {
				fr: "Pirater un discordiens",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					type: ApplicationCommandOptionType.User,

					description: "The user you want to hack",
					description_localizations: {
						fr: "L'utilisateur que vous souhaitez pirater",
					},

					required: true,

					permission: null,
				},
			],

			permission: null,
		},
		{
			name: "hug",
			name_localizations: {
				fr: "calin",
			},

			description: "Hug a user!",
			description_localizations: {
				fr: "Faire un calin d'un utilisateur",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					type: ApplicationCommandOptionType.User,

					description: "The user you want to hug",
					description_localizations: {
						fr: "L'utilisateur que vous souhaitez faire un calin",
					},

					required: true,

					permission: null,
				},
			],

			permission: null,
		},
		{
			name: "kiss",
			name_localizations: {
				fr: "bisous",
			},

			description: "Kiss a user!",
			description_localizations: {
				fr: "Embrasser un utilisateur",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					type: ApplicationCommandOptionType.User,

					description: "The user you want to kiss",
					description_localizations: {
						fr: "L'utilisateur que vous voulez embrasser",
					},

					required: true,

					permission: null,
				},
			],

			permission: null,
		},
		{
			name: "love",
			name_localizations: {
				fr: "amour",
			},

			description: "Show your love compatibilty with the user!",
			description_localizations: {
				fr: "Montrez votre compatibilité amoureuse avec l'utilisateur",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user1",
					type: ApplicationCommandOptionType.User,

					description: "The user you want to know your love compatibility",
					description_localizations: {
						fr: "L'utilisateur avec qui vous souhaitez connaître votre compatibilité amoureuse",
					},

					required: false,

					permission: null,
				},
				{
					name: "user2",
					type: ApplicationCommandOptionType.User,

					description: "The user with whom you want to know love compatibility",
					description_localizations: {
						fr: "L'utilisateur avec qui vous voulez connaître la compatibilité amoureuse",
					},

					required: false,

					permission: null,
				},
			],

			permission: null,
		},
		{
			name: "morse",

			description: "Transform a string into a Morse!",
			description_localizations: {
				fr: "Transformer une chaîne en Morse",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "input",
					type: ApplicationCommandOptionType.String,

					description: "Enter your input to encrypt/decrypt in morse",
					description_localizations: {
						fr: "Entrez votre entrée pour crypter/décrypter en morse",
					},

					required: true,

					permission: null,
				},
			],

			permission: null,
		},
		{
			name: "poll",
			name_localizations: {
				fr: "sondage",
			},

			description: "Create a poll!",
			description_localizations: {
				fr: "Créer un sondage",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "message",
					type: ApplicationCommandOptionType.String,

					description: "The message displayed on the survey",
					description_localizations: {
						fr: "Le message affiché sur le sondage",
					},

					required: true,

					permission: null,
				},
			],

			permission: PermissionFlagsBits.Administrator,
		},
		{
			name: "question",

			description: "Ask a question to the bot !",
			description_localizations: {
				fr: "Poser une question au bot",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "question",
					type: ApplicationCommandOptionType.String,

					description: "The question you want to give for the bot",
					description_localizations: {
						fr: "La question que vous souhaitez poser au bot",
					},

					required: true,

					permission: null,
				},
			],

			permission: null,
		},
		{
			name: "slap",
			name_localizations: {
				fr: "giflé",
			},

			description: "Slap a user!",
			description_localizations: {
				fr: "Gifler un utilisateur",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",
					type: ApplicationCommandOptionType.User,

					description: "The user you want to slap",
					description_localizations: {
						fr: "L'utilisateur que vous voulez gifler",
					},

					required: true,

					permission: null,
				},
			],

			permission: null,
		},
		{
			name: "youtube",

			description: "Permit to send custom youtube comment (real) !",
			description_localizations: {
				fr: "Permis d'envoyer un commentaire YouTube personnalisé (réel)",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",

					description: "The user",
					description_localizations: {
						fr: "L'utilisateur",
					},

					required: true,
					type: ApplicationCommandOptionType.User,

					permission: null,
				},
				{
					name: "comment",

					description: "The comment",
					description_localizations: {
						fr: "Le commentaire",
					},

					required: true,
					type: ApplicationCommandOptionType.String,

					permission: null,
				},
			],

			permission: null,
		},
		{
			name: "tweet",

			description: "Permit to send custom tweet !",
			description_localizations: {
				fr: "Permis d'envoyer un tweet personnalisé",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",

					description: "The user",
					description_localizations: {
						fr: "L'utilisateur",
					},

					required: true,
					type: ApplicationCommandOptionType.User,

					permission: null,
				},
				{
					name: "comment",

					description: "The comment",
					description_localizations: {
						fr: "Le commentaire",
					},

					required: true,
					type: ApplicationCommandOptionType.String,

					permission: null,
				},
			],

			permission: null,
		},
		{
			name: "transgender",
			name_localizations: {
				fr: "transgenre",
			},

			description: "all humans have rights",
			description_localizations: {
				fr: "tous les humains ont des droits",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "user",

					description: "the user",
					description_localizations: {
						fr: "l'utilisateur",
					},

					required: true,
					type: ApplicationCommandOptionType.User,

					permission: null,
				},
			],

			permission: null,
		},
		{
			name: "catsay",
			name_localizations: {
				fr: "le-chat-à-dis",
			},

			description: "Cat say (insert text here)",
			description_localizations: {
				fr: "le chat à dit (insérer le texte ici)",
			},

			type: ApplicationCommandOptionType.Subcommand,
			options: [
				{
					name: "text",

					description: "The cat say...",
					description_localizations: {
						fr: "Le chat dit...",
					},

					required: true,
					type: ApplicationCommandOptionType.String,

					permission: null,
				},
			],

			permission: null,
		},
	],
	integration_types: [0, 1],
	contexts: [0, 1, 2],

	thinking: true,
	category: "fun",
	type: ApplicationCommandType.ChatInput,
	permission: null,
};
