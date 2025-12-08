export const mapStyles = {
	light: [
		{
			elementType: "geometry",
			stylers: [{ color: "#ffffff" }],
		},
		{
			elementType: "labels.text.fill",
			stylers: [{ color: "#616161" }],
		},
		{
			elementType: "labels.text.stroke",
			stylers: [{ color: "#f5f5f5" }],
		},
		{
			featureType: "road",
			elementType: "geometry",
			stylers: [{ color: "#f5f5f5" }],
		},
		{
			featureType: "road.arterial",
			elementType: "geometry",
			stylers: [{ color: "#ffffff" }],
		},
		{
			featureType: "water",
			elementType: "geometry",
			stylers: [{ color: "#c9c9c9" }],
		},
		{
			featureType: "water",
			elementType: "labels.text.fill",
			stylers: [{ color: "#9e9e9e" }],
		},
	],
	dark: [
		{
			elementType: "geometry",
			stylers: [{ color: "#212121" }],
		},
		{
			elementType: "labels.text.fill",
			stylers: [{ color: "#757575" }],
		},
		{
			elementType: "labels.text.stroke",
			stylers: [{ color: "#212121" }],
		},
		{
			featureType: "road",
			elementType: "geometry",
			stylers: [{ color: "#424242" }],
		},
		{
			featureType: "road.arterial",
			elementType: "geometry",
			stylers: [{ color: "#373737" }],
		},
		{
			featureType: "water",
			elementType: "geometry",
			stylers: [{ color: "#000000" }],
		},
		{
			featureType: "water",
			elementType: "labels.text.fill",
			stylers: [{ color: "#3d3d3d" }],
		},
	],
};