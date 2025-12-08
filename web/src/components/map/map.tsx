/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useTheme, Box, Typography, CircularProgress } from "@mui/material";
import axios from "axios";
import { createCustomMarkerIcon } from "./custom-marker";
import CustomInfoWindow from "./info-window";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const containerStyle = {
	width: "100%",
	height: "100%",
};

const lightModeStyle: any = [];
const darkModeStyle = [
	{ elementType: "geometry", stylers: [{ color: "#212121" }] },
	{ elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
	{ elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
	{
		featureType: "administrative",
		elementType: "geometry",
		stylers: [{ color: "#757575" }],
	},
	{
		featureType: "road",
		elementType: "geometry",
		stylers: [{ color: "#484848" }],
	},
	{
		featureType: "water",
		elementType: "geometry",
		stylers: [{ color: "#000000" }],
	},
];

interface BusinessesMapProps {
	businesses?: any[];
	business?: any;
	type?: "array" | "single";
	givenCenter?: [number, number];
	onBusinessClick?: (business: any) => void;
}

interface ProcessedBusiness {
	_id: string;
	businessName: string;
	location: {
		coordinates: [number, number]; // [lng, lat] from your data
		city: string;
		country: string;
		street: string;
	};
	logo?: string;
	basicInfo?: {
		phone?: string;
		website?: string;
	};
	position: {
		lat: number;
		lng: number;
	};
}

const BusinessesMap = ({ 
	businesses, 
	business, 
	type = "array", 
	givenCenter, 
	onBusinessClick 
}: BusinessesMapProps) => {
	const theme = useTheme();
	const [userCenter, setUserCenter] = useState<{ lat: number; lng: number } | null>(null);
	const [selectedBusiness, setSelectedBusiness] = useState<ProcessedBusiness | null>(null);
	const [processedBusinesses, setProcessedBusinesses] = useState<ProcessedBusiness[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isMapReady, setIsMapReady] = useState(false);
	const [markerIcons, setMarkerIcons] = useState<{ [key: string]: string }>({});
	const mapRef = useRef<google.maps.Map | null>(null);

	const defaultCenter = {
		lat: 47.39722367609094, 
		lng: -122.19907369905921,
	};

	// Geocode city function
	const geocodeCity = useCallback(async (city: string, country: string): Promise<{ lat: number; lng: number } | null> => {
		if (!city || !GOOGLE_MAPS_API_KEY) return null;
		try {
			const response = await axios.get(
				`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
					`${city}, ${country || ""}`,
				)}&key=${GOOGLE_MAPS_API_KEY}`,
			);
			const result = response.data.results[0];
			return result ? { lat: result.geometry.location.lat, lng: result.geometry.location.lng } : null;
		} catch (error) {
			console.error("Geocoding error:", error);
			return null;
		}
	}, []);

	// Process businesses with geocoding
	useEffect(() => {
		const processBusinesses = async () => {
			setIsLoading(true);
			const businessesToProcess = type === "array" ? businesses || [] : business ? [business] : [];
			// console.log("Processing businesses:", businessesToProcess.length);

			const processed: ProcessedBusiness[] = [];
			
			for (const biz of businessesToProcess) {
				if (!biz || !biz._id) {
					// console.log("Skipping invalid business:", biz);
					continue;
				}
				
				let coordinates = biz.location?.coordinates;
				let position: { lat: number; lng: number };
				
				// Check if coordinates exist and are valid
				if (coordinates && Array.isArray(coordinates) && coordinates.length === 2) {
					// Your data format is [lng, lat], convert to Google Maps format
					const [lng, lat] = coordinates;
					if (lat !== 0 && lng !== 0 && !isNaN(lat) && !isNaN(lng)) {
						position = { lat: Number(lat), lng: Number(lng) };
						// console.log(`Business ${biz.businessName}: Using existing coordinates [${lng}, ${lat}] -> {lat: ${position.lat}, lng: ${position.lng}}`);
					} else {
						// Try geocoding
						const geocoded = await geocodeCity(biz.location?.city, biz.location?.country);
						if (geocoded) {
							position = geocoded;
							coordinates = [geocoded.lng, geocoded.lat]; // Update to your format
							// console.log(`Business ${biz.businessName}: Geocoded to {lat: ${position.lat}, lng: ${position.lng}}`);
						} else {
							// console.log(`Business ${biz.businessName}: Could not geocode, skipping`);
							continue;
						}
					}
				} else {
					// Try geocoding
					const geocoded = await geocodeCity(biz.location?.city, biz.location?.country);
					if (geocoded) {
						position = geocoded;
						coordinates = [geocoded.lng, geocoded.lat]; // Update to your format
						// console.log(`Business ${biz.businessName}: Geocoded to {lat: ${position.lat}, lng: ${position.lng}}`);
					} else {
						// console.log(`Business ${biz.businessName}: Could not geocode, skipping`);
						continue;
					}
				}
				
				processed.push({
					...biz,
					location: {
						...(biz.location || {}),
						coordinates: coordinates as [number, number],
					},
					position,
				});
			}
			
			// console.log("Processed businesses:", processed.length, processed)
			// console.log("Theme", theme)
			setProcessedBusinesses(processed);
			setIsLoading(false);
		};

		if (businesses || business) {
			processBusinesses();
		} else {
			setProcessedBusinesses([]);
			setIsLoading(false);
		}
	}, [businesses, business, type, geocodeCity]);

	// Set user center
	useEffect(() => {
		if (givenCenter && givenCenter.length === 2) {
			setUserCenter({
				lat: givenCenter[0],
				lng: givenCenter[1],
			});
			return;
		}

		// If we have processed businesses, center on the first one or middle of all
		if (processedBusinesses.length > 0) {
			if (processedBusinesses.length === 1) {
				setUserCenter(processedBusinesses[0].position);
			} else {
				// Calculate center of all businesses
				const avgLat = processedBusinesses.reduce((sum, b) => sum + b.position.lat, 0) / processedBusinesses.length;
				const avgLng = processedBusinesses.reduce((sum, b) => sum + b.position.lng, 0) / processedBusinesses.length;
				setUserCenter({ lat: avgLat, lng: avgLng });
			}
			return;
		}

		// Fallback to geolocation
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setUserCenter({
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					});
				},
				(error) => {
					console.error("Error getting user position:", error);
					setUserCenter(defaultCenter);
				},
				{ timeout: 5000 }
			);
		} else {
			setUserCenter(defaultCenter);
		}
	}, [givenCenter, processedBusinesses]);

	// Generate custom marker icons for processed businesses
	useEffect(() => {
		const generateMarkerIcons = async () => {
			const icons: { [key: string]: string } = {};
			
			for (const business of processedBusinesses) {
				const isSelected = selectedBusiness?._id === business._id;
				const icon = await createCustomMarkerIcon(
					business.logo,
					business.businessName,
					isSelected ? 70 : 60,
					isSelected,
					theme.palette.mode
				);
				icons[business._id] = icon;
			}
			
			setMarkerIcons(icons);
		};

		if (processedBusinesses.length > 0) {
			generateMarkerIcons();
		}
	}, [processedBusinesses, selectedBusiness, theme.palette.mode]);

	const handleMarkerClick = useCallback(
		(clickedBusiness: ProcessedBusiness) => {
			setSelectedBusiness(clickedBusiness);
			if (onBusinessClick) {
				onBusinessClick(clickedBusiness);
			}
		},
		[onBusinessClick],
	);

	const handleInfoWindowClose = useCallback(() => {
		setSelectedBusiness(null);
	}, []);

	// Calculate zoom based on number of businesses and their spread
	const calculateZoom = useCallback(() => {
		if (processedBusinesses.length <= 1) return 13;
		if (processedBusinesses.length <= 3) return 11;
		if (processedBusinesses.length <= 10) return 9;
		return 7;
	}, [processedBusinesses.length]);

	// Fit map to show all markers after map is loaded
	useEffect(() => {
		if (mapRef.current && processedBusinesses.length > 1 && isMapReady) {
			const bounds = new window.google.maps.LatLngBounds();
			processedBusinesses.forEach(business => {
				bounds.extend(business.position);
			});
			
			// Add some padding and fit bounds
			mapRef.current.fitBounds(bounds, {
				top: 50,
				right: 50,
				bottom: 50,
				left: 50
			});
		}
	}, [processedBusinesses, isMapReady]);

	const handleMapLoad = useCallback((map: google.maps.Map) => {
		mapRef.current = map;
		setIsMapReady(true);
		
		// Trigger resize to ensure proper rendering
		setTimeout(() => {
			if (window.google && window.google.maps) {
				window.google.maps.event.trigger(map, 'resize');
			}
		}, 100);
	}, []);

	if (isLoading) {
		return (
			<Box 
				sx={{ 
					height: "400px", 
					width: "100%", 
					display: "flex", 
					alignItems: "center", 
					justifyContent: "center",
					backgroundColor: "#f5f5f5"
				}}
			>
				<Box sx={{ textAlign: "center" }}>
					<CircularProgress size={40} />
					<Typography variant="body2" sx={{ mt: 2 }}>
						Loading businesses...
					</Typography>
				</Box>
			</Box>
		);
	}

	const center = userCenter || defaultCenter;

	return (
		<div style={{ height: "100%", width: "100%" }}>
			<GoogleMap
				mapContainerStyle={containerStyle}
				center={center}
				zoom={calculateZoom()}
				options={{
					disableDefaultUI: false,
					gestureHandling: "greedy",
					styles: theme.palette.mode === "dark" ? darkModeStyle : lightModeStyle,
					mapTypeControl: true,
					streetViewControl: true,
					fullscreenControl: true,
				}}
				onLoad={handleMapLoad}
				onBoundsChanged={() => {
					if (mapRef.current) {
						const bounds = mapRef.current.getBounds();
						if (bounds) {
							// console.log("Map bounds changed:", bounds.toJSON());
						}
					}
				}}
			>
				{processedBusinesses.map((businessItem, index) => {

					// console.log(`Rendering marker ${index + 1}:`, {
					// 	id: businessItem._id,
					// 	name: businessItem.businessName,
					// 	position: businessItem.position
					// });
					
					const isSelected = selectedBusiness?._id === businessItem._id;
					const markerIcon = markerIcons[businessItem._id];
					
					return (
						<Marker
							key={`${businessItem._id}-${index}`}
							position={businessItem.position}
							onClick={() => handleMarkerClick(businessItem)}
							title={businessItem.businessName}
							icon={markerIcon ? {
								url: markerIcon,
								scaledSize: new window.google.maps.Size(isSelected ? 70 : 60, isSelected ? 84 : 72),
								origin: new window.google.maps.Point(0, 0),
								anchor: new window.google.maps.Point(isSelected ? 35 : 30, isSelected ? 84 : 72),
							} : {
								url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
								scaledSize: new window.google.maps.Size(32, 32),
								origin: new window.google.maps.Point(0, 0),
								anchor: new window.google.maps.Point(16, 32),
							}}
							zIndex={isSelected ? 1000 : 1}
						/>
					);
				})}

				{selectedBusiness && (
					<CustomInfoWindow
						business={selectedBusiness}
						position={selectedBusiness.position}
						onClose={handleInfoWindowClose}
						onBusinessClick={onBusinessClick}
					/>
				)}
			</GoogleMap>
			
			{/* Debug info - remove in production */}
			{/* <div style={{ 
				position: "absolute", 
				top: "10px", 
				right: "10px", 
				background: "rgba(255,255,255,0.9)", 
				padding: "10px", 
				borderRadius: "5px",
				fontSize: "12px",
				zIndex: 1000 
			}}>
				<strong>Debug Info:</strong><br/>
				Businesses: {processedBusinesses.length}<br/>
				Icons Generated: {Object.keys(markerIcons).length}<br/>
				Center: {center.lat.toFixed(4)}, {center.lng.toFixed(4)}<br/>
				Map Ready: {isMapReady ? "Yes" : "No"}<br/>
				Type: {type}
			</div> */}
		</div>
	);
};

export default BusinessesMap;