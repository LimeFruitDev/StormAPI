
import * as express from "express";
import * as http from "http";
import * as ws from "ws";
import {Logger} from "tslog";
import {Shutdown} from "./shutdown";
import {Database} from "./database";
import {DefaultHandlers} from "../handlers/default";
import {CustomHandlers} from "../handlers/custom";

const coreLog = new Logger();

export abstract class Core {
    private static application: express.Express;
    private static httpServer: http.Server;
    private static webSocketServer: ws.Server;
    private static messageHandlers: Map<string, Function>;

    static initialize() {
        coreLog.info("Initializing core module.");

        Shutdown.initialize();
        void Database.initialize();

        this.application = express();
        this.httpServer = http.createServer(this.application);
        this.webSocketServer = new ws.Server({
            server: this.httpServer
        });

        this.webSocketServer.on("connection", async (socket) => {
            await this.setupConnection(socket);
        });

        this.httpServer.listen(process.env.PORT || 8080, () => {
            coreLog.info(`Listening on port ${(this.httpServer.address() as ws.AddressInfo).port}`);
        });

        this.setupHandlers();
    }

    static setupHandlers() {
        this.messageHandlers = new Map<string, Function>();

        const defaultHandlers = Object.getOwnPropertyNames(DefaultHandlers);
        const customHandlers = Object.getOwnPropertyNames(CustomHandlers);

        const registrar = (nameList: string[], container: any) => {
            nameList.forEach((value) => {
                if (value == "prototype" || value == "length" || value == "name")
                    return;

                this.messageHandlers.set(value, container[value as keyof typeof container] as Function);
            });
        };

        registrar(defaultHandlers, DefaultHandlers);
        registrar(customHandlers, CustomHandlers);
    }

    static async setupConnection(socket: ws.WebSocket) {
        coreLog.trace("Receiving new connection.");

        socket.on("message", async (data, isBinary) => {
            if (isBinary) {
                coreLog.error("Received raw binary data from the server, rejecting.");
                return;
            }

            await this.messageReceivedCallback(socket, data.toString("utf8"));
        });

        socket.on("close", async () => {
            coreLog.trace("An active connection was closed.");
        });
    }

    static async messageReceivedCallback(socket: ws.WebSocket, message: string) {
        coreLog.debug(`Received: ${message}`);

        const json = JSON.parse(message);
        const uniqueId = json.uniqueId;
        const messageType = json.type;
        let reply: any = {status: "failed"};

        if (this.messageHandlers.has(messageType)) {
            try {
                reply = await this.messageHandlers.get(messageType)?.call(null, json);
            } catch (err) {
                coreLog.error(`Message handler for ${uniqueId} failed with error: ${err}`);
            }
        } else {
            coreLog.error(`There is no handler for message type ${messageType}`);
        }

        if (reply.status == null || reply.status != "success")
            coreLog.warn(`Handler for message ${uniqueId} possibly failed.`);

        reply.uniqueId = uniqueId;
        this.sendMessage(socket, JSON.stringify(reply));
    }

    static sendMessage(socket: ws.WebSocket, message: string) {
        coreLog.debug(`Sending: ${message}`);
        socket.send(message);
    }

    static async shutdown() {
        await Database.shutdown();
    }
}
