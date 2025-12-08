// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useCallback } from "react";

import { useTheme } from "@mui/material/styles";

// ----------------------------------------------------------------------

const useCarousel = (props: any) => {
	const theme = useTheme();

	const carouselRef = useRef(null);

	const [currentIndex, setCurrentIndex] = useState(props?.initialSlide || 0);

	const [nav, setNav] = useState(undefined);

	const rtl = theme.direction === "rtl";

	const carouselSettings = {
		arrows: false,
		dots: !!props?.customPaging,
		rtl,
		beforeChange: (current : any, next : any) => setCurrentIndex(next),
		...props,
		fade: !!(props?.fade && !rtl),
	};

	const onSetNav = useCallback(() => {
		if (carouselRef.current) {
			setNav(carouselRef.current);
		}
	}, []);

	const onPrev = useCallback(() => {
		if (carouselRef.current) {
			carouselRef.current.slickPrev();
		}
	}, []);

	const onNext = useCallback(() => {
		if (carouselRef.current) {
			carouselRef.current.slickNext();
		}
	}, []);

	const onTogo = useCallback((index : any) => {
		if (carouselRef.current) {
			carouselRef.current.slickGoTo(index);
		}
	}, []);

	return {
		nav,
		carouselRef,
		currentIndex,
		carouselSettings,
		//
		onPrev,
		onNext,
		onTogo,
		onSetNav,
		//
		setNav,
		setCurrentIndex,
	};
};

export default useCarousel;
