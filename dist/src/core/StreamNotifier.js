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
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SnowflakeUtil } from 'discord.js';
import logger from './logger.js';
import { axios } from './functions/axios.js';
export class StreamNotifier {
    twitchClientID;
    twitchAccessToken;
    twitchAccessTokenExpireIn;
    twitchClientSecret;
    client;
    youtubeApiKey;
    constructor(client, twitchClientID, twitchClientSecret, youtubeApiKey) {
        this.client = client;
        this.twitchClientID = twitchClientID;
        this.twitchClientSecret = twitchClientSecret;
        this.youtubeApiKey = youtubeApiKey;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async getGuildData(guildID) {
        const all = await this.client.db.get(`${guildID}.NOTIFIER`);
        return all;
    }
    async getGuildsData() {
        const all = await this.client.db.all();
        return all
            .filter(v => Number(v.id))
            .map(v => {
            const guildObject = v.value;
            return guildObject.NOTIFIER ? { value: guildObject.NOTIFIER, guildId: v.id } : null;
        })
            .filter(Boolean);
    }
    getLatestMedia(items) {
        return items?.reduce((latest, item) => {
            return new Date(item.pubDate) > new Date(latest.pubDate) ? item : latest;
        }, items[0]);
    }
    async getLatestYouTubeVideos(channelId) {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${this.youtubeApiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=5`;
        try {
            const response = await axios.get(url);
            return response.data.error ? [] : response.data.items.map((item) => ({
                title: item.snippet.title,
                link: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                pubDate: new Date(item.snippet.publishedAt),
                author: item.snippet.channelTitle,
                id: item.id.videoId,
                isoDate: new Date(item.snippet.publishedAt),
            }));
        }
        catch (error) {
            logger.err(`Error fetching YouTube videos for channel ${channelId}: ${error}`);
            return [];
        }
    }
    async fetchUsersMedias(users) {
        const result = [];
        for (const user of users) {
            try {
                if (user.platform === 'youtube') {
                    const videos = await this.getLatestYouTubeVideos(user.id_or_username);
                    const latestMedia = this.getLatestMedia(videos);
                    if (latestMedia) {
                        result.push({ user, content: latestMedia, platform: "youtube" });
                    }
                }
                else if (user.platform === 'twitch') {
                    const feed = await this.checkTwitchStream(user.id_or_username);
                    if (feed) {
                        result.push({ user, content: feed, platform: "twitch" });
                    }
                }
            }
            catch (error) {
                logger.err(`Erreur lors de la vérification des flux pour ${user.id_or_username} sur ${user.platform} : ${error}`);
            }
            await this.delay(5_000);
        }
        return result;
    }
    async checkTwitchStream(userName) {
        try {
            const { data } = await axios.get(`https://api.twitch.tv/helix/streams?user_login=${userName}`, {
                headers: {
                    'Client-ID': this.twitchClientID,
                    'Authorization': `Bearer ${this.twitchAccessToken}`,
                },
            });
            if (data.data && data.data.length > 0) {
                return {
                    pubDate: new Date(data.data[0].started_at),
                    title: data.data[0].title,
                    link: "https://twitch.tv/" + userName,
                    author: data.data[0].user_name,
                    id: data.data[0].id
                };
            }
            else {
                return null;
            }
        }
        catch (error) {
            return null;
        }
    }
    async mediaHaveAlreadyBeNotified(guildID, media) {
        const notifiedMedias = (await this.client.db.get(`${guildID}.NOTIFIER.lastMediaNotified`) || []);
        return notifiedMedias.some(item => item.userId === media.user.id_or_username &&
            (item.mediaId === media.content.id || new Date(item.timestamp) >= new Date(media.content.pubDate)));
    }
    createLinkButton(url, label) {
        return new ActionRowBuilder()
            .addComponents(new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(url)
            .setLabel(label));
    }
    async authorExist(platform, author_id_or_username) {
        const allGuildsData = await this.getGuildsData();
        for (const entry of allGuildsData) {
            const users = entry.value.users || [];
            const userExists = users.some(user => user.platform === platform && user.id_or_username === author_id_or_username);
            if (userExists) {
                return true;
            }
        }
        return false;
    }
    async authorExistOnPlatform(platform, author_id_or_username) {
        try {
            if (platform === 'youtube') {
                return (await this.checkYouTubeChannelExists(author_id_or_username)).state;
            }
            else if (platform === 'twitch') {
                return (await this.checkTwitchUserExists(author_id_or_username)).state;
            }
            else {
                throw new Error('Unsupported platform');
            }
        }
        catch (error) {
            logger.err(`Error checking if author exists on platform ${platform} for ${author_id_or_username}: ${error}`);
            return false;
        }
    }
    async getChannelNameById(platform, author_id_or_username) {
        try {
            if (platform === 'youtube') {
                return (await this.checkYouTubeChannelExists(author_id_or_username)).name || author_id_or_username;
            }
            else if (platform === 'twitch') {
                return (await this.checkTwitchUserExists(author_id_or_username)).name || author_id_or_username;
            }
            else {
                throw new Error('Unsupported platform');
            }
        }
        catch (error) {
            logger.err(`Error checking if author exists on platform ${platform} for ${author_id_or_username}: ${error}`);
            return author_id_or_username;
        }
    }
    async checkYouTubeChannelExists(channelId) {
        try {
            const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet&id=${channelId}&key=${this.youtubeApiKey}`;
            const response = await axios.get(url);
            if (response.data.items && response.data.items.length > 0) {
                const channel = response.data.items[0];
                return { state: true, name: channel.snippet.title };
            }
            else {
                return { state: false };
            }
        }
        catch (error) {
            logger.err(`Error checking YouTube channel ${channelId}: ${error}`);
            return { state: false };
        }
    }
    ;
    async checkTwitchUserExists(userName) {
        try {
            const url = `https://api.twitch.tv/helix/users?login=${userName}`;
            const response = await axios.get(url, {
                headers: {
                    'Client-ID': this.twitchClientID,
                    'Authorization': `Bearer ${this.twitchAccessToken}`,
                },
            });
            return { state: response.data?.data.length > 0 };
        }
        catch (error) {
            if (error.response && error.response.status === 404) {
                return { state: false };
            }
            throw error;
        }
    }
    async getAppAccessToken() {
        try {
            const response = await axios.post("https://id.twitch.tv/oauth2/token", {
                client_id: this.twitchClientID,
                client_secret: this.twitchClientSecret,
                grant_type: 'client_credentials',
            });
            const { access_token, expires_in } = response.data;
            this.twitchAccessToken = access_token;
            this.twitchAccessTokenExpireIn = Date.now() + expires_in * 1000;
        }
        catch (error) {
            throw new Error(`Failed to get app access token: ${error}`);
        }
    }
    async ensureValidAccessToken() {
        if (!this.twitchAccessToken || !this.twitchAccessTokenExpireIn || Date.now() >= this.twitchAccessTokenExpireIn) {
            await this.getAppAccessToken();
        }
    }
    async generateAuthorsEmbed(guild) {
        let lang = await this.client.func.getLanguageData(guild?.id);
        let authors = (await this.getGuildData(guild.id))?.users || [];
        let embed = new EmbedBuilder();
        let desc = lang.notifier_generateAuthorsEmbed_embed_desc;
        for (let author of authors) {
            desc += `${author.platform} - [\`${await this.getChannelNameById(author.platform, author.id_or_username)}\`](https://youtube.com/channel/${author.id_or_username})\n`;
        }
        embed.setTitle(lang.notifier_generateAuthorsEmbed_embed_title);
        embed.setColor(2829617);
        embed.setDescription(desc);
        return embed;
    }
    async generateConfigurationEmbed(guild) {
        let lang = await this.client.func.getLanguageData(guild?.id);
        let config = (await this.getGuildData(guild.id));
        let channel = guild.channels.cache.get(config?.channelId || "");
        let embed = new EmbedBuilder();
        embed.setTitle(lang.notifier_generateConfigurationEmbed_embed_title);
        embed.setColor(2829617);
        embed.setFields({ name: lang.notifier_generateConfigurationEmbed_embed_fields_1_name, value: `${channel?.toString() || lang.setjoinroles_var_none}`, inline: false }, { name: lang.notifier_generateConfigurationEmbed_embed_fields_2_name, value: `${config?.message || lang.notifier_on_new_media_default_message}`, inline: false });
        return embed;
    }
    async refresh() {
        await this.ensureValidAccessToken();
        const guildsData = await this.getGuildsData();
        for (let entry of guildsData) {
            let guild = this.client.guilds.cache.get(entry.guildId);
            let channel = guild?.channels.cache.get(entry.value.channelId);
            let lang = await this.client.func.getLanguageData(guild?.id);
            let medias = await this.fetchUsersMedias(entry.value.users || []);
            for (let media of medias) {
                if (!await this.mediaHaveAlreadyBeNotified(entry.guildId, media)) {
                    let message = this.client.method.generateCustomMessagePreview(entry.value.message || lang.notifier_on_new_media_default_message, {
                        guild: guild,
                        user: this.client.user,
                        guildLocal: "en-US",
                        notifier: {
                            artistAuthor: media.content.author,
                            artistLink: media.platform === "twitch" ? `https://twitch.tv/${media.user.id_or_username}` : `https://youtube.com/channel/${media.user.id_or_username}`,
                            mediaURL: media.content.link
                        }
                    });
                    if (channel) {
                        await this.client.db.push(`${entry.guildId}.NOTIFIER.lastMediaNotified`, {
                            userId: media.user.id_or_username,
                            mediaId: media.content.id,
                            timestamp: media.content.pubDate.toISOString()
                        });
                        await channel.send({
                            content: message,
                            components: [this.createLinkButton(media.content.link, lang.notifier_on_new_media_default_button_label)],
                            nonce: SnowflakeUtil.generate().toString(),
                            enforceNonce: true,
                        });
                    }
                }
            }
        }
    }
    async start() {
        await this.getAppAccessToken();
        await this.refresh();
        setInterval(async () => await this.refresh(), 30_000);
    }
}
