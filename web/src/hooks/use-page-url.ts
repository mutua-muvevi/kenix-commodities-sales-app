"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

const usePageUrl = () => {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	return useMemo(() => {
		const queryString = searchParams.toString();
		return queryString ? `${pathname}?${queryString}` : pathname;
	}, [pathname, searchParams]);
};

export default usePageUrl;
