
import {Logger} from "tslog";
import {Core} from "./lib/core";

const entryLog = new Logger();

async function main() {
    entryLog.info(`Startup: ${Date()}`)
    Core.initialize();
}

main().catch((err) => {
    entryLog.fatal("Error occurred in entry point:", err);
})
