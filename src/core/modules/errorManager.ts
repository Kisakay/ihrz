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

import { format } from '../functions/date_and_time.js';
import logger from '../logger.js';

import fs from 'node:fs';
import { Client } from 'discord.js';

export const uncaughtExceptionHandler = (client: Client) => {
	process.on('uncaughtException', function (err) {
		if (!client.config.core.devMode) {
			logger.err(`${client.config.console.emojis.ERROR} >> Error detected`.red);
			logger.err(`${client.config.console.emojis.OK} >> Save in the logs`.gray);

			let filesPath: string = `${process.cwd()}/src/files/error.log`;
			let CreateFile = fs.createWriteStream(filesPath, { flags: 'a' });
			let i = `[${format((new Date()), 'DD/MM/YYYY HH:mm:ss')}]\n${err.stack || err.message}\r\n`;

			return CreateFile.write(i);
		};

		logger.err(err.stack || err.message);
	});

	process.on("unhandledRejection", function (err) {
		console.error(err);
		if (!client.config.core.devMode) {
			logger.err(`${client.config.console.emojis.ERROR} >> Error detected`.red);
			logger.err(`${client.config.console.emojis.OK} >> Save in the logs`.gray);

			let filesPath: string = `${process.cwd()}/src/files/error.log`;
			let CreateFile = fs.createWriteStream(filesPath, { flags: 'a' });
			let i = `[${format((new Date()), 'DD/MM/YYYY HH:mm:ss')}]\n${JSON.stringify(err)}\r\n`;

			return CreateFile.write(i);
		};
	});
};