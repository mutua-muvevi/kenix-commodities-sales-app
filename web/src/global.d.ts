export {};

declare global {
	interface Window {
		hljs: typeof hljs;
	}
}
declare global {
	interface Window {
		expiredTimer?: ReturnType<typeof setTimeout>;
	}
}
