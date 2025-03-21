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

import { Logger } from "../../types/logger.js";
import { log as _ } from 'console';
import "./functions/colors.js";

function getCurrentTime(): string {
	return (new Date()).toLocaleString()
};

let logger: Logger = {
	warn(message) {
		_(`[${getCurrentTime()} WRN]: `.red + message);
	},
	err(message) {
		_(`[${getCurrentTime()} ERR]: `.red + message);
	},
	log(message) {
		_(`[${getCurrentTime()} LOG]: `.green + message);
	},
	legacy(message) {
		_(message);
	},
	returnLog(message) {
		return `[${getCurrentTime()} LOG]: `.green + message;
	}
};

export default logger;