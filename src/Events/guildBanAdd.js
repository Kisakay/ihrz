const { Collection, EmbedBuilder, PermissionsBitField, AuditLogEvent, Events, Client } = require('discord.js');
const { QuickDB } = require("quick.db");
const db = new QuickDB();

const getLanguageData = require(`${process.cwd()}/src/lang/getLanguageData`);

module.exports = async (client, ban) => {
    let data = await getLanguageData(ban.guild.id);
    async function serverLogs() {
        if (!oldMember.guild.members.me.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) return;
        const fetchedLogs = await ban.guild.fetchAuditLogs({
            type: AuditLogEvent.MemberBanAdd,
            limit: 1,
        });
        const firstEntry = fetchedLogs.entries.first();

        const guildId = ban.guild.id;
        const someinfo = await db.get(`${guildId}.GUILD.SERVER_LOGS.moderation`);
        if (!someinfo) return;

        let logsEmbed = new EmbedBuilder()
            .setColor("#000000")
            .setDescription(data.event_srvLogs_banAdd_description
                .replace("${firstEntry.executor.id}", firstEntry.executor.id)
                .replace("${firstEntry.target.id}", firstEntry.target.id)
            ).setTimestamp();
        await client.channels.cache.get(someinfo).send({ embeds: [logsEmbed] }).catch(() => { });
    };
    await serverLogs();
};