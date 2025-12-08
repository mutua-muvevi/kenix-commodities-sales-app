// store/config/data-source-config.ts - Centralized data source configuration
export type DataSource = "mock" | "server" | "hybrid";

export interface DataSourceConfig {
	categories: DataSource;
	products: DataSource;
	users: DataSource;
	orders: DataSource;
	auth: DataSource;
}

// Default configuration - easily switchable
export const DATA_SOURCE_CONFIG: DataSourceConfig = {
	categories: "mock", // Switch to 'server' when ready
	products: "mock", // Switch to 'server' when ready
	users: "mock", // Switch to 'server' when ready
	orders: "mock", // Switch to 'server' when ready
	auth: "mock", // Switch to 'server' when ready
};

// Environment-based overrides
export const getDataSourceConfig = (): DataSourceConfig => {
	// Check if we're in development mode
	const isDev = __DEV__ || process.env.NODE_ENV === "development";

	// Allow environment variable overrides
	const envConfig: Partial<DataSourceConfig> = {};

	if (process.env.EXPO_PUBLIC_USE_MOCK_CATEGORIES === "false") {
		envConfig.categories = "server";
	}
	if (process.env.EXPO_PUBLIC_USE_MOCK_PRODUCTS === "false") {
		envConfig.products = "server";
	}
	if (process.env.EXPO_PUBLIC_USE_MOCK_AUTH === "false") {
		envConfig.auth = "server";
	}

	return {
		...DATA_SOURCE_CONFIG,
		...envConfig,
	};
};

// Utility to check data source
export const isUsingMockData = (module: keyof DataSourceConfig): boolean => {
	const config = getDataSourceConfig();
	return config[module] === "mock";
};

export const isUsingServerData = (module: keyof DataSourceConfig): boolean => {
	const config = getDataSourceConfig();
	return config[module] === "server";
};

export const isUsingHybridData = (module: keyof DataSourceConfig): boolean => {
	const config = getDataSourceConfig();
	return config[module] === "hybrid";
};
