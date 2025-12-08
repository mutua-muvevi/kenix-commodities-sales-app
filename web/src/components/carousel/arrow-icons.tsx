import Iconify from "../iconify";

// ----------------------------------------------------------------------

interface IconProps {
	icon?: string;
	isRTL?: boolean;
}

export const LeftIcon = ({ icon = "eva:arrow-ios-forward-fill", isRTL }: IconProps) => {
	return (
		<Iconify
			icon={icon}
			sx={{
				transform: " scaleX(-1)",
				...(isRTL && {
					transform: " scaleX(1)",
				}),
			}}
		/>
	);
};

export const RightIcon = ({ icon = "eva:arrow-ios-forward-fill", isRTL }: IconProps) => {
	return (
		<Iconify
			icon={icon}
			sx={{
				...(isRTL && {
					transform: " scaleX(-1)",
				}),
			}}
		/>
	);
};
