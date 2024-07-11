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

import {
    Client,
    Message,
    GuildMember,
    PermissionFlagsBits,
    BaseGuildTextChannel,
    Collection,
    Snowflake,
    EmbedBuilder
} from 'pwss';

import { DatabaseStructure } from '../../../types/database_structure';

import { AntiSpam } from '../../../types/antispam';
import { BotEvent } from '../../../types/event';
import { LanguageData } from '../../../types/languageData';

export const cache: AntiSpam.AntiSpamCache = {
    raidInfo: new Map<string, Map<string, { value: number | boolean; }>>(),
    messages: new Map<string, Set<AntiSpam.CachedMessage>>(),
    spamMessagesToClear: new Map<string, Set<AntiSpam.CachedMessage>>(),
    membersToPunish: new Map<string, Set<GuildMember>>(),
};

let timeout: NodeJS.Timeout | null = null;

async function waitForFinish(lastMessage?: AntiSpam.CachedMessage): Promise<void> {
    return new Promise((resolve) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => {
            resolve();
        }, 5000);
    });
}

async function logsAction(lang: LanguageData, client: Client, guildId: string, users: Set<GuildMember>, actionType: 'sanction' | 'warn', sanctionType?: 'mute' | 'kick' | 'ban') {
    if (users.size === 0) return;

    const firstUser = users.values().next().value;
    const inDb = await client.db.get(`${guildId}.GUILD.SERVER_LOGS.antispam`) as string | null;

    if (!inDb) return;

    const channel = firstUser.guild.channels.cache.get(inDb);
    if (!channel) return;

    let embed = new EmbedBuilder()
        .setColor(actionType === 'sanction' ? "#e4433f" : "#ff992e")
        .setTimestamp()
        .setTitle(lang.antispam_log_embed_title.replace('${actionType}', actionType))
        .setDescription(lang.antispam_log_embed_desc
            .replace("${client.user?.toString()}", client.user?.toString()!)
            .replace("${actionType}", String(actionType === 'sanction' ? sanctionType : 'warn'))
            .replace("${user.toString()}", Array.from(users).map(x => x.toString()).join(','))
        )

    await (channel as BaseGuildTextChannel).send({ embeds: [embed] });
    return;
}

async function sendWarningMessage(
    lang: LanguageData,
    members: Set<GuildMember>,
    channel: BaseGuildTextChannel | null,
    options: AntiSpam.AntiSpamOptions
): Promise<void> {
    const membersToWarn = [...members];

    for (const member of membersToWarn) {
        let amountOfWarn = cache.raidInfo.get(channel?.guildId!)?.get(`${member.id}.amount`)?.value as number;
        cache.raidInfo.get(channel?.guildId!)?.set(`${member.id}.amount`, { value: amountOfWarn + 1 });
    }

    if (membersToWarn.length === 0) {
        return;
    }

    const mentionedMembers = membersToWarn.map(member => member.toString()).join(', ');
    let warningMessage = lang.antispam_base_warn_message.replace("${mentionedMembers}", mentionedMembers);

    switch (options.punishment_type) {
        case 'mute':
            warningMessage += lang.antispam_more_mute_msg;
            break;
        case 'kick':
            warningMessage += lang.antispam_more_kick_msg;
            break;
        case 'ban':
            warningMessage += lang.antispam_more_ban_msg;
            break;
    }

    if (channel) {
        await channel.send(warningMessage).then((msg) => {
            setTimeout(() => msg.delete(), 4000);
        });
    } else {
        for (const member of membersToWarn) {
            await member.send(warningMessage);
        }
    }
}

async function clearSpamMessages(guildId: string, messages: Set<AntiSpam.CachedMessage>, client: Client): Promise<void> {
    try {
        const CHUNK_SIZE = 50;
        const messagesByChannel: Collection<Snowflake, Collection<string, Snowflake>> = new Collection();

        const messageChunks = [];
        const messagesArray = Array.from(messages).filter(m => m.isSpam);
        for (let i = 0; i < messagesArray.length; i += CHUNK_SIZE) {
            messageChunks.push(messagesArray.slice(i, i + CHUNK_SIZE));
        }

        await Promise.all(messageChunks.map(async (chunk) => {
            for (const cachedMessage of chunk) {
                const channelMessages = messagesByChannel.get(cachedMessage.channelID) || new Collection<string, Snowflake>();
                channelMessages.set(cachedMessage.messageID, cachedMessage.messageID);
                messagesByChannel.set(cachedMessage.channelID, channelMessages);
            }

            return Promise.all(Array.from(messagesByChannel).map(async ([channelId, messageIds]) => {
                const channel = client.channels.cache.get(channelId) as BaseGuildTextChannel | undefined;
                if (channel && messageIds.size > 0) {
                    try {
                        await channel.bulkDelete(Array.from(messageIds.values()), true).then(() => {
                            messages.forEach(message => {
                                cache.messages.get(guildId)?.delete(message);
                                cache.spamMessagesToClear.get(guildId)?.delete(message);
                            });
                        });
                    } catch {
                    }
                }
            }));
        }));

    } catch {
    }
}

async function PunishUsers(
    guildId: string,
    members: Set<GuildMember>,
    options: AntiSpam.AntiSpamOptions
): Promise<void> {
    const membersCleaned = [...new Set(members)];

    const punishPromises = membersCleaned.map(async (member) => {
        let amountOfWarn = cache.raidInfo.get(guildId)?.get(`${member.id}.amount`)?.value as number;
        cache.raidInfo.get(guildId)?.set(`${member.id}.amount`, { value: amountOfWarn + 1 });

        let time = options.punishTime;

        switch (options.punishment_type) {
            case 'mute':
                const userCanBeMuted =
                    member.guild.members.me?.permissions.has(PermissionFlagsBits.ModerateMembers) &&
                    member.guild.members.me.roles.highest.position > member.roles.highest.position &&
                    member.id !== member.guild.ownerId;

                if (userCanBeMuted) {
                    await member.timeout(time, 'Spamming');
                }
                break;
            case 'ban':
                const userCanBeBanned = options.Enabled && member.bannable;

                if (userCanBeBanned) {
                    await member.ban({ reason: 'Spamming!' }).catch(() => { });
                }
                break;
            case 'kick':
                const userCanBeKicked = options.Enabled && member.kickable;

                if (userCanBeKicked) {
                    await member.kick('Spamming!').catch(() => { });
                }
                break;
        }
    });

    await Promise.all(punishPromises);
}

export const event: BotEvent = {
    name: 'messageCreate',
    run: async (client: Client, message: Message) => {
        let options = await client.db.get(`${message.guildId}.GUILD.ANTISPAM`) as DatabaseStructure.DbGuildObject['ANTISPAM'];

        if (!options) return;

        let cancelAnalyze = false;
        // Check if the member have roles to bypass antispam
        for (let role in options.BYPASS_ROLES) {
            if (message.member?.roles.cache.has(options.BYPASS_ROLES[parseInt(role)])) {
                cancelAnalyze = true;
            }
        };

        // Basic checks (if is in guild, if the antispam are configured etc)
        if (
            !message.guild ||
            message.author.id === message.client.user.id ||
            !options.Enabled ||
            message.guild.ownerId === message.author.id ||
            message.member?.permissions.has(PermissionFlagsBits.Administrator) ||
            (options.ignoreBots && message.author.bot) ||
            cancelAnalyze ||
            options.BYPASS_CHANNELS?.includes(message.channelId)
        ) {
            return false;
        }

        let lang = await client.func.getLanguageData(message.guild.id) as LanguageData;

        // Create object with the last message
        let currentMessage: AntiSpam.CachedMessage = {
            messageID: message.id,
            guildID: message.guild.id,
            authorID: message.author.id,
            channelID: message.channel.id,
            content: message.content,
            sentTimestamp: message.createdTimestamp,
            isSpam: false
        };

        // Create all basic map,set if doesn't exist
        if (!cache.messages.has(message.guild.id)) {
            cache.messages.set(message.guild.id, new Set());
        }

        if (!cache.spamMessagesToClear.has(message.guild.id)) {
            cache.spamMessagesToClear.set(message.guild.id, new Set());
        }

        if (!cache.raidInfo.has(message.guild.id)) {
            cache.raidInfo.set(message.guild.id, new Map());
        }

        if (!cache.membersToPunish.has(message.guild.id)) {
            cache.membersToPunish.set(message.guild.id, new Set());
        }

        let guildSpamMessagesToClear = cache.spamMessagesToClear.get(message.guild.id);
        let guildMessages = cache.messages.get(message.guild.id);

        // Push the message in the messages cache
        guildMessages?.add(currentMessage);

        let messageBypass = guildMessages ? Array.from(guildMessages)?.filter(x => x.authorID === currentMessage.authorID) : [];

        // Check if the message was sent in less than X ms
        if (
            messageBypass &&
            messageBypass.length > 0 &&
            (currentMessage.sentTimestamp - messageBypass[messageBypass.length - 1].sentTimestamp) < options.maxInterval) {
            currentMessage.isSpam = true;
        }

        // Delete from the cache the old messages
        guildMessages?.forEach(msg => {
            if (msg.sentTimestamp < (Date.now() - options.maxInterval)) {
                guildMessages.delete(msg);
            }
        });

        // In the case of the spam were detected
        if (currentMessage.isSpam) {
            let membersToPunish = cache.membersToPunish.get(message.guild.id);
            let guildRaidInfo = cache.raidInfo.get(message.guild.id);

            if (!guildRaidInfo?.has(`${message.author.id}.amount`)) {
                guildRaidInfo?.set(`${message.author.id}.amount`, { value: 0 });
            }

            if (!guildRaidInfo?.has(`${message.author.id}.timeout`)) {
                guildRaidInfo?.set(`${message.author.id}.timeout`, { value: 0 });
            }

            const timeout = guildRaidInfo?.get(`${message.author.id}.timeout`)?.value as number;

            const currentTime = Date.now();
            if (timeout < currentTime) {
                guildRaidInfo?.set(`${message.author.id}.timeout`, { value: currentTime + 5000 });
            }

            guildSpamMessagesToClear?.add(currentMessage);
            membersToPunish?.add(message.member!);

            if (timeout < currentTime) {
                console.log("message à del: ", guildSpamMessagesToClear?.size)
                await waitForFinish();
                await PunishUsers(message.guild.id, membersToPunish!, options);
                await clearSpamMessages(message.guild.id, guildSpamMessagesToClear!, client);
                console.log("message del: ", guildSpamMessagesToClear?.size)
                await sendWarningMessage(lang, membersToPunish!, message.channel as BaseGuildTextChannel, options);
                await logsAction(lang, client, message.guild.id, membersToPunish!, "sanction", options.punishment_type);
                membersToPunish?.clear();
                guildSpamMessagesToClear?.clear();
            }
        }
    }
};