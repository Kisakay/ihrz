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
    ChatInputCommandInteraction,
    GuildMember,
    Message
} from "discord.js";
import { DatabaseStructure } from "../../../types/database_structure";
import { LanguageData } from "../../../types/languageData";

export async function checkCommandPermission(
    interaction: ChatInputCommandInteraction<"cached"> | Message,
    command: string
): Promise<{
    allowed: boolean;
    neededPerm: DatabaseStructure.PermLevel | DatabaseStructure.PermNone;
}> {
    const usr =
        interaction instanceof ChatInputCommandInteraction
            ? interaction.user
            : interaction.author;
    const db = interaction.client.db;

    // Fetch permission data from database
    const guildPerm = (await db.get(
        `${interaction.guildId}.UTILS`
    )) as DatabaseStructure.UtilsData;

    let cmdPermData = guildPerm?.PERMS?.[command] as DatabaseStructure.PermCommandData | DatabaseStructure.PermLevel | undefined;

    // Handle legacy permission levels (numbers instead of PermCommandData)
    if (typeof cmdPermData === "number") {
        cmdPermData = {
            users: [],
            roles: [],
            level: cmdPermData
        };
    }

    // If the command is not set, check if the category is set
    if (!cmdPermData && guildPerm?.PERMS?.[command.split(" ")[0]]) {
        cmdPermData = guildPerm?.PERMS?.[command.split(" ")[0]];

        // Handle legacy permission levels (numbers instead of PermCommandData)
        if (typeof cmdPermData === "number") {
            cmdPermData = {
                users: [],
                roles: [],
                level: cmdPermData
            };
        }
    }

    // If no specific permission is required, unallow by default
    if (!cmdPermData) {
        return { allowed: false, neededPerm: 0 };
    }

    const { users, roles, level: cmdNeededPerm } = cmdPermData;

    // Check roles and implement pyramidal system
    let highestRolePermLevel = 0;
    if (guildPerm.roles) {
        // Loop through all possible permission levels (1 to 8)
        for (let permLevel = 1; permLevel <= 8; permLevel++) {
            const roleId = guildPerm.roles[permLevel as keyof DatabaseStructure.UtilsRoleData];
            // If user has this role, update their highest permission level
            if (roleId && interaction.member?.roles.cache.has(roleId)) {
                highestRolePermLevel = Math.max(highestRolePermLevel, permLevel);
            }
        }
    }

    // Check if user is explicitly allowed
    if (users.includes(usr.id)) {
        return { allowed: true, neededPerm: 8 };
    }

    // Check if user has a role with permission level equal or higher than required
    if (highestRolePermLevel >= cmdNeededPerm) {
        return { allowed: true, neededPerm: cmdNeededPerm };
    }

    // Check if user has the required role
    const memberRoles = interaction.member?.roles.cache;
    if (memberRoles && roles.some((roleId) => memberRoles.has(roleId))) {
        return { allowed: true, neededPerm: cmdNeededPerm };
    }

    // Check if user has a permission level in database equal or higher than required
    const userPermLevel = guildPerm?.USER_PERMS?.[usr.id] || 0;
    if (userPermLevel >= cmdNeededPerm) {
        return { allowed: true, neededPerm: cmdNeededPerm };
    }

    // If no conditions are met, deny access
    return { allowed: false, neededPerm: cmdNeededPerm };
}

export async function checkUserPermissions(
    member: GuildMember
): Promise<DatabaseStructure.PermLevel | DatabaseStructure.PermNone> {
    const userPerm = (await member.client.db.get(
        `${member.guild.id}.UTILS.USER_PERMS.${member.user.id}`
    )) as DatabaseStructure.PermLevel | undefined;

    return userPerm || 0;
}

export async function sendErrorMessage(
    interaction: ChatInputCommandInteraction<"cached"> | Message,
    lang: LanguageData,
    neededPerm: DatabaseStructure.PermLevel | DatabaseStructure.PermNone
) {
    return await interaction.client.method.interactionSend(interaction, {
        content: lang.event_permission_wrong
            .replace(
                "${interaction.member?.user.toString()}",
                interaction.member?.user.toString()!
            )
            .replace("${neededPerm}", String(neededPerm === 0 ? 'Discord Permission' : neededPerm)),
        ephemeral: true
    });
}

export const PERMISSION_MAPPING = {
    "1": {
        value: 1n,
        name: "perm_createinstantinvite_name"
    },
    "2": {
        value: 2n,
        name: "perm_kickmembers_name"
    },
    "4": {
        value: 4n,
        name: "perm_banmembers_name"
    },
    "8": {
        value: 8n,
        name: "perm_administrator_name"
    },
    "16": {
        value: 16n,
        name: "perm_managechannels_name"
    },
    "32": {
        value: 32n,
        name: "perm_manageguild_name"
    },
    "64": {
        value: 64n,
        name: "perm_addreactions_name"
    },
    "128": {
        value: 128n,
        name: "perm_viewauditlog_name"
    },
    "256": {
        value: 256n,
        name: "perm_priorityspeaker_name"
    },
    "512": {
        value: 512n,
        name: "perm_stream_name"
    },
    "1024": {
        value: 1024n,
        name: "perm_viewchannel_name"
    },
    "2048": {
        value: 2048n,
        name: "perm_sendmessages_name"
    },
    "4096": {
        value: 4096n,
        name: "perm_sendttsmessages_name"
    },
    "8192": {
        value: 8192n,
        name: "perm_managemessages_name"
    },
    "16384": {
        value: 16384n,
        name: "perm_embedlinks_name"
    },
    "32768": {
        value: 32768n,
        name: "perm_attachfiles_name"
    },
    "65536": {
        value: 65536n,
        name: "perm_readmessagehistory_name"
    },
    "131072": {
        value: 131072n,
        name: "perm_mentioneveryone_name"
    },
    "262144": {
        value: 262144n,
        name: "perm_useexternalemojis_name"
    },
    "524288": {
        value: 524288n,
        name: "perm_viewguildinsights_name"
    },
    "1048576": {
        value: 1048576n,
        name: "perm_connect_name"
    },
    "2097152": {
        value: 2097152n,
        name: "perm_speak_name"
    },
    "4194304": {
        value: 4194304n,
        name: "perm_mutemembers_name"
    },
    "8388608": {
        value: 8388608n,
        name: "perm_deafenmembers_name"
    },
    "16777216": {
        value: 16777216n,
        name: "perm_movemembers_name"
    },
    "33554432": {
        value: 33554432n,
        name: "perm_usevad_name"
    },
    "67108864": {
        value: 67108864n,
        name: "perm_changenickname_name"
    },
    "134217728": {
        value: 134217728n,
        name: "perm_managenicknames_name"
    },
    "268435456": {
        value: 268435456n,
        name: "perm_manageroles_name"
    },
    "536870912": {
        value: 536870912n,
        name: "perm_managewebhooks_name"
    },
    "1073741824": {
        value: 1073741824n,
        name: "perm_manageemojisandstickers_name"
    },
    "2147483648": {
        value: 2147483648n,
        name: "perm_useapplicationcommands_name"
    },
    "4294967296": {
        value: 4294967296n,
        name: "perm_requesttospeak_name"
    },
    "8589934592": {
        value: 8589934592n,
        name: "perm_manageevents_name"
    },
    "17179869184": {
        value: 17179869184n,
        name: "perm_managethreads_name"
    },
    "34359738368": {
        value: 34359738368n,
        name: "perm_createpublicthreads_name"
    },
    "68719476736": {
        value: 68719476736n,
        name: "perm_createprivatethreads_name"
    },
    "137438953472": {
        value: 137438953472n,
        name: "perm_useexternalstickers_name"
    },
    "274877906944": {
        value: 274877906944n,
        name: "perm_sendmessagesinthreads_name"
    },
    "549755813888": {
        value: 549755813888n,
        name: "perm_useembeddedactivities_name"
    },
    "1099511627776": {
        value: 1099511627776n,
        name: "perm_moderatemembers_name"
    },
    "2199023255552": {
        value: 2199023255552n,
        name: "perm_viewcreatormonetizationanalytics_name"
    },
    "4398046511104": {
        value: 4398046511104n,
        name: "perm_usesoundboard_name"
    },
    "8796093022208": {
        value: 8796093022208n,
        name: "perm_createguildexpressions_name"
    },
    "17592186044416": {
        value: 17592186044416n,
        name: "perm_createevents_name"
    },
    "35184372088832": {
        value: 35184372088832n,
        name: "perm_useexternalsounds_name"
    },
    "70368744177664": {
        value: 70368744177664n,
        name: "perm_sendvoicemessages_name"
    },
    "562949953421312": {
        value: 562949953421312n,
        name: "perm_sendpolls_name"
    },
    "1125899906842624": {
        value: 1125899906842624n,
        name: "perm_useexternalapps_name"
    }
} as const;

export const getPermissionByValue = (value: bigint) => {
    const key = Object.keys(PERMISSION_MAPPING).find(
        k => PERMISSION_MAPPING[k as keyof typeof PERMISSION_MAPPING].value === value
    );
    return key ? PERMISSION_MAPPING[key as keyof typeof PERMISSION_MAPPING] : null;
};