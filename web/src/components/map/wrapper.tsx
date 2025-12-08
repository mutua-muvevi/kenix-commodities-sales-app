// src/components/map/MapWrapper.tsx
"use client";

import { LoadScript } from "@react-google-maps/api";
import { ReactNode } from "react";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

interface MapWrapperProps {
	children: ReactNode;
}

const MapWrapper = ({ children }: MapWrapperProps) => {
	return (
		<LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={["places", "marker"]}>
			{children}
		</LoadScript>
	);
};

export default MapWrapper;
