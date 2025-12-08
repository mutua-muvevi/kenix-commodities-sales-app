/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";
import { useMemo, useEffect, useReducer, useCallback } from "react";

import { UsersContext } from "./context";
import { fetchAllUsers } from "@/actions/user/fetch-all";
import { isValidToken } from "@/auth/context/utils";

//----------------------------------------------------------------------
// initial state
const initialState = {
	loading: true,
	users: [],
};

// ----------------------------------------------------------------------
// reducer
const reducer = (state: any, action: { type: string; payload: any }) => {
	if (action.type === "INITIAL") {
		return {
			loading: false,
			users: action.payload.users,
		};
	}
	if (action.type === "FETCH ALL USERS") {
		return {
			...state,
			users: action.payload.users,
		};
	}
	return state;
};

const TOKEN_KEY = "token";

// ----------------------------------------------------------------------
//context provider
export const UsersProvider = ({ children }: { children: React.ReactNode }) => {
	const [state, dispatch] = useReducer(reducer, initialState);

	// initialize
	const initialize = useCallback(async () => {
		try {
			const token = sessionStorage.getItem(TOKEN_KEY);

			if (token && isValidToken(token)) {
				const users = await fetchAllUsers(token);
				console.log("users", users);

				dispatch({ type: "INITIAL", payload: { users } });
			} else {
				dispatch({ type: "INITIAL", payload: { users: [] } });
			}
		} catch (error) {
			console.error(error);

			dispatch({ type: "INITIAL", payload: { users: [] } });
		}
	}, []);

	useEffect(() => {
		initialize();
	}, [initialize]);

	const memoizedValues = useMemo(
		() => ({ 
			...state,
		}),
		[state, dispatch]
	);

	return (
		<UsersContext.Provider value={memoizedValues}>
			{children}
		</UsersContext.Provider>
	);
};
