/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useContext, createContext } from "react";

// ----------------------------------------------------------------------

export const SettingsContext = createContext({});

export const useSettingsContext = () : any => {
	const context = useContext(SettingsContext);

	if (!context)
		throw new Error("useSettingsContext must be use inside SettingsProvider");

	return context;
};
