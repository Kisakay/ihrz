const { QuickDB } = require("quick.db");
const db = new QuickDB();
const ms = require('ms');
const {
  Client,
  Intents,
  Collection,
  EmbedBuilder,
  Permissions,
  ApplicationCommandType,
  PermissionsBitField,
  ApplicationCommandOptionType
} = require('discord.js');

const getLanguageData = require(`${process.cwd()}/src/lang/getLanguageData`);

module.exports = {
  name: 'daily',
  description: 'Claim your daily gain',
  run: async (client, interaction) => {
    let data = await getLanguageData(interaction.guild.id);
    
    let timeout = 86400000;
    let amount = 500;
    let daily = await db.get(`${interaction.guild.id}.USER.${interaction.user.id}.ECONOMY.daily`);
    if (daily !== null && timeout - (Date.now() - daily) > 0) {
      let time = ms(timeout - (Date.now() - daily));

      interaction.reply({ content: data.daily_cooldown_error.replace(/\${time}/g, time) });
    } else {
      let embed = new EmbedBuilder()
        .setAuthor({ name: data.daily_embed_title, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png` })
        .setColor("#a4cb80")
        .setDescription(data.daily_embed_description)
        .addFields({ name: data.daily_embed_fields, value: `${amount}🪙` })

      interaction.reply({ embeds: [embed] });
      db.add(`${interaction.guild.id}.USER.${interaction.user.id}.ECONOMY.money`, amount);
      db.set(`${interaction.guild.id}.USER.${interaction.user.id}.ECONOMY.daily`, Date.now());
    }
  }
}