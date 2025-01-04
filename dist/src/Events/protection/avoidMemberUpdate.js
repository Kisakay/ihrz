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
import { AuditLogEvent } from 'discord.js';
export const event = {
    name: "guildMemberUpdate",
    run: async (client, oldMember, newMember) => {
        let data = await client.db.get(`${newMember.guild.id}.PROTECTION`);
        if (!data)
            return;
        if (data.updatemember && data.updatemember.mode === 'allowlist') {
            let fetchedLogs = await oldMember.guild.fetchAuditLogs({
                type: AuditLogEvent.MemberRoleUpdate,
                limit: 1,
            });
            let relevantLog = fetchedLogs.entries.find(entry => entry.targetId === oldMember.id &&
                entry.executorId !== client.user?.id &&
                entry.executorId);
            if (!relevantLog) {
                return;
            }
            let baseData = await client.db.get(`${newMember.guild.id}.ALLOWLIST.list.${relevantLog.executorId}`);
            if (!baseData) {
                let user = newMember.guild.members.cache.get(relevantLog?.executorId);
                await client.method.punish(data, user);
                await newMember.roles.set(oldMember.roles.cache).catch(() => false);
            }
            ;
        }
    },
};
