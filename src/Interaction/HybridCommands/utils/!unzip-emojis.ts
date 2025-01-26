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
    Attachment,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Client,
    EmbedBuilder,
    GuildEmoji,
    Message,
    PermissionsBitField
} from 'discord.js';
import JSZip from 'jszip';
import { LanguageData } from '../../../../types/languageData';
import { SubCommand } from '../../../../types/command';

export const subCommand: SubCommand = {
    run: async (
        client: Client,
        interaction: ChatInputCommandInteraction<"cached"> | Message,
        lang: LanguageData,
        args?: string[]
    ) => {
        if (!interaction.guild) return;

        if (interaction instanceof ChatInputCommandInteraction) {
            var zipAttachment = interaction.options.getAttachment("zip_file") as Attachment | undefined | null;
        } else {
            var zipAttachment = interaction.attachments.first() as Attachment | undefined | null;
        }

        if (!zipAttachment) {
            await interaction.reply({
                content: lang.util_unzip_emojis_command_no_file,
                ephemeral: true
            });
            return;
        }

        const time = Date.now();

        try {
            const response = await fetch(zipAttachment.url);
            const zipBuffer = await response.arrayBuffer();

            const zip = new JSZip();
            const zipContents = await zip.loadAsync(zipBuffer);

            const emojiCreationPromises = Object.entries(zipContents.files).map(async ([filename, file]) => {
                const match = filename.match(/^(.+)_(\d+)\.(png|gif)$/);
                if (!match) return null;

                const [, name, id, extension] = match;

                // Clean up name
                const cleanedName = name.split("/")[1].replace(/_/g, ' ');
                // Remove special characters and limit to 32 characters
                const emojiName = cleanedName.replace(/[^\w\s]/g, '').slice(0, 32);

                // Check if emoji already exists
                if (interaction.guild!.emojis.cache.some(emoji => emoji.name === emojiName)) return null;

                const fileBuffer = await file.async('arraybuffer');

                // Create emoji
                try {
                    const emoji = await interaction.guild!.emojis.create({
                        name: emojiName,
                        attachment: Buffer.from(fileBuffer)
                    });
                    return emoji;
                } catch (createError) {
                    return null;
                }
            });

            const createdEmojis = (await Promise.all(emojiCreationPromises)).filter(emoji => emoji !== null);

            // Respond with results
            const calcTime = Date.now() - time;
            await client.method.interactionSend(interaction, {
                content: lang.util_unzip_emojis_command_work
                    .replace("${calcTime}", String(calcTime))
                    .replace("${emojiCount}", String(createdEmojis.length)),
                ephemeral: true
            });

        } catch (error) {
            await client.method.interactionSend(interaction, {
                content: lang.util_unzip_emojis_command_error,
                ephemeral: true
            });
        }
    }
};