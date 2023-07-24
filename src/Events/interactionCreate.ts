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

import date from 'date-and-time';
import { BaseInteraction, Client, Collection, EmbedBuilder, Interaction, InteractionResponse, Permissions } from 'discord.js';
import config from '../files/config';
import * as db from '../core/functions/DatabaseModel';
import logger from '../core/logger';
import fs from 'fs';
import { format } from 'date-fns';

const timeout = 1000;
var start: number = 0;
var end: number = 0;

export = async (client: any, interaction: any) => {

    if (!interaction.isCommand() || !interaction.guild?.channels || interaction.user.bot) return;

    const command = client.interactions.get(interaction.commandName);
    if (!command) return interaction.reply({ content: "Connection error.", ephemeral: true });

    let legacyLogs = async () => {
        fs.createWriteStream(`${process.cwd()}/src/files/raw_slash.log`, { flags: 'a' }).write(`${interaction.guild?.name} >> ${date.format(new Date(), 'DD/MM/YYYY HH:mm:ss')}\n#${interaction.channel.name}:
    ${interaction.user.username}:
        /${interaction.commandName}\n\r`);
    };

    async function slashExecutor() {
        try {
            legacyLogs();

            if (await db.DataBaseModel({ id: db.Get, key: `GLOBAL.BLACKLIST.${interaction.user.id}.blacklisted` })) {
                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor("#0827F5").setTitle(":(")
                            .setImage(config.core.blacklistPictureInEmbed)]
                });
            };

            if (await cooldDown()) {
                const data = await client.functions.getLanguageData(interaction.guild.id);
                return interaction.reply({ content: data.Msg_cooldown, ephemeral: true });
            };

            start = Date.now();
            await command.run(client, interaction);
            end = Date.now();
        } catch (e: any) {
            end = Date.now();
            logger.err(e);
        }
    };

    async function logsCommands(): Promise<void> {
        const optionsList: string[] = interaction.options._hoistedOptions.map((element: { name: any; value: any; }) => `${element.name}:"${element.value}"`);
        const executionTime: string = end - start === 0 ? 'The command exited with an error!' : `Executed in ${end - start}ms`;

        const logMessage = `${interaction.guild?.name} >> ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')} in: #${interaction.channel ? interaction.channel.name : 'Unknown Channel'}:\n` +
            `${interaction.user.username}:\n` +
            `/${interaction.commandName} ${optionsList.join(' ')} | ${executionTime}\n\n`;

        fs.appendFile(`${process.cwd()}/src/files/slash.log`, logMessage, (err) => {
            if (err) {
                console.error('Error writing to slash.log:', err);
            }
        });
    };

    async function cooldDown() {
        let label = `TEMP.COOLDOWN.${interaction.user.id}`;
        let tn = Date.now();

        var fetch = await db.DataBaseModel({ id: db.Get, key: label });
        if (fetch !== null && timeout - (tn - fetch) > 0) return true;

        await db.DataBaseModel({ id: db.Set, key: label, value: tn });
        return false;
    };

    await slashExecutor(), logsCommands();
};