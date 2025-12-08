'use client';

import { useContext } from 'react';
import { UsersContext } from './context';

// ----------------------------------------------------------------------

export const useUsersContext = () => {
	const context = useContext(UsersContext);

	if (!context) throw new Error('useUsersContext context must be use inside UsersProvider');

	return context;
};