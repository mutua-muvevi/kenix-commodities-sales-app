// "use client";

import merge from "lodash/merge";
// date fns
import {
	fr as frFRAdapter,
	vi as viVNAdapter,
	enUS as enUSAdapter,
	zhCN as zhCNAdapter,
	arSA as arSAAdapter,

	es as esESAdapter,
	ja as jaJAAdapter
} from "date-fns/locale";

// date pickers (MUI)
import {
	enUS as enUSDate,
	frFR as frFRDate,
	viVN as viVNDate,
	zhCN as zhCNDate,

	jaJP as JaJPDate,
	esES as esESDate
} from "@mui/x-date-pickers/locales";

// core (MUI)
import {
	enUS as enUSCore,
	frFR as frFRCore,
	viVN as viVNCore,
	zhCN as zhCNCore,
	arSA as arSACore,

	jaJP as JaJPCore,
	esES as esESCore
} from "@mui/material/locale";

// data grid (MUI)
// import {
// 	enUS as enUSDataGrid,
// 	frFR as frFRDataGrid,
// 	viVN as viVNDataGrid,
// 	zhCN as zhCNDataGrid,
// 	arSD as arSDDataGrid,
// } from "@mui/x-data-grid";


export const allLangs = [
	{
		label: "English",
		value: "en",
		systemValue: merge(enUSDate, enUSCore),
		adapterLocale: enUSAdapter,
		icon: "flagpack:us",
		numberFormat: {
			code: "en-US",
			currency: "USD",
		},
	},
	{
		label: "French",
		value: "fr",
		systemValue: merge(frFRDate, frFRCore),
		adapterLocale: frFRAdapter,
		icon: "flagpack:fr",
		numberFormat: {
			code: "fr-Fr",
			currency: "EUR",
		},
	},
	{
		label: "Vietnamese",
		value: "vi",
		systemValue: merge(viVNDate, viVNCore),
		adapterLocale: viVNAdapter,
		icon: "flagpack:vn",
		numberFormat: {
			code: "vi-VN",
			currency: "VND",
		},
	},
	{
		label: "Chinese",
		value: "cn",
		systemValue: merge(zhCNDate, zhCNCore),
		adapterLocale: zhCNAdapter,
		icon: "flagpack:cn",
		numberFormat: {
			code: "zh-CN",
			currency: "CNY",
		},
	},
	{
		label: "Arabic",
		value: "ar",
		systemValue: merge(arSACore),
		adapterLocale: arSAAdapter,
		icon: "flagpack:sa",
		numberFormat: {
			code: "ar",
			currency: "AED",
		},
	},
	{
		label: "Japanese",
		value: "ja",
		systemValue: merge(JaJPDate, JaJPCore),
		adapterLocale: jaJAAdapter,
		icon: "flagpack:jp",
		numberFormat: {
			code: "jp",
			currency: "YEN",
		},
	},
	{
		label: "Spanish",
		value: "es",
		systemValue: merge(esESDate, esESCore),
		adapterLocale: esESAdapter,
		icon: "flagpack:es",
		numberFormat: {
			code: "es",
			currency: "EUR",
		},
	},
];

export const defaultLang = allLangs[0];