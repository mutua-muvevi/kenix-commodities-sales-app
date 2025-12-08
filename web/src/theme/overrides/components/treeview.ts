// ----------------------------------------------------------------------

import { ThemeTypes } from "@/theme/types";

export const treeView = (theme: ThemeTypes) => {
	return {
		MuiTreeItem: {
			styleOverrides: {
				label: {
					...theme.typography.body2,
				},
				iconContainer: {
					width: "auto",
				},
			},
		},
	};
};
