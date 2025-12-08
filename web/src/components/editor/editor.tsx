import "@/utils/highlight";

import dynamic from "next/dynamic";

import { alpha } from "@mui/material/styles";
import Skeleton from "@mui/material/Skeleton";

import { StyledEditor } from "./styles";
import Toolbar, { formats } from "./toolbar";
import { ThemeTypes } from "@/theme/types";

const ReactQuill = dynamic(() => import("react-quill"), {
	ssr: false,
	loading: () => (
		<Skeleton
			sx={{
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				height: 1,
				borderRadius: 1,
				position: "absolute",
			}}
		/>
	),
});

// ----------------------------------------------------------------------

interface EditorProps {
	error?: boolean;
	helperText?: object;
	id?: string;
	simple?: boolean;
	sx?: object;
}

const Editor = ({ id = "minimal-quill", error, simple = false,  sx, ...other }: EditorProps) => {
	const modules = {
		toolbar: {
			container: `#${id}`,
		},
		history: {
			delay: 500,
			maxStack: 100,
			userOnly: true,
		},
		syntax: true,
		clipboard: {
			matchVisual: false,
		},
	};

	return (
		<div>
			<StyledEditor
				sx={{
					...(error && {
						border: (theme: ThemeTypes) => `solid 1px ${theme.palette.error.main}`,
						"& .ql-editor": {
							bgcolor: (theme: ThemeTypes) => alpha(theme.palette.error.main, 0.08),
						},
					}),
					...sx,
				}}
			>
				<Toolbar id={id} simple={simple} />

				<ReactQuill modules={modules} formats={formats} placeholder="Write something awesome..." {...other} />
			</StyledEditor>

			{/* {helperText && helperText} */}
		</div>
	);
};

export default Editor;
