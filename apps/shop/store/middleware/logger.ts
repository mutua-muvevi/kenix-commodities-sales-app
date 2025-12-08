// src/store/middleware/logger.ts
import { StateCreator, StoreMutatorIdentifier } from "zustand";

type Logger = <
	T,
	Mps extends [StoreMutatorIdentifier, unknown][] = [],
	Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
	f: StateCreator<T, Mps, Mcs>,
	name?: string,
) => StateCreator<T, Mps, Mcs>;

type LoggerImpl = <T>(f: StateCreator<T, [], [], T>, name?: string) => StateCreator<T, [], [], T>;

const loggerImpl: LoggerImpl = (f, name) => (set, get, store) => {
	const loggedSet: typeof set = (...args) => {
		const nextState = args[0];

		// if (process.env.NODE_ENV === "development") {
		// 	console.group(`🏪 ${name || "Store"} Update`);
		// 	console.log("⬆️ Updating:", typeof nextState === "function" ? "function" : nextState);
		// 	console.log("📄 Previous State:", get());
		// }

		set(...args);

		// if (process.env.NODE_ENV === "development") {
		// 	console.log("📋 New State:", get());
		// 	console.groupEnd();
		// }
	};

	store.setState = loggedSet;
	return f(loggedSet, get, store);
};

export const logger = loggerImpl as Logger;
