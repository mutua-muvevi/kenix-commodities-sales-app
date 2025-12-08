"use client";

import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Drawer, { drawerClasses } from "@mui/material/Drawer";

import { Iconify } from "../../iconify";
import Scrollbar from "../../scrollbar";
import BaseOptions from "./base-option";
import PresetsOptions from "./preset-options";
import { useSettingsContext } from "../context";
import { useTranslate } from "@/locales";

const SettingsDrawer = () => {
	const settings = useSettingsContext();
	const { t } = useTranslate();

	const labelStyles = {
		mb: 1.5,
		color: "text.disabled",
		fontWeight: "fontWeightSemiBold",
	};

	const renderHead = (
		<Stack
			direction="row"
			alignItems="center"
			justifyContent="space-between"
			sx={{ py: 2, pr: 1, pl: 2.5 }}
		>
			<Typography variant="h6" sx={{ flexGrow: 1 }}>
				{t("navigation.top.settings.settings")}
			</Typography>

			<Tooltip title="Reset">
				<IconButton onClick={settings.onReset}>
					<Badge color="error" variant="dot" invisible={!settings.canReset}>
						<Iconify icon="solar:restart-bold" />
					</Badge>
				</IconButton>
			</Tooltip>

			<IconButton onClick={settings.onClose}>
				<Iconify icon="mingcute:close-line" />
			</IconButton>
		</Stack>
	);

	const renderMode = (
		<div>
			<Typography variant="caption" component="div" sx={{ ...labelStyles }}>
				{t("navigation.top.settings.mode")}
			</Typography>

			<BaseOptions
				value={settings.themeMode}
				onChange={(newValue) => settings.onUpdate("themeMode", newValue)}
				options={["light", "dark"]}
				icons={["ph:sun-fill", "bi:moon-stars-fill"]}
			/>
		</div>
	);

	const renderPresets = (
		<div>
			<Typography variant="caption" component="div" sx={{ ...labelStyles }}>
				{t("navigation.top.settings.presets")}
			</Typography>

			<PresetsOptions
				value={settings.themeColorPresets}
				onChange={(newValue) =>
					settings.onUpdate("themeColorPresets", newValue)
				}
			/>
		</div>
	);

	return (
		<Drawer
			anchor="right"
			open={settings.open}
			onClose={settings.onClose}
			slotProps={{
				backdrop: { invisible: true },
			}}
			sx={{
				[`& .${drawerClasses.paper}`]: {
					width: 280,
				},
			}}
		>
			{renderHead}

			<Divider sx={{ borderStyle: "dashed" }} />

			<Scrollbar>
				<Stack spacing={3} sx={{ p: 3 }}>
					{renderMode}

					{/* {renderContrast} */}

					{/* {renderDirection} */}

					{/* {renderLayout} */}

					{renderPresets}
				</Stack>
			</Scrollbar>

			{/* <FullScreenOption /> */}
		</Drawer>
	);
};

export default SettingsDrawer;
