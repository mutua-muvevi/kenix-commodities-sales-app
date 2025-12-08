/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { useFormContext } from "react-hook-form";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { debounce } from "lodash";
import { mapStyles } from "./style";
import { Alert, Snackbar, Box, Typography, Stack } from "@mui/material";
import { Iconify } from "@/components/iconify";

interface FormMapProps {
	name: string;
	defaultValue?: [number, number] | null;
	height?: string;
	showCoordinates?: boolean;
	disabled?: boolean;
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const defaultCenter = {
	lat: -1.437041393899676,
	lng: 37.191635586788259,
};

const FormMap: React.FC<FormMapProps> = ({
	name,
	defaultValue,
	height = "400px",
	showCoordinates = true,
	disabled = false,
}) => {
	const { setValue, watch, getValues } = useFormContext();
	const theme = useTheme();
	const formLocation = watch("location");

	const mapRef = useRef<google.maps.Map | null>(null);
	const [isMapLoaded, setIsMapLoaded] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<{
		lat: number;
		lng: number;
	}>(
		defaultValue &&
			defaultValue.length === 2 &&
			defaultValue[0] !== 0 &&
			defaultValue[1] !== 0
			? { lat: defaultValue[0], lng: defaultValue[1] }
			: defaultCenter
	);
	const [zoom, setZoom] = useState<number>(10);
	const [isGeocodingFromForm, setIsGeocodingFromForm] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isUpdatingCoordinates, setIsUpdatingCoordinates] = useState(false);

	const containerStyle = {
		width: "100%",
		height: height,
		position: "relative" as const,
		zIndex: 1,
		borderRadius: "8px",
		overflow: "hidden",
	};

	// Initialize coordinates from existing form values
	useEffect(() => {
		const currentCoordinates = getValues(name);
		if (
			currentCoordinates &&
			currentCoordinates.length === 2 &&
			currentCoordinates[0] !== 0 &&
			currentCoordinates[1] !== 0
		) {
			setSelectedLocation({
				lat: currentCoordinates[0],
				lng: currentCoordinates[1],
			});
			setZoom(15);
		}
	}, [name, getValues]);

	// Check if Google Maps API is loaded
	useEffect(() => {
		const checkGoogleMaps = () => {
			if (typeof window.google !== "undefined" && window.google.maps) {
				setIsMapLoaded(true);
			} else {
				setError(
					"Google Maps API failed to load. Please refresh or check your connection."
				);
			}
		};
		checkGoogleMaps();
		const timer = setInterval(checkGoogleMaps, 1000);
		return () => clearInterval(timer);
	}, []);

	// Trigger map resize to force repaint
	useEffect(() => {
		if (mapRef.current && isMapLoaded) {
			google.maps.event.trigger(mapRef.current, "resize");
			mapRef.current.setCenter(selectedLocation);
		}
	}, [selectedLocation, zoom, isMapLoaded]);

	// Enhanced reverse geocoding with better street number handling
	const reverseGeocode = useCallback(
		debounce(async (lat: number, lng: number) => {
			if (!GOOGLE_MAPS_API_KEY) {
				setError("Google Maps API key is missing. Please contact support.");
				return;
			}

			try {
				// console.log("🗺️ Reverse geocoding:", { lat, lng });

				const response = await axios.get(
					`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&result_type=street_address|premise|subpremise|route`
				);

				const results = response.data.results;
				// console.log("📍 Geocoding results:", results);

				if (results && results.length > 0 && !isGeocodingFromForm) {
					// Find the most specific result (street address first)
					const streetAddressResult =
						results.find(
							(result: any) =>
								result.types.includes("street_address") ||
								result.types.includes("premise")
						) || results[0];

					const addressComponents = streetAddressResult.address_components;

					// Enhanced component extraction
					const getComponent = (types: string[], useShortName = false) => {
						const component = addressComponents.find((comp: any) =>
							types.some((type: string) => comp.types.includes(type))
						);
						return component
							? useShortName
								? component.short_name
								: component.long_name
							: "";
					};

					// Extract street number and route separately, then combine
					const streetNumber = getComponent(["street_number"]);
					const route = getComponent(["route"]);
					const subpremise = getComponent(["subpremise"]); // Unit/apt number
					const premise = getComponent(["premise"]); // Building name

					// Build complete street address
					let streetAddress = "";
					if (streetNumber && route) {
						streetAddress = `${streetNumber} ${route}`;
					} else if (route) {
						streetAddress = route;
					} else if (premise) {
						streetAddress = premise;
					}

					// If we have subpremise (unit/apt), add it
					if (subpremise && streetAddress) {
						streetAddress = `${streetAddress}, Unit ${subpremise}`;
					}

					// Update form fields
					setValue("location.street", streetAddress || "");
					setValue(
						"location.city",
						getComponent(["locality"]) ||
							getComponent(["sublocality"]) ||
							getComponent(["administrative_area_level_2"]) ||
							""
					);
					setValue(
						"location.state",
						getComponent(["administrative_area_level_1"]) || ""
					);
					setValue("location.country", getComponent(["country"]) || "");
					setValue("location.zipCode", getComponent(["postal_code"]) || "");

					// Update building name if we have premise but it's different from street
					if (premise && premise !== streetAddress) {
						setValue("location.buildingName", premise);
					}

					// console.log("✅ Address extracted:", {
					// 	streetNumber,
					// 	route,
					// 	subpremise,
					// 	premise,
					// 	fullStreet: streetAddress,
					// 	city: getComponent(["locality"]),
					// 	state: getComponent(["administrative_area_level_1"]),
					// 	country: getComponent(["country"]),
					// 	zipCode: getComponent(["postal_code"]),
					// });
				} else if (results.length === 0) {
					setError(
						"No address found for this location. Try a different spot on the map."
					);
				} else {
					setError(
						"Unable to retrieve detailed address. Try clicking closer to a building or street."
					);
				}
			} catch (error) {
				console.error("Reverse geocoding error:", error);
				setError("Failed to retrieve address details. Please try again.");
			}
		}, 800), // Increased debounce time for better accuracy
		[setValue, isGeocodingFromForm, GOOGLE_MAPS_API_KEY]
	);

	// Handle map click
	const handleMapClick = async (e: google.maps.MapMouseEvent) => {
		if (disabled) return;

		const lat = e.latLng?.lat();
		const lng = e.latLng?.lng();

		if (lat && lng) {
			// console.log("📍 Map clicked at:", { lat, lng });

			setSelectedLocation({ lat, lng });
			setZoom(18); // Higher zoom for better precision
			setIsUpdatingCoordinates(true);

			// Update coordinates immediately
			setValue(name, [lat, lng]);

			// Also update the individual coordinate fields if they exist
			setValue("location.coordinates[0]", lat);
			setValue("location.coordinates[1]", lng);

			// Perform reverse geocoding
			await reverseGeocode(lat, lng);
			setIsUpdatingCoordinates(false);
		}
	};

	// Enhanced forward geocoding based on form input
	const updateMapFromForm = useCallback(
		debounce(async () => {
			if (!isMapLoaded || !GOOGLE_MAPS_API_KEY || isUpdatingCoordinates) {
				return;
			}

			const { street, city, state, country, zipCode, coordinates } =
				formLocation || {};

			// Use coordinates if manually entered and valid
			if (
				coordinates &&
				coordinates.length === 2 &&
				typeof coordinates[0] === "number" &&
				typeof coordinates[1] === "number" &&
				coordinates[0] !== 0 &&
				coordinates[1] !== 0
			) {
				setSelectedLocation({ lat: coordinates[0], lng: coordinates[1] });
				setZoom(15);
				return;
			}

			// Geocode address if coordinates are absent or zero
			const addressParts = [street, city, state, country, zipCode].filter(
				Boolean
			);
			if (addressParts.length === 0) return;

			const fullAddress = addressParts.join(", ");

			try {
				setIsGeocodingFromForm(true);
				// console.log("🔍 Forward geocoding:", fullAddress);

				const response = await axios.get(
					`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
						fullAddress
					)}&key=${GOOGLE_MAPS_API_KEY}`
				);

				const result = response.data.results[0];

				if (result) {
					const { lat, lng } = result.geometry.location;
					setSelectedLocation({ lat, lng });
					setValue(name, [lat, lng]);

					// Also update individual coordinate fields
					setValue("location.coordinates[0]", lat);
					setValue("location.coordinates[1]", lng);

					// Set appropriate zoom based on address specificity
					const zoomLevel = street
						? 18
						: city
						? 12
						: state
						? 8
						: country
						? 5
						: 10;
					setZoom(zoomLevel);

					// console.log("✅ Forward geocoding successful:", { lat, lng, zoom: zoomLevel });
				} else {
					setError(
						"No location found for the provided address. Please check the address details."
					);
				}
			} catch (error) {
				console.error("Forward geocoding error:", error);
				setError(
					"Failed to find location. Please check your address or try clicking on the map."
				);
			} finally {
				setTimeout(() => setIsGeocodingFromForm(false), 500);
			}
		}, 1000), // Longer delay for forward geocoding
		[
			formLocation,
			setValue,
			isMapLoaded,
			GOOGLE_MAPS_API_KEY,
			name,
			isUpdatingCoordinates,
		]
	);

	// Watch for form field changes
	useEffect(() => {
		const subscription = watch((value, { name: fieldName, type }) => {
			if (
				fieldName &&
				fieldName.startsWith("location.") &&
				!fieldName.includes("coordinates") && // Don't trigger on coordinate changes
				isMapLoaded &&
				type !== "change"
			) {
				// Only on blur/submit, not every keystroke
				updateMapFromForm();
			}
		});
		return () => subscription.unsubscribe();
	}, [watch, updateMapFromForm, isMapLoaded]);

	const handleCloseError = () => {
		setError(null);
	};

	// Format coordinates for display
	const formatCoordinate = (coord: number) => {
		return coord ? coord.toFixed(6) : "0.000000";
	};

	return (
		<Box>
			{/* Coordinates Display */}
			{showCoordinates && (
				<Box
					sx={{ mb: 2, p: 2, bgcolor: "background.neutral", borderRadius: 1 }}
				>
					<Stack direction="row" alignItems="center" spacing={2}>
						<Iconify
							icon="eva:navigation-2-fill"
							sx={{ color: "primary.main" }}
						/>
						<Box>
							<Typography variant="body2" color="text.secondary">
								Current Coordinates
							</Typography>
							<Typography variant="body2" fontFamily="monospace">
								Lat: {formatCoordinate(selectedLocation.lat)}, Lng:{" "}
								{formatCoordinate(selectedLocation.lng)}
							</Typography>
						</Box>
						{isUpdatingCoordinates && (
							<Typography variant="caption" color="primary.main">
								Updating...
							</Typography>
						)}
					</Stack>
				</Box>
			)}

			{/* Map Container */}
			{isMapLoaded ? (
				<GoogleMap
					mapContainerStyle={containerStyle}
					center={selectedLocation}
					zoom={zoom}
					options={{
						disableDefaultUI: false,
						gestureHandling: disabled ? "none" : "greedy",
						styles:
							theme.palette.mode === "dark" ? mapStyles.dark : mapStyles.light,
						clickableIcons: true,
						mapTypeControl: true,
						streetViewControl: true,
						fullscreenControl: true,
					}}
					onClick={handleMapClick}
					onLoad={(map) => {
						mapRef.current = map;
						google.maps.event.trigger(map, "resize");
					}}
				>
					<Marker
						position={selectedLocation}
						title={`Lat: ${formatCoordinate(
							selectedLocation.lat
						)}, Lng: ${formatCoordinate(selectedLocation.lng)}`}
					/>
				</GoogleMap>
			) : (
				<Box
					sx={{
						...containerStyle,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						bgcolor: "background.neutral",
					}}
				>
					<Alert severity="info" sx={{ maxWidth: 400 }}>
						<Stack spacing={1} alignItems="center">
							<Iconify icon="eva:loader-outline" sx={{ fontSize: 24 }} />
							<Typography variant="body2">
								Loading map... If this persists, please refresh the page.
							</Typography>
						</Stack>
					</Alert>
				</Box>
			)}

			{/* Error Snackbar */}
			{error && (
				<Snackbar
					open={!!error}
					autoHideDuration={6000}
					onClose={handleCloseError}
					anchorOrigin={{ vertical: "top", horizontal: "center" }}
				>
					<Alert
						onClose={handleCloseError}
						severity="error"
						sx={{ width: "100%" }}
					>
						{error}
					</Alert>
				</Snackbar>
			)}

			{/* Help Text */}
			{!disabled && (
				<Typography
					variant="caption"
					color="text.secondary"
					sx={{ mt: 1, display: "block" }}
				>
					💡 Click on the map to set coordinates, or fill in the address fields
					below to automatically locate on map
				</Typography>
			)}
		</Box>
	);
};

export default FormMap;
