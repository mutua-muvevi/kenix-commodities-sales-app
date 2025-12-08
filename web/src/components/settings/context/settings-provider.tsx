/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React from "react";
import isEqual from "lodash/isEqual";

import { useMemo, useState, useEffect, useCallback } from "react";

import { useLocalStorage } from "@/hooks/use-local-storage";

import { localStorageGetItem } from "@/utils/storage-available";

import { SettingsContext } from "./settings-context";

const STORAGE_KEY = "settings";

interface SettingsProviderProps {
	children: React.ReactNode;
	defaultSettings: object | any;
}

export const SettingsProvider = ({
	children,
	defaultSettings,
}: SettingsProviderProps) => {
	
	const { state, update, reset } = useLocalStorage(
		STORAGE_KEY,
		defaultSettings
	);

	const [openDrawer, setOpenDrawer] = useState(false);

	const isArabic = localStorageGetItem("i18nextLng") === "ar";

	useEffect(() => {
		onChangeDirectionByLang("ar");

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isArabic]);

	//direction by language
	const onChangeDirectionByLang = useCallback(
		(lang: string) => {
			update("themeDirection", lang !== "ar" ? "ltr" : "ltr");
		},
		[update]
	);

	// drawer
	const onToggleDrawer = useCallback(() => {
		setOpenDrawer((prev: any) => !prev);
	}, []);

	const onCloseDrawer = useCallback(() => {
		setOpenDrawer(false);
	}, []);

	const canReset = !isEqual(state, defaultSettings);

	const memoizedValue = useMemo(
		() => ({
			...state,
			onUpdate: update,
			// Direction
			onChangeDirectionByLang,
			// Reset
			canReset,
			onReset: reset,
			// Drawer
			open: openDrawer,
			onToggle: onToggleDrawer,
			onClose: onCloseDrawer,
		}),
		[
			reset,
			update,
			state,
			canReset,
			openDrawer,
			onCloseDrawer,
			onToggleDrawer,
			onChangeDirectionByLang,
		]
	);

	return (
		<SettingsContext.Provider value={memoizedValue}>
			{children}
		</SettingsContext.Provider>
	);
};
