// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { STATUS, LIFECYCLE } from "react-joyride";

import WalktourProgressBar from "./walktour-progress-bar";

// ----------------------------------------------------------------------

export const useWalktour = (props: any): object => {
	const helpers = useRef();

	const [run, setRun] = useState(!!props?.defaultRun);

	const [currentIndex, setCurrentIndex] = useState(0);

	const setHelpers = (storeHelpers: any) => {
		helpers.current = storeHelpers;
	};

	const onCallback = (data: object) => {
		const { status, index, lifecycle } = data;

		if (lifecycle === LIFECYCLE.TOOLTIP) {
			setCurrentIndex(index + 1);
		}

		if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
			setRun(false);
			setCurrentIndex(0);
		}
	};

	const steps = props.steps.map((step: any) => ({
		...step,
		content: (
			<>
				{step.content}
				{props.showProgress && (
					<WalktourProgressBar
						currentStep={currentIndex}
						totalSteps={props.steps.length}
						onGoStep={(index) => helpers.current?.go(index)}
					/>
				)}
			</>
		),
	}));

	return {
		steps,
		run,
		setRun,
		onCallback,
		setHelpers,
	};
};
