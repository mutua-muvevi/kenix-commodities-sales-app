/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { createContext } from "react";

interface UsersContextProps {
	allUsers : any[],
}

export const UsersContext = createContext<UsersContextProps | null>(null);