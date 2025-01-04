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
import { ApplicationCommandOptionType, } from 'discord.js';
export const command = {
    name: 'ownihrz-roles',
    aliases: ['ownihrzroles', 'ownihrzrole'],
    description: 'Give specific roles in this guild to all ownihrz owner!',
    description_localizations: {
        "fr": "Donnez des rôles spécifiques dans cette guilde à tous les propriétaires d'ownihrz !"
    },
    options: [
        {
            name: "roles",
            description: "the role you want to give",
            description_localizations: {
                "fr": "le rôle que vous souhaitez donner"
            },
            type: ApplicationCommandOptionType.Role,
            required: true
        }
    ],
    thinking: false,
    category: 'ownihrz',
    type: "PREFIX_IHORIZON_COMMAND",
    run: async (client, message, lang, command, neededPerm, options) => {
        let role = client.method.role(message, options, 0);
        let added = 0;
        let skipped = 0;
        let errors = 0;
        if (client.owners.includes(message.member?.user.id)) {
            let allOwnihrzOwners = await client.ownihrz.GetOwnersList();
            let guildMembers = message.guild.members.cache;
            let ownersInGuild = guildMembers.filter(member => allOwnihrzOwners.includes(member.id));
            for (const member of ownersInGuild.values()) {
                try {
                    if (!member.roles.cache.has(role?.id)) {
                        await member.roles.add(role);
                        added++;
                    }
                    else {
                        skipped++;
                    }
                }
                catch {
                    errors++;
                }
            }
            await client.method.interactionSend(message, {
                content: `I have added the role to **${added}** OWNIHRZ's owner(s).\n**${skipped}** member(s) already have the role, skipping...\nI can't give the role to **${errors}** member(s)!`
            });
        }
        return;
    },
};
