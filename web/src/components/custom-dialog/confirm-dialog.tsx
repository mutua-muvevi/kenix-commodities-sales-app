import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

// ----------------------------------------------------------------------

interface CustomDialogProps {
	action: React.ReactNode;
	content: React.ReactNode;
	onClose: VoidFunction;
	open: boolean;
	title: string;
}

const ConfirmDialog = ({
	title,
	content,
	action,
	open,
	onClose,
	...other
}: CustomDialogProps) => {
	return (
		<Dialog fullWidth maxWidth="xs" open={open} onClose={onClose} {...other}>
			<DialogTitle sx={{ pb: 2 }}>{title}</DialogTitle>

			{content && (
				<DialogContent sx={{ typography: "body2" }}> {content} </DialogContent>
			)}

			<DialogActions>
				{action}

				<Button variant="outlined" color="inherit" onClick={onClose}>
					Cancel
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ConfirmDialog;
