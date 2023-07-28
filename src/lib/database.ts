import {Logger} from "tslog";
import {PrismaClient} from "@prisma/client";

const dbLog = new Logger();

export abstract class Database {
    private static client: PrismaClient;

    static async initialize() {
        this.client = new PrismaClient();
    }

    static getClient() {
        return this.client;
    }

    static async shutdown() {
        await this.client.$disconnect().catch((err) => {
            dbLog.fatal("Encountered an error while shutting down the database", err);
        });
    }
}
