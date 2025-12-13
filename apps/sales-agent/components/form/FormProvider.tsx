// components/form/FormProvider.tsx
import React from "react";
import { FormProvider as RHFFormProvider } from "react-hook-form";

interface FormProviderProps {
	children: React.ReactNode;
	methods: any;
	onSubmit?: () => void;
}

export const FormProvider: React.FC<FormProviderProps> = ({ 
	children, 
	methods, 
	onSubmit 
}) => {
	return (
		<RHFFormProvider {...methods}>
			{children}
		</RHFFormProvider>
	);
};

export default FormProvider;