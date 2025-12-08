/* eslint-disable @typescript-eslint/no-explicit-any */

import { Controller, useFormContext } from "react-hook-form";

import FormHelperText from "@mui/material/FormHelperText";

import { Upload, UploadBox, UploadAvatar } from "../upload";

// ----------------------------------------------------------------------
interface RHFUploadAvatarProps {
	name: string;
	[key: string]: any;
}

export const RHFUploadAvatar = ({ name, ...other }: RHFUploadAvatarProps) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<div>
					<UploadAvatar error={!!error} file={field.value} {...other} />

					{!!error && (
						<FormHelperText error sx={{ px: 2, textAlign: "center" }}>
							{error.message}
						</FormHelperText>
					)}
				</div>
			)}
		/>
	);
};

// ----------------------------------------------------------------------
interface RHFUploadBoxProps {
	name: string;
	[key: string]: any;
}

export const RHFUploadBox = ({ name, ...other }: RHFUploadBoxProps) => {
	const { control } = useFormContext();

	return (
		<Controller name={name} control={control} render={({ field, fieldState: { error } }) => <UploadBox files={field.value} error={!!error} {...other} />} />
	);
};

// ----------------------------------------------------------------------
interface RHFUploadProps {
	helperText?: string;
	multiple?: boolean;
	name: string;
	[key: string]: any;
}

export const RHFUpload = ({ name, multiple, helperText, ...other }: RHFUploadProps) => {
	const { control } = useFormContext();

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) =>
				multiple ? (
					<Upload
						multiple
						accept={{ "image/*": [] }}
						files={field.value}
						error={!!error}
						helperText={
							(!!error || helperText) && (
								<FormHelperText error={!!error} sx={{ px: 2 }}>
									{error ? error?.message : helperText}
								</FormHelperText>
							)
						}
						{...other}
					/>
				) : (
					<Upload
						accept={{ "image/*": [] }}
						file={field.value}
						error={!!error}
						helperText={
							(!!error || helperText) && (
								<FormHelperText error={!!error} sx={{ px: 2 }}>
									{error ? error?.message : helperText}
								</FormHelperText>
							)
						}
						{...other}
					/>
				)
			}
		/>
	);
};
