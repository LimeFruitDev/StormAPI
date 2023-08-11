import {Database} from "../lib/database";

export abstract class DefaultHandlers {
    static baseRpc(json: any) {
        return {
            status: "failed"
        }
    }

    /*
        Player
     */
    static async savePlayer(json: any) {
        await Database.getClient().player.upsert({
            where: {
                id: json["playerId"] as string
            },
            create: {
                id: json["playerId"] as string,
                steamId: json["steamId"] as string,
                steamName: json["steamName"] as string,
                whitelists: json["whitelist"] as string[],
                blacklists: json["blacklist"] as string[],
                data: json["data"] as string
            },
            update: {
                steamName: json["steamName"] as string,
                whitelists: json["whitelist"] as string[],
                blacklists: json["blacklist"] as string[],
                lastSeen: new Date(),
                data: json["data"] as string
            }
        });

        return {
            status: "success"
        }
    }

    static async loadCharacters(json: any) {
        const characters = await Database.getClient().character.findMany({
            where: {
                playerId: json["playerId"] as string
            }
        });

        return {
            status: "success",
            characters: characters
        }
    }

    /*
        Character
     */
    static async saveCharacter(json: any) {
        await Database.getClient().character.upsert({
            where: {
                id: json["characterId"] as string
            },
            create: {
                id: json["characterId"] as string,
                playerId: json["playerId"] as string,
                name: json["name"] as string,
                model: json["model"] as string,
                faction: json["faction"] as string,
                data: json["data"] as string
            },
            update: {
                // TODO: Maybe allow swapping around playerIds to transfer characters?
                name: json["name"] as string,
                model: json["model"] as string,
                faction: json["faction"] as string,
                data: json["data"] as string
            }
        });

        return {
            status: "success"
        }
    }

    /*
        Item
     */
    static async saveItem(json: any) {
        await Database.getClient().item.upsert({
            where: {
                id: json["uniqueId"]
            },
            create: {
                id: json["uniqueId"] as string,
                inventoryId: json["inventoryId"] as string,
                properties: json["properties"] as string
            },
            update: {
                inventoryId: json["inventoryId"] as string,
                properties: json["properties"] as string
            }
        });

        return {
            status: "success"
        }
    }
}
