// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */

import { FormProvider as Form } from "react-hook-form";

// ----------------------------------------------------------------------
interface FormProviderProps {
	children: React.ReactNode;
	methods: object;
	onSubmit: () => any;
}

const FormProvider = ({ children, onSubmit, methods }: FormProviderProps) => {
	return (
		<Form {...methods}>
			<form onSubmit={onSubmit}>{children}</form>
		</Form>
	);
};

export default FormProvider;
