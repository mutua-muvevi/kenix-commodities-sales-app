// src/components/calendar/fullcalendar.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Drawer, useMediaQuery } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import {
	format,
	parseISO,
	startOfWeek,
	endOfWeek,
	startOfMonth,
	endOfMonth,
	getISOWeek,
	getYear,
	getMonth,
	getDate,
	getHours,
} from "date-fns";
import { useScheduleList } from "@/store";
import { Schedule } from "@/store/slices/schedules/types";
import CreateSchedule from "./create-schedule";
import EditSchedule from "./edit-schedule";
import DeleteSchedule from "./delete-schedule";
import ScheduleDetailPanel from "./schedule-detail-panel";
import "./styles.css";
import { LoadingScreen } from "../loading-screen";

// Props for the reusable calendar
interface ByzXpoCalendarProps {
	allowDateClickCreation?: boolean;
	defaultView?: "month" | "week" | "day" | "hourly";
	showNotificationSettings?: boolean;
	userId?: string;
	businessId?: string;
}

const ByzXpoCalendar: React.FC<ByzXpoCalendarProps> = ({
	allowDateClickCreation = true,
	defaultView = "month",
	showNotificationSettings = true,
	userId,
	businessId,
}) => {
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down('md'));
	
	const {
		fetchAllSchedules,
		fetchWeeklySchedules,
		fetchDailySchedules,
		fetchHourlySchedules,
		fetchMonthlySchedules,
		allSchedules,
	} = useScheduleList();

	// Modal and drawer states
	const [openModal, setOpenModal] = useState<"create" | "edit" | "delete" | null>(null);
	const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
	const [selectedDate, setSelectedDate] = useState<Date | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [currentView, setCurrentView] = useState(defaultView);

	// Map view to FullCalendar view
	const calendarView = useMemo(() => {
		switch (currentView) {
			case "month":
				return "dayGridMonth";
			case "week":
				return "timeGridWeek";
			case "day":
				return "timeGridDay";
			case "hourly":
				return "listDay";
			default:
				return "dayGridMonth";
		}
	}, [currentView]);

	// Fetch schedules based on view and date range
	const fetchSchedules = useCallback(
		async (start: Date, end: Date) => {
			const token = sessionStorage.getItem("token");
			if (!token) {
				console.error("No authentication token found");
				return;
			}

			try {
				const params = {
					limit: 100,
					userId: userId || undefined,
					businessId: businessId || undefined,
				};

				switch (currentView) {
					case "month":
						await fetchMonthlySchedules(token, {
							...params,
							year: getYear(start),
							month: getMonth(start) + 1,
						});
						break;
					case "week":
						await fetchWeeklySchedules(token, {
							...params,
							year: getYear(start),
							week: getISOWeek(start),
						});
						break;
					case "day":
						await fetchDailySchedules(token, {
							...params,
							year: getYear(start),
							month: getMonth(start) + 1,
							day: getDate(start),
						});
						break;
					case "hourly":
						await fetchHourlySchedules(token, {
							...params,
							year: getYear(start),
							month: getMonth(start) + 1,
							day: getDate(start),
							hour: getHours(start),
						});
						break;
					default:
						await fetchAllSchedules(token, params);
				}
			} catch (error) {
				console.error("Error fetching schedules:", error);
			}
		},
		[
			currentView,
			fetchAllSchedules,
			fetchWeeklySchedules,
			fetchDailySchedules,
			fetchHourlySchedules,
			fetchMonthlySchedules,
			userId,
			businessId,
		],
	);

	// Initial fetch and handle view changes
	useEffect(() => {
		const now = new Date();
		let start: Date, end: Date;

		switch (currentView) {
			case "week":
				start = startOfWeek(now);
				end = endOfWeek(now);
				break;
			case "day":
			case "hourly":
				start = now;
				end = now;
				break;
			default:
				start = startOfMonth(now);
				end = endOfMonth(now);
		}

		fetchSchedules(start, end);
	}, [fetchSchedules, currentView]);

	// Map schedules to FullCalendar events
	const events = useMemo(() => {
		const schedules = allSchedules.schedules;
		
		return schedules.map((schedule: Schedule) => ({
			id: schedule._id,
			title: schedule.title,
			start: schedule.startDateTime,
			end: schedule.endDateTime,
			backgroundColor: theme.palette.primary.main,
			borderColor: theme.palette.primary.dark,
			textColor: theme.palette.primary.contrastText,
			extendedProps: {
				description: schedule.description,
				notificationSettings: schedule.notificationSettings,
				schedule: schedule,
			},
		}));
	}, [allSchedules.schedules, theme.palette.primary]);

	// Handle date click for creating new schedule
	const handleDateClick = useCallback(
		(info: { date: Date }) => {
			if (!allowDateClickCreation) return;
			setSelectedDate(info.date);
			setOpenModal("create");
		},
		[allowDateClickCreation],
	);

	// Handle event click for viewing schedule details
	const handleEventClick = useCallback(
		(info: { event: { id: string; extendedProps: any } }) => {
			const schedule = info.event.extendedProps.schedule;
			if (schedule) {
				setSelectedSchedule(schedule);
				setDrawerOpen(true);
			}
		},
		[],
	);

	// Handle view change
	const handleViewChange = useCallback((view: any) => {
		const viewMap: { [key: string]: typeof currentView } = {
			dayGridMonth: "month",
			timeGridWeek: "week",
			timeGridDay: "day",
			listDay: "hourly",
		};
		setCurrentView(viewMap[view.type] || "month");
	}, []);

	// Handle date range change (when user navigates calendar)
	const handleDatesSet = useCallback(
		(dateInfo: { start: Date; end: Date }) => {
			fetchSchedules(dateInfo.start, dateInfo.end);
		},
		[fetchSchedules],
	);

	// Handle success (refetch schedules)
	const handleSuccess = useCallback(() => {
		const now = new Date();
		let start: Date, end: Date;

		switch (currentView) {
			case "week":
				start = startOfWeek(now);
				end = endOfWeek(now);
				break;
			case "day":
			case "hourly":
				start = now;
				end = now;
				break;
			default:
				start = startOfMonth(now);
				end = endOfMonth(now);
		}

		fetchSchedules(start, end);
	}, [fetchSchedules, currentView]);

	// Handle edit from detail panel
	const handleEditFromPanel = useCallback((schedule: Schedule) => {
		setDrawerOpen(false);
		setSelectedSchedule(schedule);
		setOpenModal("edit");
	}, []);

	// Handle delete from detail panel
	const handleDeleteFromPanel = useCallback((schedule: Schedule) => {
		setDrawerOpen(false);
		setSelectedSchedule(schedule);
		setOpenModal("delete");
	}, []);

	return (
		<>
			<Box 
				sx={{ 
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					bgcolor: theme.palette.background.paper,
					borderRadius: 2,
					overflow: 'hidden',
					boxShadow: theme.shadows[1],
				}}
			>
				<Box sx={{ flexGrow: 1, p: 2 }}>
					<FullCalendar
						plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
						initialView={calendarView}
						events={events}
						dateClick={handleDateClick}
						eventClick={handleEventClick}
						viewDidMount={handleViewChange}
						datesSet={handleDatesSet}
						headerToolbar={{
							left: "prev,next today",
							center: "title",
							right: "dayGridMonth,timeGridWeek,timeGridDay,listDay",
						}}
						eventBackgroundColor={theme.palette.primary.main}
						eventBorderColor={theme.palette.primary.dark}
						eventTextColor={theme.palette.primary.contrastText}
						height="auto"
						contentHeight="auto"
						aspectRatio={isMobile ? 1.0 : 1.5}
						slotMinTime="00:00:00"
						slotMaxTime="24:00:00"
						allDaySlot={true}
						editable={false}
						selectable={allowDateClickCreation}
						dayMaxEvents={3}
						moreLinkClick="popover"
						eventDisplay="block"
						displayEventTime={true}
						eventTimeFormat={{
							hour: '2-digit',
							minute: '2-digit',
							hour12: false
						}}
						nowIndicator={true}
						loading={(isLoading) => {
							// You can add loading indicator here if needed
							return <LoadingScreen/>
						}}
						buttonText={{
							today: 'Today',
							month: 'Month',
							week: 'Week',
							day: 'Day',
							list: 'List'
						}}
					/>
				</Box>
			</Box>

			{/* Schedule Detail Drawer */}
			<Drawer
				anchor="right"
				open={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				sx={{
					'& .MuiDrawer-paper': {
						width: isMobile ? '100%' : 400,
						bgcolor: theme.palette.background.paper,
						borderLeft: `1px solid ${theme.palette.divider}`,
					},
				}}
			>
				<ScheduleDetailPanel
					schedule={selectedSchedule}
					onClose={() => setDrawerOpen(false)}
					onEdit={handleEditFromPanel}
					onDelete={handleDeleteFromPanel}
				/>
			</Drawer>

			{/* Create Schedule Modal */}
			<CreateSchedule
				open={openModal === "create"}
				onClose={() => {
					setOpenModal(null);
					setSelectedDate(null);
				}}
				initialDate={selectedDate}
				businessId={businessId}
				onSuccess={handleSuccess}
			/>

			{/* Edit Schedule Modal */}
			<EditSchedule
				open={openModal === "edit"}
				onClose={() => {
					setOpenModal(null);
					setSelectedSchedule(null);
				}}
				schedule={selectedSchedule}
				onSuccess={handleSuccess}
			/>

			{/* Delete Schedule Modal */}
			<DeleteSchedule
				open={openModal === "delete"}
				onClose={() => {
					setOpenModal(null);
					setSelectedSchedule(null);
				}}
				scheduleId={selectedSchedule?._id || null}
				onSuccess={handleSuccess}
			/>
		</>
	);
};

export default ByzXpoCalendar;