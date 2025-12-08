/* eslint-disable @typescript-eslint/no-explicit-any */
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";
import ButtonBase from "@mui/material/ButtonBase";
import { Iconify } from "@/components/iconify";

// ----------------------------------------------------------------------

interface BaseOptionsProps {
	icons?: string[];
	onChange?: (value: string) => void;
	options?: any[];
	value?: string;
}

const BaseOptions = ({ icons, options, value, onChange }: BaseOptionsProps) => {
	return (
		<Stack direction="row" spacing={2}>
			{options?.map((option, index) => {
				const selected = value === option;

				return (
					<ButtonBase
						key={option}
						onClick={() => onChange && onChange(option)}
						sx={{
							width: 1,
							height: 80,
							borderRadius: 1,
							border: (theme) =>
								`solid 1px ${alpha(theme.palette.grey[500], 0.08)}`,
							...(selected && {
								bgcolor: "background.paper",
								boxShadow: (theme) =>
									`-24px 8px 24px -4px ${alpha(
										theme.palette.mode === "light"
											? theme.palette.grey[500]
											: theme.palette.common.black,
										0.08
									)}`,
							}),
							"& .svg-color": {
								background: (theme) =>
									`linear-gradient(135deg, ${theme.palette.grey[500]} 0%, ${theme.palette.grey[600]} 100%)`,
								...(selected && {
									background: (theme) =>
										`linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
								}),
							},
						}}
					>
						<Iconify
							icon={index === 0 && icons?.length ? icons[0] : icons?.[1]}
						/>
					</ButtonBase>
				);
			})}
		</Stack>
	);
};

export default BaseOptions;
