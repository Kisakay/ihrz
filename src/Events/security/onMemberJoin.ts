/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 2.0 Generic (CC BY-NC-SA 2.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2024 iHorizon
*/

import { AttachmentBuilder, Client, GuildMember, GuildTextBasedChannel, Message } from 'discord.js';

import logger from "../../core/logger.js";
import captcha from "../../core/captcha.js";

import { BotEvent } from '../../../types/event';
import { LanguageData } from '../../../types/languageData.js';

export const event: BotEvent = {
    name: "guildMemberAdd",
    run: async (client: Client, member: GuildMember) => {

        let baseData = await client.db.get(`${member.guild.id}.SECURITY`);
        if (!baseData || baseData?.disable === true) return;

        let data = await client.functions.getLanguageData(member.guild.id) as LanguageData;
        let channel = member.guild.channels.cache.get(baseData?.channel);
        let c = await captcha(280, 100)

        let sfbuff = Buffer.from((c?.image).split(",")[1], "base64");

        (channel as GuildTextBasedChannel).send({
            content: data.event_security
                .replace('${member}', member.toString()),
            files: [new AttachmentBuilder(sfbuff)]
        }).then(async (msg) => {
            let filter = (m: Message) => m.author.id === member.id;
            let collector = msg.channel.createMessageCollector({ filter: filter, time: 30000 });
            let passedtest = false;

            collector.on('collect', (m) => {
                m.delete();

                if (c.code === m.content) {
                    member.roles.add(baseData?.role);
                    msg.delete();
                    passedtest = true;
                    collector.stop();
                    return;
                } else {
                    // the member has failed the captcha 
                    msg.delete();
                    member.kick();
                    return;
                }
            });

            collector.on('end', (collected) => {
                if (!member.joinedAt) member.kick();
                if (passedtest) return;

                msg.delete();
            });

        }).catch((error: any) => {
            logger.err(error);
        });
    },
};