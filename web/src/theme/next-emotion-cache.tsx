/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import createCache from "@emotion/cache";
import { useServerInsertedHTML } from "next/navigation";
import { CacheProvider as DefaultCacheProvider } from "@emotion/react";

// ----------------------------------------------------------------------

interface EmotionCacheProviderProps {
	CacheProvider?: React.ReactElement | React.ElementType | any;
	children?: React.ReactNode;
	options?:  object | any;
};

const NextAppDirEmotionCacheProvider = (props: EmotionCacheProviderProps) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { options, CacheProvider = DefaultCacheProvider, children } = props;

	const [registry] = React.useState(() => {
		const cache = createCache(options);

		cache.compat = true;
		const prevInsert = cache.insert;

		let inserted : any[] = [];

		cache.insert = (...args) => {
			const [selector, serialized] = args;
			if (cache.inserted[serialized.name] === undefined) {
				inserted.push({
					name: serialized.name,
					isGlobal: !selector,
				});
			}
			return prevInsert(...args);
		};

		const flush = () => {
			const prevInserted = inserted;
			inserted = [];
			return prevInserted;
		};
		return { cache, flush };
	});

	useServerInsertedHTML(() => {
		const inserted = registry.flush();
		if (inserted.length === 0) {
			return null;
		}
		let styles = "";
		let dataEmotionAttribute = registry.cache.key;

		const globals : any[] = [];

		inserted.forEach(({ name, isGlobal }) => {
			const style = registry.cache.inserted[name];

			if (typeof style !== "boolean") {
				if (isGlobal) {
					globals.push({ name, style });
				} else {
					styles += style;
					dataEmotionAttribute += ` ${name}`;
				}
			}
		});

		return (
			<>
				{globals.map(({ name, style }) => (
					<style
						key={name}
						data-emotion={`${registry.cache.key}-global ${name}`}
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={{ __html: style }}
					/>
				))}
				{styles && (
					<style
						data-emotion={dataEmotionAttribute}
						// eslint-disable-next-line react/no-danger
						dangerouslySetInnerHTML={{ __html: styles }}
					/>
				)}
			</>
		);
	});

	return <CacheProvider value={registry.cache}>{children}</CacheProvider>;
};

export default NextAppDirEmotionCacheProvider;