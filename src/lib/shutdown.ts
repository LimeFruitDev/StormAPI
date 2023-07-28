
import {Logger} from "tslog";
import {Core} from "./core";

const shutdownLog = new Logger();

export enum ShutdownReason {
    ExitStandard,
    ExitInterrupt,
    ExitRequested,
    ExitFatalError
}

export interface ShutdownOptions {
    reason: ShutdownReason;
    cleanup: boolean;
    exit: boolean;
}

export abstract class Shutdown {
    private static announceShutdown = true;

    static initialize() {
        shutdownLog.info("Initializing Shutdown module.");

        process.on("exit", this.callback.bind(this, {
            reason: ShutdownReason.ExitStandard,
            cleanup: true,
            exit: false
        }));

        process.on("SIGINT", this.callback.bind(this, {
            reason: ShutdownReason.ExitInterrupt,
            cleanup: true,
            exit: true
        }));

        process.on("SIGUSR1", this.callback.bind(this, {
            reason: ShutdownReason.ExitRequested,
            cleanup: false,
            exit: true
        }));

        process.on("SIGUSR2", this.callback.bind(this, {
            reason: ShutdownReason.ExitRequested,
            cleanup: false,
            exit: true
        }));

        process.on("uncaughtException", this.callback.bind(this, {
            reason: ShutdownReason.ExitFatalError,
            cleanup: false,
            exit: true
        }));
    }

    static async callback(options: ShutdownOptions) {
        if (this.announceShutdown) {
            switch (options.reason) {
                case ShutdownReason.ExitStandard: {
                    shutdownLog.info("Shutting down: Standard.");
                    break;
                }

                case ShutdownReason.ExitInterrupt: {
                    shutdownLog.warn("Shutting down: Interrupt.");
                    break;
                }

                case ShutdownReason.ExitRequested: {
                    shutdownLog.warn("Shutting down: Requested.");
                    break;
                }

                case ShutdownReason.ExitFatalError: {
                    shutdownLog.fatal("Shutting down: Fatal error.");
                    break;
                }

                default: {
                    shutdownLog.error("Shutting down: Unknown.");
                    break;
                }
            }
        }

        if (options.cleanup) {
            await Core.shutdown();
        }

        if (options.exit) {
            this.announceShutdown = false;
            process.exit();
        }
    }
}

