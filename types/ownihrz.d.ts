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

export interface Custom_iHorizon {
	Auth: string;
	AdminKey: string;
	OwnerOne: string;
	OwnerTwo: string;
	Cluster?: number;
	Prefix: string | null;
	Bot: {
		Id: string;
		Name: string;
		Public: boolean;
	};
	Code: string;
	ExpireIn: string;
	PowerOff?: boolean;
}

export interface OwnIHRZ_New_Owner_Object {
	OldOwnerOne: string;
	NewOwnerOne: string;
	NewOwnerTwo: string;
}

export interface OwnIHRZ_New_Expire_Time_Object {
	method: "sub" | "add",
	ms: number;
}

export interface BotInstance {
	Path: string;
	Auth: string;
	port?: number;
	Cluster: string | number;
	OwnerOne: string;
	OwnerTwo: string;
	ExpireIn: number;
	Bot: {
		Name: string;
		Id: string;
		Public: boolean;
	}
	Code: string;
	PowerOff?: boolean;
}

export type BotCollection = Record<string, Record<string, BotInstance>>;