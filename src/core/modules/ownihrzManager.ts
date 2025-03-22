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


import { Client, time, User } from 'discord.js';

import { BotCollection, Custom_iHorizon, OwnIHRZ_New_Expire_Time_Object, OwnIHRZ_New_Owner_Object } from "../../../types/ownihrz.js";

import { OwnIhrzCluster, ClusterMethod } from "../functions/apiUrlParser.js";
import { AxiosResponse, axios } from "../functions/axios.js";
import logger from "../logger.js";

interface CacheEntry {
	type: "1h" | "3d" | "1d";
	lastNotified: number;
	nextNotificationTime: number;
}

class OwnIHRZ {
	private client: Client;
	private cache: Map<string, CacheEntry> = new Map();
	private readonly REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes
	private readonly NOTIFICATION_COOLDOWNS = {
		"1h": 30 * 60 * 1000, // 30 minutes
		"1d": 6 * 60 * 60 * 1000, // 6 hours
		"3d": 12 * 60 * 60 * 1000 // 12 hours
	};

	constructor(client: Client) {
		this.client = client
	}

	private async sendExpirationNotification(
		owner: User,
		botId: string,
		botName: string,
		expireTime: number,
		notificationType: "1h" | "1d" | "3d"
	): Promise<void> {
		var message = `📌  __**Your bot soon expire**__

> Bot: <@${botId}>
> Expire in: **${time(new Date(expireTime), "R")}**

❓ __**How renew your bot?**__

> Open a ticket in the [iHorizon Support Server](https://discord.gg/ihorizon)
> The bot price is **\`2€\`** a month`;

		try {
			// await owner.send({ content: message })

			// Update cache with new notification time
			this.cache.set(botId, {
				type: notificationType,
				lastNotified: Date.now(),
				nextNotificationTime: Date.now() + this.NOTIFICATION_COOLDOWNS[notificationType]
			});

			logger.log(`Sent expiration notification for bot ${botName} (${botId}) to owner ${owner.id}`);
		} catch (error) {
			logger.err(`Failed to send notification to owner ${owner.id} for bot ${botId}: ${error}`);
		}
	}

	private shouldSendNotification(
		botId: string,
		expireTime: number,
		notificationType: "1h" | "1d" | "3d"
	): boolean {
		const cacheEntry = this.cache.get(botId);
		const now = Date.now();

		// If no cache entry exists or it's a different notification type
		if (!cacheEntry || cacheEntry.type !== notificationType) {
			return true;
		}

		// Check if cooldown has passed
		return now >= cacheEntry.nextNotificationTime;
	}

	private async checkExpiration(botInstance: any): Promise<void> {
		const now = Date.now();
		const owner = await this.client.users.fetch(botInstance.OwnerOne).catch(() => null);

		if (!owner) return;

		const timeChecks = [
			{ type: "1h" as const, threshold: this.client.timeCalculator.to_ms("1h") },
			{ type: "1d" as const, threshold: this.client.timeCalculator.to_ms("1d") },
			{ type: "3d" as const, threshold: this.client.timeCalculator.to_ms("3d") }
		];

		for (const { type, threshold } of timeChecks) {
			if (
				botInstance.ExpireIn < now + threshold &&
				this.shouldSendNotification(botInstance.Bot.Id, botInstance.ExpireIn, type)
			) {
				await this.sendExpirationNotification(
					owner,
					botInstance.Bot.Id,
					botInstance.Bot.Name,
					botInstance.ExpireIn,
					type
				);
				break; // Only send one notification per check
			}
		}
	}

	private async Refresh(): Promise<void> {
		try {
			const ownihrzTable = this.client.db.table("OWNIHRZ");
			const ownihrzData = await ownihrzTable.get("CLUSTER") as BotCollection;

			for (const botGroup of Object.values(ownihrzData)) {
				for (const botInstance of Object.values(botGroup)) {
					await this.checkExpiration(botInstance);
				}
			}
		} catch (error) {
			logger.err(`Error in Refresh: ${error}`);
		}
	}

	async Start_Refresh(): Promise<void> {
		await this.Refresh();
		setInterval(() => this.Refresh(), this.REFRESH_INTERVAL);
	}

	// Rest of the existing methods remain unchanged
	async Startup_Cluster() {
		this.client.config.core.cluster.forEach(async (x, index) => {
			await axios.post(
				OwnIhrzCluster({
					cluster_method: ClusterMethod.StartupCluster,
					cluster_number: index
				}),
				{ adminKey: this.client.config.api.apiToken }
			);
		})
	}

	async Startup_Container() {
		var table_1 = this.client.db.table("OWNIHRZ");

		(await table_1.all()).forEach(async owner_one => {
			var cluster_ownihrz = owner_one.value;

			for (let owner_id in cluster_ownihrz) {
				for (let bot_id in cluster_ownihrz[owner_id]) {
					if (cluster_ownihrz[owner_id][bot_id].PowerOff || !cluster_ownihrz[owner_id][bot_id].Code) continue;

					let response = await axios.get(
						OwnIhrzCluster({
							cluster_method: ClusterMethod.StartupContainer,
							cluster_number: parseInt(cluster_ownihrz[owner_id][bot_id].Cluster),
							bot_id
						})
					);

					logger.log(response.data);
				}
			};
		})
	};

	async ShutDown(cluster_id: number, id_to_bot: string, modifyDb: boolean) {
		axios.get(
			OwnIhrzCluster({
				cluster_method: ClusterMethod.ShutdownContainer,
				cluster_number: cluster_id,
				bot_id: id_to_bot,
				forceDatabaseSet: modifyDb
			})
		).then(response => {
			logger.log(response.data)
		}).catch(error => { logger.err(error); });
		return 0;
	};

	async PowerOn(cluster_id: number, id_to_bot: string) {
		axios.get(
			OwnIhrzCluster({
				cluster_method: ClusterMethod.PowerOnContainer,
				cluster_number: cluster_id,
				bot_id: id_to_bot,
			})
		).then(response => {
			logger.log(response.data)
		}).catch(error => { logger.err(error); });
		return 0;

	}

	async Delete(cluster_id: number, id_to_bot: string) {
		axios.get(
			OwnIhrzCluster({
				cluster_method: ClusterMethod.DeleteContainer,
				cluster_number: cluster_id,
				bot_id: id_to_bot,
			})
		).then(response => {
			logger.log(response.data)
		}).catch(error => { logger.err(error); });
		return 0;
	};

	async QuitProgram() {
		for (const cluster_number of this.client.config.core.cluster.keys()) {
			await axios.post(
				OwnIhrzCluster({
					cluster_method: ClusterMethod.ShutDownCluster,
					cluster_number
				}),
				{ adminKey: this.client.config.api.apiToken }
			);
		}
	}

	async Change_Token(cluster_id: number, botId: string, bot_token: string) {
		axios.get(OwnIhrzCluster({
			cluster_method: ClusterMethod.ChangeTokenContainer,
			cluster_number: cluster_id!,
			bot_id: botId,
			discord_bot_token: bot_token
		}))
			.then(async () => {
			})
			.catch(error => {
				logger.err(error)
			});

		return;
	};

	async Create_Container(cluster_id: number, botData: Custom_iHorizon): Promise<AxiosResponse<any>> {
		return await axios.post(OwnIhrzCluster({
			cluster_method: ClusterMethod.CreateContainer,
			cluster_number: cluster_id,
		}),
			botData,
			{
				headers: {
					'Accept': 'application/json'
				}
			}
		);
	};

	async Active_Intents(token: string) {
		try {
			const response = await fetch("https://discord.com/api/v10/applications/@me", {
				method: "PATCH",
				headers: {
					Authorization: "Bot " + token,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ flags: 565248 }),
			});
			return await response.json();

		} catch (err) {
			logger.err((err as unknown as string));
		}
	};

	async Get_Bot(discord_bot_token: string): Promise<AxiosResponse<any>> {
		return await axios.get('https://discord.com/api/v10/applications/@me', {
			headers: {
				Authorization: `Bot ${discord_bot_token}`
			}
		});
	};

	async Change_Owner(cluster_id: number, botId: string, OwnerData: OwnIHRZ_New_Owner_Object) {
		return await axios.post(OwnIhrzCluster({
			cluster_method: ClusterMethod.ChangeOwnerContainer,
			cluster_number: cluster_id,
		}),
			{
				adminKey: this.client.config.api.apiToken,
				botId,
				OwnerData
			},
			{ headers: { 'Accept': 'application/json' } }
		);
	}

	async Change_Time(cluster_id: number, botId: string, data: OwnIHRZ_New_Expire_Time_Object) {
		return await axios.post(OwnIhrzCluster({
			cluster_method: ClusterMethod.ChangeExpireTime,
			cluster_number: cluster_id,
		}),
			{
				adminKey: this.client.config.api.apiToken,
				botId,
				data
			},
			{ headers: { 'Accept': 'application/json' } }
		);
	}

	async GetOwnersList() {
		let ownihrzTable = this.client.db.table("OWNIHRZ");
		let ownihrzData = await ownihrzTable.get("CLUSTER") as BotCollection;

		const owners: string[] = [];

		for (const botGroup of Object.values(ownihrzData)) {
			for (const botInstance of Object.values(botGroup)) {
				if (!owners.includes(botInstance.OwnerOne)) {
					owners.push(botInstance.OwnerOne);
				}
				if (botInstance.OwnerTwo && !owners.includes(botInstance.OwnerTwo)) {
					owners.push(botInstance.OwnerTwo);
				}
			}
		}

		return owners;
	}
}

export { OwnIHRZ }