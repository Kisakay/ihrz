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
export const event = {
    name: "userUpdate",
    run: async (client, oldUser, newUser) => {
        if ((oldUser.username !== newUser.username) || (oldUser.globalName !== newUser.globalName)) {
            let guilds = client.guilds.cache.filter(guild => guild.members.cache.has(newUser.id)).toJSON();
            guilds.forEach(async (guild) => {
                let guildData = await client.db.get(`${guild.id}.GUILD.RANK_ROLES`);
                if (guildData?.roles && guildData?.nicknames) {
                    let nicknames = guildData.nicknames;
                    let rankRoles = guildData.roles;
                    let member = guild.members.cache.get(newUser.id);
                    if (!member)
                        return;
                    let includeUsername = newUser.username.includes(nicknames);
                    let includeGlobalname = newUser.globalName ? newUser.globalName.includes(nicknames) : false;
                    if (!includeUsername && !includeGlobalname) {
                        if (member.roles.cache.has(rankRoles)) {
                            member.roles.remove(rankRoles);
                        }
                    }
                    else if (includeUsername || includeGlobalname) {
                        if (!member.roles.cache.has(rankRoles)) {
                            member.roles.add(rankRoles);
                        }
                    }
                }
                else
                    return;
            });
        }
    },
};
