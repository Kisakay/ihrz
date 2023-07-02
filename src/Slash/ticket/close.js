/*
・ iHorizon Discord Bot (https://github.com/ihrz/ihrz)

・ Licensed under the Attribution-NonCommercial-ShareAlike 2.0 Generic (CC BY-NC-SA 2.0)

	・   Under the following terms:

		・ Attribution — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.

		・ NonCommercial — You may not use the material for commercial purposes.

		・ ShareAlike — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.

		・ No additional restrictions — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.


・ Mainly developed by Kisakay (https://github.com/Kisakay)

・ Copyright © 2020-2023 iHorizon
*/

const slashInfo = require(`${process.cwd()}/files/ihorizon-api/slashHandler`);
const DataBaseModel = require(`${process.cwd()}/files/ihorizon-api/main.js`);
const sourcebin = require('sourcebin_js');

const {
	Client,
	Intents,
	Collection,
	ChannelType,
	EmbedBuilder,
	Permissions,
	ApplicationCommandType,
	PermissionsBitField,
	ApplicationCommandOptionType
} = require(`${process.cwd()}/files/ihorizonjs`);

const logger = require(`${process.cwd()}/src/core/logger`);

slashInfo.ticket.close.run = async (client, interaction) => {
	const getLanguageData = require(`${process.cwd()}/src/lang/getLanguageData`);
	let data = await getLanguageData(interaction.guild.id);

	let blockQ = await DataBaseModel({ id: DataBaseModel.Get, key: `${interaction.user.id}.GUILD.TICKET.on_or_off` });

	if (blockQ === true) {
		return interaction.reply(data.close_disabled_command);
	}

	if (interaction.channel.name.includes('ticket-')) {
		const member = interaction.guild.members.cache.get(interaction.channel.name.split('ticket-').join(''));
		if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator) || interaction.channel.name === `ticket-${interaction.user.id}`) {
			interaction.channel.messages.fetch().then(async (messages) => {
				const output = messages.reverse().map(m => `${new Date(m.createdAt).toLocaleString('en-US')} - ${m.author.username}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`).join('\n');

				let response;
				try {
					response = await sourcebin.create([
						{
							name: ' ',
							content: output,
							languageId: 'text',
						},
					], {
						title: data.close_title_sourcebin,
						description: data.close_description_sourcebin,
					});
				}
				catch (e) {
					return interaction.reply(data.close_error_command);
				}
				try {
					const embed = new EmbedBuilder()
						.setDescription(`[\`View This\`](${response.url})`)
						.setColor('#5b92e5');
					interaction.reply({ content: data.close_command_work_channel, embeds: [embed] })
				} catch (e) {
					logger.err(e)

				}

				try {
					interaction.channel.permissionOverwrites.create(member.user, { ViewChannel: false, SendMessages: false, ReadMessageHistory: false });
					interaction.channel.send({ content: data.close_command_work_notify_channel });
				}
				catch (e) {
					return interaction.channel.send(data.close_command_error);
				}
			});
		}
	} else {
		return interaction.reply(data.close_not_in_ticket);
	};
};

module.exports = slashInfo.ticket.close;