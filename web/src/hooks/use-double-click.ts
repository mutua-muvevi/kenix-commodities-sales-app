/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useCallback } from "react";

// ----------------------------------------------------------------------

interface UseDoubleClickProps {
	click?: any;
	doubleClick?: any;
	timeout?: number;
}

export const useDoubleClick = ({ click, doubleClick, timeout = 250 }: UseDoubleClickProps) => {

	const clickTimeout = useRef<null | NodeJS.Timeout>(null);

	const clearClickTimeout = () => {
		if (clickTimeout.current) {
			clearTimeout(clickTimeout.current);
			clickTimeout.current = null;
		}
	};

	return useCallback(
		(event: any) => {
			clearClickTimeout();

			if (click && event.detail === 1) {
				clickTimeout.current = setTimeout(() => {
					click(event);
				}, timeout);
			}

			if (event.detail % 2 === 0) {
				doubleClick(event);
			}
		},
		[click, doubleClick, timeout],
	);
}
