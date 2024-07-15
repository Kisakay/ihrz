/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

    ・   Under the following terms:

        ・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

        ・ NonCommercial — You may not use the material for commercial purposes.

        ・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

        ・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2024 iHorizon
*/

/*
... (Your copyright and license information)
*/

import { Client, AuditLogEvent, Guild, GuildEditOptions, GuildAuditLogsEntry } from 'pwss';

import { BotEvent } from '../../../types/event';

export const event: BotEvent = {
    name: "guildUpdate",
    run: async (client: Client, oldGuild: Guild, newGuild: Guild) => {
        let data = await client.db.get(`${newGuild.id}.PROTECTION`);
        if (!data) return;

        if (data.updateguild && data.updateguild.mode === 'allowlist') {
            let fetchedLogs = await newGuild.fetchAuditLogs({
                type: AuditLogEvent.GuildUpdate,
                limit: 1,
            });
            const firstEntry = fetchedLogs.entries.first();

            if (!firstEntry || firstEntry.targetId !== newGuild.id || firstEntry.executorId === client.user?.id) return;

            let baseData = await client.db.get(`${newGuild.id}.ALLOWLIST.list.${firstEntry.executorId}`);
            if (baseData) return;

            const editOptions: GuildEditOptions = {
                name: oldGuild.name,
                verificationLevel: oldGuild.verificationLevel,
                defaultMessageNotifications: oldGuild.defaultMessageNotifications,
                explicitContentFilter: oldGuild.explicitContentFilter,
                afkChannel: oldGuild.afkChannelId,
                afkTimeout: oldGuild.afkTimeout,
                systemChannel: oldGuild.systemChannelId,
                rulesChannel: oldGuild.rulesChannelId,
                publicUpdatesChannel: oldGuild.publicUpdatesChannelId,
                preferredLocale: oldGuild.preferredLocale,
                premiumProgressBarEnabled: oldGuild.premiumProgressBarEnabled,
                icon: oldGuild.iconURL(),
                splash: oldGuild.splashURL(),
                banner: oldGuild.bannerURL(),
                discoverySplash: oldGuild.discoverySplashURL(),
                safetyAlertsChannel: oldGuild.safetyAlertsChannel,
                reason: "[PROTECT]",
                systemChannelFlags: oldGuild.systemChannelFlags,
                description: oldGuild.description,
                features: oldGuild.features,
            };

            await newGuild.edit(editOptions);

            let member = newGuild.members.cache.get(firstEntry?.executorId!);
            if (!member) return;

            switch (data?.['SANCTION']) {
                case 'simply':
                    break;
                case 'simply+derank':
                    await member.roles.set([], "Punish");
                    break;
                case 'simply+ban':
                    await member.ban({ reason: 'Protect!' });
                    break;
                default:
                    return;
            };
        }
    },
};