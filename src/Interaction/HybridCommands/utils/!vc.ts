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
    Client,
    EmbedBuilder,
    ChatInputCommandInteraction,
    Message,
    ChannelType,
    GuildMember,
    Collection,
    VoiceState,
} from 'discord.js';

import { LanguageData } from '../../../../types/languageData';

export const subCommand = {
    run: async (client: Client, interaction: ChatInputCommandInteraction<"cached"> | Message, lang: LanguageData) => {
        if (!client.user || !interaction.member || !interaction.guild || !interaction.channel) return;

        const guild = interaction.guild;
        await guild.members.fetch();

        const voiceStates = guild.voiceStates.cache;

        const textChannelSize = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).size;
        const voiceChannelSize = guild.channels.cache.filter(c => c.type === ChannelType.GuildVoice).size;

        const mode = interaction instanceof ChatInputCommandInteraction
            ? interaction.options.getString("show-mode") || "short"
            : "short";

        const memberStats = calculateMemberStats(guild.members.cache);
        const voiceStats = calculateVoiceStats(voiceStates);

        const embed = new EmbedBuilder();
        const files = [];
        files.push(await interaction.client.method.bot.footerAttachmentBuilder(interaction));

        if (mode === "large") {
            const boosters = guild.roles.premiumSubscriberRole?.members.map(usr => `<@${usr.id}>`) || [];

            embed
                .setColor(2829617)
                .setDescription(
                    lang.vc_embed_desc
                        .replaceAll('${voiceStates?.size}', voiceStats.total.toString())
                        .replaceAll('${client.iHorizon_Emojis.icon.iHorizon_Streaming}', client.iHorizon_Emojis.icon.iHorizon_Streaming)
                        .replaceAll('${voiceStates?.filter(vc => vc.streaming).size}', voiceStats.streaming.toString())
                        .replaceAll('${client.iHorizon_Emojis.icon.iHorizon_Deaf}', client.iHorizon_Emojis.icon.iHorizon_Deaf)
                        .replaceAll('${voiceStates?.filter(vc => vc.selfDeaf).size}', voiceStats.selfDeaf.toString())
                        .replaceAll('${client.iHorizon_Emojis.icon.iHorizon_Mute}', client.iHorizon_Emojis.icon.iHorizon_Mute)
                        .replaceAll('${voiceStates?.filter(vc => vc.selfMute).size}', voiceStats.selfMute.toString())
                        .replaceAll('${client.iHorizon_Emojis.icon.iHorizon_Camera}', client.iHorizon_Emojis.icon.iHorizon_Camera)
                        .replaceAll('${voiceStates?.filter(vc => vc.selfVideo).size}', voiceStats.selfVideo.toString())
                        .replaceAll('${membersStates?.size}', memberStats.total.toString())
                        .replaceAll('${client.iHorizon_Emojis.icon.iHorizon_DND}', client.iHorizon_Emojis.icon.iHorizon_DND)
                        .replaceAll('${membersStates?.filter(mbr => mbr.presence?.status === "dnd").size}', memberStats.dnd.toString())
                        .replaceAll('${client.iHorizon_Emojis.icon.iHorizon_Online}', client.iHorizon_Emojis.icon.iHorizon_Online)
                        .replaceAll('${membersStates?.filter(mbr => mbr.presence?.status === "online").size}', memberStats.online.toString())
                        .replaceAll('${client.iHorizon_Emojis.icon.iHorizon_Idle}', client.iHorizon_Emojis.icon.iHorizon_Idle)
                        .replaceAll('${membersStates?.filter(mbr => mbr.presence?.status === "idle").size}', memberStats.idle.toString())
                        .replaceAll('${client.iHorizon_Emojis.icon.iHorizon_Invisible}', client.iHorizon_Emojis.icon.iHorizon_Invisible)
                        .replaceAll('${membersStates?.filter(mbr => mbr.presence?.status === "invisible").size}', memberStats.invisible.toString())
                        .replaceAll('${interaction.guild?.premiumSubscriptionCount}', guild.premiumSubscriptionCount?.toString() || '0')
                        .replaceAll('${interaction.guild?.roles.premiumSubscriberRole?.members.map(usr => `<@${usr.id}>`)}', boosters.join(', '))
                )
                .addFields(
                    {
                        name: lang.vc_embed_fields_1_name,
                        value: lang.vc_embed_fields_1_value
                            .replace('${interaction.guild?.memberCount}', guild.memberCount.toString()),
                        inline: true
                    },
                    {
                        name: lang.vc_embed_fields_2_name,
                        value: lang.vc_embed_fields_2_value
                            .replace('${textChannelSize}', textChannelSize.toString())
                            .replace('${voiceChannelSize}', voiceChannelSize.toString()),
                        inline: true
                    }
                )
                .setFooter(await client.method.bot.footerBuilder(interaction));
        } else {
            embed
                .setDescription(
                    lang.vc_embed_short_desc
                        .replaceAll("${voiceStates?.size}", voiceStats.total.toString())
                        .replaceAll("${client.iHorizon_Emojis.icon.iHorizon_Streaming}", client.iHorizon_Emojis.icon.iHorizon_Streaming)
                        .replaceAll("${total_members_vc_streaming}", voiceStats.streaming.toString())
                        .replaceAll("${client.iHorizon_Emojis.icon.iHorizon_Deaf}", client.iHorizon_Emojis.icon.iHorizon_Deaf)
                        .replaceAll("${total_members_vc_deaf}", voiceStats.selfDeaf.toString())
                        .replaceAll("${client.iHorizon_Emojis.icon.iHorizon_Mute}", client.iHorizon_Emojis.icon.iHorizon_Mute)
                        .replaceAll("${total_members_vc_mute}", voiceStats.selfMute.toString())
                        .replaceAll("${client.iHorizon_Emojis.icon.iHorizon_Camera}", client.iHorizon_Emojis.icon.iHorizon_Camera)
                        .replaceAll("${total_members_vc_video}", voiceStats.selfVideo.toString())
                        .replaceAll("${total_members_size}", memberStats.total.toString())
                        .replaceAll("${client.iHorizon_Emojis.icon.iHorizon_DND}", client.iHorizon_Emojis.icon.iHorizon_DND)
                        .replaceAll("${total_members_states_dnd}", memberStats.dnd.toString())
                        .replaceAll("${client.iHorizon_Emojis.icon.iHorizon_Online}", client.iHorizon_Emojis.icon.iHorizon_Online)
                        .replaceAll("${total_members_states_online}", memberStats.online.toString())
                        .replaceAll("${client.iHorizon_Emojis.icon.iHorizon_Idle}", client.iHorizon_Emojis.icon.iHorizon_Idle)
                        .replaceAll("${total_members_states_idle}", memberStats.idle.toString())
                )
                .setThumbnail("attachment://guild_icon.png")
                .setFooter(await client.method.bot.footerBuilder(interaction));

            const guildIconAttachment = await client.func.image64(guild.iconURL() || client.user.displayAvatarURL());
            if (guildIconAttachment) {
                files.push({
                    name: "guild_icon.png",
                    attachment: guildIconAttachment
                });
            }
        }

        await client.method.interactionSend(interaction, {
            embeds: [embed],
            files: files
        });
    }
};

interface MemberStats {
    total: number;
    online: number;
    idle: number;
    dnd: number;
    invisible: number;
}

interface VoiceStats {
    total: number;
    streaming: number;
    selfDeaf: number;
    selfMute: number;
    selfVideo: number;
}

function calculateMemberStats(members: Collection<string, GuildMember>): MemberStats {
    const stats = {
        total: members.size,
        online: 0,
        idle: 0,
        dnd: 0,
        invisible: 0
    };

    members.forEach(member => {
        const status = member.presence?.status;
        switch (status) {
            case 'online': stats.online++; break;
            case 'idle': stats.idle++; break;
            case 'dnd': stats.dnd++; break;
            default: stats.invisible++; break;
        }
    });

    return stats;
}

function calculateVoiceStats(voiceStates: Collection<string, VoiceState>): VoiceStats {
    return {
        total: voiceStates.size,
        streaming: voiceStates.filter(vc => vc.streaming).size,
        selfDeaf: voiceStates.filter(vc => vc.selfDeaf).size,
        selfMute: voiceStates.filter(vc => vc.selfMute).size,
        selfVideo: voiceStates.filter(vc => vc.selfVideo).size
    };
}