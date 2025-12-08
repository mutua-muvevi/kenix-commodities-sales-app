"use client";

import React, { useEffect } from "react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { CacheProvider } from "@emotion/react";

// ----------------------------------------------------------------------

interface RTLProps {
	children: React.ReactNode;
	themeDirection: "rtl" | "ltr";
}

const RTL = ({ children, themeDirection }: RTLProps) => {
	useEffect(() => {
		document.dir = themeDirection;
	}, [themeDirection]);

	const cacheRtl = createCache({
		key: "rtl",
		prepend: true,
		stylisPlugins: [rtlPlugin],
	});

	if (themeDirection === "rtl") {
		return <CacheProvider value={cacheRtl}>{children}</CacheProvider>;
	}

	return <>{children}</>;
};

export default RTL;
