/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Box, Typography, Alert } from "@mui/material";

const MapDiagnostic = () => {
	const [diagnostics, setDiagnostics] = useState({
		apiKey: "",
		apiKeyValid: false,
		networkTest: "pending",
		jsApiLoaded: false,
		renderingTest: "pending",
	});

	useEffect(() => {
		const runDiagnostics = async () => {
			const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

			// Test 1: API Key exists
			setDiagnostics((prev) => ({
				...prev,
				apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : "NOT FOUND",
				apiKeyValid: apiKey.length > 20,
			}));

			// Test 2: Network connectivity to Geocoding API
			try {
				const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=test&key=${apiKey}`);
				setDiagnostics((prev) => ({
					...prev,
					networkTest: response.ok ? "success" : "failed",
				}));
			} catch (error) {
				setDiagnostics((prev) => ({
					...prev,
					networkTest: "failed",
				}));
			}

			// Test 3: Check if Google Maps API is loaded
			const checkGoogleMaps = () => {
				const isLoaded = typeof window.google !== "undefined" && !!window.google.maps;
				setDiagnostics((prev) => ({
					...prev,
					jsApiLoaded: isLoaded,
					renderingTest: isLoaded ? prev.renderingTest : "failed",
				}));
			};

			// Test 4: Check map rendering
			const checkRendering = () => {
				const mapDiv = document.createElement("div");
				mapDiv.style.width = "100px";
				mapDiv.style.height = "100px";
				document.body.appendChild(mapDiv);
				try {
					const map = new google.maps.Map(mapDiv, {
						center: { lat: 0, lng: 0 },
						zoom: 1,
					});
					setDiagnostics((prev) => ({
						...prev,
						renderingTest: map.getDiv() ? "success" : "failed",
					}));
					document.body.removeChild(mapDiv);
				} catch {
					setDiagnostics((prev) => ({
						...prev,
						renderingTest: "failed",
					}));
				}
			};

			checkGoogleMaps();
			if (typeof window.google !== "undefined" && window.google.maps) {
				checkRendering();
			}
			const timer = setInterval(checkGoogleMaps, 1000);
			return () => clearInterval(timer);
		};

		runDiagnostics();
	}, []);

	return (
		<Box sx={{ p: 3 }}>
			<Typography variant="h5" gutterBottom>
				Google Maps Diagnostic
			</Typography>

			<Alert severity={diagnostics.apiKeyValid ? "success" : "error"} sx={{ mb: 2 }}>
				<Typography variant="subtitle2">API Key Status</Typography>
				<Typography variant="body2">
					Key: {diagnostics.apiKey}
					<br />
					Valid: {diagnostics.apiKeyValid ? "Yes" : "No"}
				</Typography>
			</Alert>

			<Alert
				severity={
					diagnostics.networkTest === "success"
						? "success"
						: diagnostics.networkTest === "failed"
						? "error"
						: "info"
				}
				sx={{ mb: 2 }}
			>
				<Typography variant="subtitle2">Network Test</Typography>
				<Typography variant="body2">Google Maps API Connection: {diagnostics.networkTest}</Typography>
			</Alert>

			<Alert severity={diagnostics.jsApiLoaded ? "success" : "warning"} sx={{ mb: 2 }}>
				<Typography variant="subtitle2">JavaScript API</Typography>
				<Typography variant="body2">Google Maps JS API Loaded: {diagnostics.jsApiLoaded ? "Yes" : "No"}</Typography>
			</Alert>

			<Alert
				severity={
					diagnostics.renderingTest === "success"
						? "success"
						: diagnostics.renderingTest === "failed"
						? "error"
						: "info"
				}
				sx={{ mb: 2 }}
			>
				<Typography variant="subtitle2">Map Rendering</Typography>
				<Typography variant="body2">Map Rendering Test: {diagnostics.renderingTest}</Typography>
			</Alert>

			<Box sx={{ mt: 3, p: 2, borderRadius: 1 }}>
				<Typography variant="subtitle2" gutterBottom>
					Debug Info:
				</Typography>
				<Typography variant="body2" component="pre" sx={{ fontSize: "0.8rem" }}>
					{JSON.stringify(diagnostics, null, 2)}
				</Typography>
			</Box>
		</Box>
	);
};

export default MapDiagnostic;
