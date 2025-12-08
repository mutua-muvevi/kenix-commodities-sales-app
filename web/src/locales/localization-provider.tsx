"use client";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider as MuiLocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { useLocales } from "./use-locales";

// ----------------------------------------------------------------------

interface LocalizationProviderProps {
	children: React.ReactNode;
}

const LocalizationProvider = ({ children }: LocalizationProviderProps) => {
	const { currentLang } = useLocales();

	return (
		<MuiLocalizationProvider
			dateAdapter={AdapterDateFns}
			adapterLocale={currentLang.adapterLocale}
		>
			{children}
		</MuiLocalizationProvider>
	);
};

export default LocalizationProvider;
