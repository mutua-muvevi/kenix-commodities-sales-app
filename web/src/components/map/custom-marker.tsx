/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTheme } from "@mui/material";
import React, { useEffect, useRef } from "react";

interface CustomMarkerProps {
	businessImage?: string;
	businessName: string;
	size?: number;
	isSelected?: boolean;
}

const CustomMarker: React.FC<CustomMarkerProps> = ({
	businessImage,
	businessName,
	size = 60,
	isSelected = false,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const theme = useTheme();

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Set canvas size
		canvas.width = size;
		canvas.height = size * 1.2; // Taller for pin shape

		// Clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		const drawPin = () => {
			const centerX = canvas.width / 2;
			const centerY = canvas.height * 0.35;
			const radius = (size * 0.35);

			// Create gradient for pin using MUI theme colors
			const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
			if (theme.palette.mode === "dark") {
				// Use theme colors for dark mode
				gradient.addColorStop(0, isSelected ? theme.palette.primary.light : theme.palette.primary.main);
				gradient.addColorStop(
					1,
					isSelected
						? theme.palette.primary.dark ?? "#0270dd"
						: theme.palette.primary.darker ?? "#0263c4"
				);
			} else {
				// Use theme colors for light mode
				gradient.addColorStop(0, isSelected ? (theme.palette.primary.lighter ?? "#3596f7") : (theme.palette.primary.light ?? "#1b89f6"));
				gradient.addColorStop(1, isSelected ? (theme.palette.primary.main ?? "#027cf5") : (theme.palette.primary.dark ?? "#0270dd"));
			}

			// Draw pin shadow
			ctx.save();
			ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
			ctx.beginPath();
			ctx.arc(centerX + 2, centerY + 2, radius, 0, 2 * Math.PI);
			ctx.fill();

			// Draw pin tail shadow
			ctx.beginPath();
			ctx.moveTo(centerX + 2, centerY + radius + 2);
			ctx.lineTo(centerX + 2, canvas.height - 5);
			ctx.lineTo(centerX + radius * 0.5 + 2, centerY + radius * 0.3 + 2);
			ctx.closePath();
			ctx.fill();
			ctx.restore();

			// Draw main pin body
			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
			ctx.fill();

			// Draw pin tail
			ctx.beginPath();
			ctx.moveTo(centerX, centerY + radius);
			ctx.lineTo(centerX, canvas.height - 8);
			ctx.lineTo(centerX + radius * 0.5, centerY + radius * 0.3);
			ctx.closePath();
			ctx.fill();

			// Draw pin border using theme colors
			ctx.strokeStyle = theme.palette.mode === "dark" ? theme.palette.grey[700] : theme.palette.common.white;
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
			ctx.stroke();

			// Draw inner circle for image
			const innerRadius = radius * 0.75;
			ctx.save();
			ctx.beginPath();
			ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
			ctx.clip();

			if (businessImage) {
				// Load and draw business image
				const img = new Image();
				img.crossOrigin = "anonymous";
				img.onload = () => {
					// Draw background using theme colors
					ctx.fillStyle = theme.palette.background.paper;
					ctx.fillRect(
						centerX - innerRadius,
						centerY - innerRadius,
						innerRadius * 2,
						innerRadius * 2
					);

					// Draw image
					ctx.drawImage(
						img,
						centerX - innerRadius,
						centerY - innerRadius,
						innerRadius * 2,
						innerRadius * 2
					);

					// Add subtle inner shadow
					const innerGradient = ctx.createRadialGradient(
						centerX, centerY, 0,
						centerX, centerY, innerRadius
					);
					innerGradient.addColorStop(0.7, "rgba(0,0,0,0)");
					innerGradient.addColorStop(1, "rgba(0,0,0,0.2)");
					ctx.fillStyle = innerGradient;
					ctx.fillRect(
						centerX - innerRadius,
						centerY - innerRadius,
						innerRadius * 2,
						innerRadius * 2
					);
				};
				img.onerror = () => {
					// Fallback: draw business initial
					drawFallbackContent();
				};
				img.src = businessImage;
			} else {
				drawFallbackContent();
			}

			function drawFallbackContent() {
				if (!ctx) return;
				// Draw background using theme colors
				const bgGradient = ctx.createLinearGradient(
					centerX - innerRadius,
					centerY - innerRadius,
					centerX + innerRadius,
					centerY + innerRadius
				);
				
				if (theme.palette.mode === "dark") {
					bgGradient.addColorStop(0, theme.palette.grey[800]);
					bgGradient.addColorStop(1, theme.palette.grey[900]);
				} else {
					bgGradient.addColorStop(0, theme.palette.grey[100]);
					bgGradient.addColorStop(1, theme.palette.grey[200]);
				}
				
				ctx.fillStyle = bgGradient;
				ctx.fillRect(
					centerX - innerRadius,
					centerY - innerRadius,
					innerRadius * 2,
					innerRadius * 2
				);

				// Draw business initial using theme text colors
				const initial = businessName.charAt(0).toUpperCase();
				ctx.fillStyle = theme.palette.text.primary;
				ctx.font = `bold ${innerRadius * 0.8}px system-ui, -apple-system, sans-serif`;
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(initial, centerX, centerY);
			}

			ctx.restore();

			// Add selection ring if selected using theme colors
			if (isSelected) {
				ctx.strokeStyle = theme.palette.warning.main;
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
				ctx.stroke();

				// Add pulse effect
				ctx.strokeStyle = theme.palette.warning.light + "80"; // Add transparency
				ctx.lineWidth = 6;
				ctx.beginPath();
				ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
				ctx.stroke();
			}
		};

		drawPin();
	}, [businessImage, businessName, size, isSelected, theme]);

	return (
		<canvas
			ref={canvasRef}
			style={{
				filter: isSelected ? "drop-shadow(0 8px 16px rgba(0,0,0,0.3))" : "drop-shadow(0 4px 8px rgba(0,0,0,0.2))",
				transition: "all 0.3s ease",
				transform: isSelected ? "scale(1.1)" : "scale(1)",
			}}
		/>
	);
};

// Function to create marker icon from canvas using MUI theme
export const createCustomMarkerIcon = (
	businessImage?: string,
	businessName: string = "B",
	size: number = 60,
	isSelected: boolean = false,
	themeMode: "light" | "dark" = "light",
	themePalette?: any // Pass the theme palette object
): Promise<string> => {
	return new Promise((resolve) => {
		// Create a temporary canvas
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		if (!ctx) {
			resolve("https://maps.google.com/mapfiles/ms/icons/red-dot.png");
			return;
		}

		canvas.width = size;
		canvas.height = size * 1.2;

		const centerX = canvas.width / 2;
		const centerY = canvas.height * 0.35;
		const radius = size * 0.35;

		// Create gradient for pin using theme colors
		const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
		
		// Default colors if no theme palette is provided
		const defaultPalette = {
			primary: {
				lighter: "#3596f7",
				light: "#1b89f6",
				main: "#027cf5",
				dark: "#0270dd",
				darker: "#0263c4"
			},
			grey: {
				100: "#F9FAFB",
				200: "#F4F6F8",
				700: "#454F5B",
				800: "#212B36",
				900: "#161C24"
			},
			common: { white: "#FFFFFF" },
			warning: { main: "#FFAB00", light: "#FFD666" },
			text: { primary: themeMode === "dark" ? "#FFFFFF" : "#212B36" },
			background: { paper: themeMode === "dark" ? "#181a1b" : "#F4F6F8" }
		};

		const palette = themePalette || defaultPalette;

		if (themeMode === "dark") {
			gradient.addColorStop(0, isSelected ? palette.primary.light : palette.primary.main);
			gradient.addColorStop(1, isSelected ? palette.primary.dark : palette.primary.darker);
		} else {
			gradient.addColorStop(0, isSelected ? palette.primary.lighter : palette.primary.light);
			gradient.addColorStop(1, isSelected ? palette.primary.main : palette.primary.dark);
		}

		// Draw pin shadow
		ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
		ctx.beginPath();
		ctx.arc(centerX + 2, centerY + 2, radius, 0, 2 * Math.PI);
		ctx.fill();

		// Draw pin tail shadow
		ctx.beginPath();
		ctx.moveTo(centerX + 2, centerY + radius + 2);
		ctx.lineTo(centerX + 2, canvas.height - 5);
		ctx.lineTo(centerX + radius * 0.5 + 2, centerY + radius * 0.3 + 2);
		ctx.closePath();
		ctx.fill();

		// Draw main pin body
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
		ctx.fill();

		// Draw pin tail
		ctx.beginPath();
		ctx.moveTo(centerX, centerY + radius);
		ctx.lineTo(centerX, canvas.height - 8);
		ctx.lineTo(centerX + radius * 0.5, centerY + radius * 0.3);
		ctx.closePath();
		ctx.fill();

		// Draw pin border using theme colors
		ctx.strokeStyle = themeMode === "dark" ? palette.grey[700] : palette.common.white;
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
		ctx.stroke();

		// Draw inner circle for image
		const innerRadius = radius * 0.75;
		ctx.save();
		ctx.beginPath();
		ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
		ctx.clip();

		const finishDrawing = () => {
			ctx.restore();

			// Add selection ring if selected using theme colors
			if (isSelected) {
				ctx.strokeStyle = palette.warning.main;
				ctx.lineWidth = 3;
				ctx.beginPath();
				ctx.arc(centerX, centerY, radius + 4, 0, 2 * Math.PI);
				ctx.stroke();

				// Add pulse effect
				ctx.strokeStyle = palette.warning.light + "80"; // Add transparency
				ctx.lineWidth = 6;
				ctx.beginPath();
				ctx.arc(centerX, centerY, radius + 8, 0, 2 * Math.PI);
				ctx.stroke();
			}

			// Convert to data URL
			resolve(canvas.toDataURL());
		};

		if (businessImage) {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = () => {
				// Draw background using theme colors
				ctx.fillStyle = palette.background.paper;
				ctx.fillRect(
					centerX - innerRadius,
					centerY - innerRadius,
					innerRadius * 2,
					innerRadius * 2
				);

				// Draw image
				ctx.drawImage(
					img,
					centerX - innerRadius,
					centerY - innerRadius,
					innerRadius * 2,
					innerRadius * 2
				);

				finishDrawing();
			};
			img.onerror = () => {
				drawFallback();
				finishDrawing();
			};
			img.src = businessImage;
		} else {
			drawFallback();
			finishDrawing();
		}

		function drawFallback() {
			if (!ctx) return;
			// Draw background gradient using theme colors
			const bgGradient = ctx.createLinearGradient(
				centerX - innerRadius,
				centerY - innerRadius,
				centerX + innerRadius,
				centerY + innerRadius
			);
			
			if (themeMode === "dark") {
				bgGradient.addColorStop(0, palette.grey[800]);
				bgGradient.addColorStop(1, palette.grey[900]);
			} else {
				bgGradient.addColorStop(0, palette.grey[100]);
				bgGradient.addColorStop(1, palette.grey[200]);
			}
			
			ctx.fillStyle = bgGradient;
			ctx.fillRect(
				centerX - innerRadius,
				centerY - innerRadius,
				innerRadius * 2,
				innerRadius * 2
			);

			// Draw business initial using theme text colors
			const initial = businessName.charAt(0).toUpperCase();
			ctx.fillStyle = palette.text.primary;
			ctx.font = `bold ${innerRadius * 0.8}px system-ui, -apple-system, sans-serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(initial, centerX, centerY);
		}
	});
};

export default CustomMarker;