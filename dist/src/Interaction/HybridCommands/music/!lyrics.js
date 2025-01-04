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
import { ChatInputCommandInteraction, EmbedBuilder, } from 'discord.js';
import logger from '../../../core/logger.js';
export default {
    run: async (client, interaction, lang, command, neededPerm, args) => {
        // Guard's Typing
        if (!client.user || !interaction.member || !interaction.guild || !interaction.channel)
            return;
        if (interaction instanceof ChatInputCommandInteraction) {
            var title = interaction.options.getString("query");
        }
        else {
            var title = (args?.join(" ") || " ");
        }
        try {
            client.lyricsSearcher.search(title)
                .then(async (response) => {
                let trimmedLyrics = response?.lyrics?.substring(0, 1997);
                let embed = new EmbedBuilder()
                    .setTitle(response?.title || lang.lyrics_embed_title_unknown)
                    .setURL(response?.url)
                    .setTimestamp()
                    .setThumbnail(response?.image)
                    .setAuthor({
                    name: response?.artist.name || lang.lyrics_embed_author_name_unknown,
                })
                    .setDescription(trimmedLyrics?.length === 1997 ? `${trimmedLyrics}...` : trimmedLyrics ?? 'null')
                    .setColor('#cd703a')
                    .setFooter(await client.method.bot.footerBuilder(interaction));
                await client.method.interactionSend(interaction, {
                    embeds: [embed],
                    files: [await interaction.client.method.bot.footerAttachmentBuilder(interaction)]
                });
                return;
            })
                .catch(async (err) => {
                await client.method.interactionSend(interaction, { content: lang.lyrics_not_found });
                return;
            });
        }
        catch (error) {
            logger.err(error);
        }
        ;
    },
};
