/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";

export const useLocalStorage = (key: string, initialState: any) : any => {
	const [state, setState] = useState(initialState);

	useEffect(() => {
		const restored = getStorage(key);

		if (restored) {
			setState((prevState: any) => ({
				...prevState,
				...restored,
			}));
		}
	}, [key]);

	const updateState = useCallback(
		(updatedValue : any) => {
			try {
				setState((prevValue : any) => {
					setStorage(key, {
						...prevValue,
						...updatedValue,
					})

					return {
						...prevValue,
						...updatedValue,
					}
				})
			} catch (error) {
				console.error(error)
			}
		}, [key]
	)
 
	const update = useCallback(
		(name : string, updatedValue: any) : void => {
			updateState({
				[name]: updatedValue,
			});

		}, [updateState]
	)

	const reset = useCallback(
		() => {
			removeStorage(key);

			setState(initialState);
		}, [initialState, key]
	)

	return {
		state,
		update,
		reset,
	}
};

/*---------------------------------------------------------------- */

// get storage
export const getStorage = (key: string): any => {
	let value = null;

	try {
		const result = window.localStorage.getItem(key);

		if (result) {
			value = JSON.parse(result);
		}
	} catch (error) {
		console.error(error);
	}

	return value;
};

// set storage
export const setStorage = (key: string, value: any): void => {
	try {
		window.localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		console.error(error);
	}
};

// remove storage
export const removeStorage = (key: string): void => {
	try {
		window.localStorage.removeItem(key);
	} catch (error) {
		console.error(error);
	}
};
