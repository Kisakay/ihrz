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

import { Client, Guild, GuildChannel, CategoryChannel, TextChannel, VoiceChannel, ChannelType, PermissionOverwrites, GuildBasedChannel } from 'discord.js';
import fs from 'fs';
import path from 'path';

type BackupChannel = {
    id: string;
    name: string;
    type: ChannelType;
    position: number;
    permissions: PermissionOverwrites[];
    parent: string | null;
};

type BackupCategory = {
    id: string;
    name: string;
    position: number;
    channels: BackupChannel[];
};

type GuildBackup = {
    categories: BackupCategory[];
    channels: BackupChannel[];
};

async function backupGuildStructure(client: Client) {
    for (const guild of client.guilds.cache.values()) {
        const backup: GuildBackup = {
            categories: [],
            channels: []
        };

        guild.channels.cache.forEach((channel: GuildBasedChannel) => {
            if (channel instanceof CategoryChannel) {
                const categoryData: BackupCategory = {
                    id: channel.id,
                    name: channel.name,
                    position: channel.position,
                    channels: channel.children.cache.map(child => ({
                        id: child.id,
                        name: child.name,
                        type: child.type,
                        position: child.rawPosition,
                        permissions: child.permissionOverwrites.cache.map(perm => perm),
                        parent: channel.id
                    }))
                };
                backup.categories.push(categoryData);
            } else if (channel instanceof GuildChannel && (channel.type === ChannelType.GuildText || channel.isTextBased())) {
                const channelData: BackupChannel = {
                    id: channel.id,
                    name: channel.name,
                    type: channel.type,
                    position: channel.rawPosition,
                    permissions: channel.permissionOverwrites.cache.map(perm => perm),
                    parent: channel.parentId
                };
                backup.channels.push(channelData);
            }
        });

        const backupPath = path.join(process.cwd(), 'src', 'files', 'protection', 'backups', `${guild.id}.json`);
        fs.writeFileSync(backupPath, JSON.stringify(backup, null, 4));
    }
}

export const event = {
    name: 'ready',
    run: async (client: Client) => {
        await backupGuildStructure(client);
        setInterval(() => backupGuildStructure(client), 60 * 1000);
    }
};