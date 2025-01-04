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
import { SnowflakeUtil, PermissionsBitField } from 'discord.js';
export const event = {
    name: "guildMemberAdd",
    run: async (client, member) => {
        let all_channels = await client.db.get(`${member.guild.id}.GUILD.GUILD_CONFIG.GHOST_PING.channels`);
        if (!all_channels)
            return;
        for (let i of all_channels) {
            const channel = member.guild.channels.cache.get(i);
            if (!channel || !channel.guild.members.me?.permissions.has(PermissionsBitField.Flags.Administrator))
                continue;
            try {
                const nonce = SnowflakeUtil.generate().toString();
                const msg = await client.method.channelSend(channel, {
                    content: `${member.user}`,
                    enforceNonce: true,
                    nonce: nonce
                });
                await msg.delete();
            }
            catch {
            }
        }
    },
};
