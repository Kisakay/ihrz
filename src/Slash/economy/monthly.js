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
  name: 'monthly',
  description: 'Claim your monthly gain',
  run: async (client, interaction) => {
    let data = await getLanguageData(interaction.guild.id);
    let timeout = 2592000000;
    let amount = 5000;
    let monthly = await await db.get(`${interaction.guild.id}.USER.${interaction.user.id}.ECONOMY.monthly`);

    if (monthly !== null && timeout - (Date.now() - monthly) > 0) {
      let time = ms(timeout - (Date.now() - monthly));

      interaction.reply({ content: data.monthly_cooldown_error.replace(/\${time}/g, time) });
    } else {
      let embed = new EmbedBuilder()
        .setAuthor({ name: data.monthly_embed_title, iconURL: `https://cdn.discordapp.com/avatars/${interaction.user.id}/${interaction.user.avatar}.png` })
        .setColor("#a4cb80")
        .setDescription(data.monthly_embed_description)
        .addFields({ name: data.monthly_embed_fields, value: `${amount}🪙` })
      interaction.reply({ embeds: [embed] });
      db.add(`${interaction.guild.id}.USER.${interaction.user.id}.ECONOMY.money`, amount),
        db.set(`${interaction.guild.id}.USER.${interaction.user.id}.ECONOMY.monthly`, Date.now());
    }
  }
}