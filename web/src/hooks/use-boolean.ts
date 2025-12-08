/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";

// ----------------------------------------------------------------------

export const useBoolean = (defaultValue? : any | null) => {
	const [value, setValue] = useState(!!defaultValue);

	const onTrue = useCallback(() => {
		setValue(true);
	}, []);

	const onFalse = useCallback(() => {
		setValue(false);
	}, []);

	const onToggle = useCallback(() => {
		setValue((prev) => !prev);
	}, []);

	return {
		value,
		onTrue,
		onFalse,
		onToggle,
		setValue,
	};
}
