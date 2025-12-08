// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";

import FormHelperText from "@mui/material/FormHelperText";

import Editor from "../editor";

// ----------------------------------------------------------------------
interface RHFEditorProps {
	name: string;
	helperText?: string;
	[key: string]: any;
}

const RHFEditor = ({ name, helperText, ...other }: RHFEditorProps) => {
	const {
		control,
		watch,
		setValue,
		formState: { isSubmitSuccessful },
	} = useFormContext();

	const values = watch();

	useEffect(() => {
		if (values[name] === "<p><br></p>") {
			setValue(name, "", {
				shouldValidate: !isSubmitSuccessful,
			});
		}
	}, [isSubmitSuccessful, name, setValue, values]);

	return (
		<Controller
			name={name}
			control={control}
			render={({ field, fieldState: { error } }) => (
				<Editor
					id={name}
					value={field.value}
					onChange={field.onChange}
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
			)}
		/>
	);
};

export default RHFEditor;
