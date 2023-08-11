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
    static async commitPlayer(json: any) {
        await Database.getClient().player.upsert({
            create: {
                id: json["playerId"] as string,
                steamName: json["steamName"] as string,
                steamId: json["steamId"] as string
            },
            update: {
                lastSeen: new Date()
            },
            where: {
                id: json["playerId"] as string
            }
        })

        return {
            status: "success"
        }
    }

    static async savePlayer(json: any) {
        await Database.getClient().player.update({
            where: {
                id: json["playerId"] as string
            },
            data: {
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
    static async commitCharacter(json: any) {
        await Database.getClient().character.create({
            data: {
                id: json["characterId"] as string,
                playerId: json["playerId"] as string,
                name: json["name"] as string,
                model: json["model"] as string,
                faction: json["faction"] as string
            }
        });

        return {
            status: "success"
        }
    }

    static async saveCharacter(json: any) {
        await Database.getClient().character.update({
            where: {
                id: json["characterId"] as string
            },
            data: {
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
}
