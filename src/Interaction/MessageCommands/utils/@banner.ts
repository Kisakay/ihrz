/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 2.0 Generic (CC BY-NC-SA 2.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2023 iHorizon
*/

import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    BaseGuildTextChannel,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    GuildMember,
    GuildVoiceChannelResolvable,
    Message,
    PermissionsBitField,
    User,
} from 'discord.js';

import { LanguageData } from '../../../../types/languageData';
import { Command } from '../../../../types/command';

import axios from 'axios';

export const command: Command = {

    name: 'banner',

    description: 'Pick the banner of specified things (Server/User)',
    description_localizations: {
        "fr": "Récuperer la bannière des éléments spécifiés (serveur/utilisateur)"
    },

    thinking: true,
    category: 'utils',
    type: "PREFIX_IHORIZON_COMMAND",
    run: async (client: Client, interaction: Message, args: string[]) => {
        let data = await client.functions.getLanguageData(interaction.guild?.id as string) as LanguageData;

        if (args[0] === 'user' || interaction.mentions.users.toJSON()[1]) {

            let user: User | undefined = interaction.mentions.users.toJSON()[1] || interaction.author;
            let format = 'png';

            let config = {
                headers: {
                    Authorization: `Bot ${client.token}`
                }
            };

            let user_1 = (await axios.get(`https://discord.com/api/v8/users/${user?.id}`, config))?.data;
            let banner = user_1?.['banner'];

            if (banner !== null && banner?.substring(0, 2) === 'a_') {
                format = 'gif'
            };

            let embed = new EmbedBuilder()
                .setColor('#c4afed')
                .setTitle(data.banner_user_embed.replace('${user?.username}', user?.username))
                .setImage(`https://cdn.discordapp.com/banners/${user_1?.id}/${banner}.${format}?size=1024`)
                .setThumbnail((user?.displayAvatarURL() as string))
                .setFooter({
                    text: 'iHorizon', iconURL: client.user?.displayAvatarURL()
                });

            await interaction.reply({ embeds: [embed] });
            return;
        } else {

            let embed = new EmbedBuilder()
                .setColor('#c4afed')
                .setTitle(data.banner_guild_embed)
                .setImage(interaction.guild?.bannerURL({ extension: 'png', size: 4096 }) as string)
                .setThumbnail(interaction.guild?.iconURL({ size: 4096 }) as string)
                .setFooter({ text: 'iHorizon', iconURL: client.user?.displayAvatarURL({ size: 4096 }) })

            await interaction.reply({ embeds: [embed] });
            return;
        };
    },
};