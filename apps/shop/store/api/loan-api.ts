import { apiClient, parseApiError } from "../utils/api-utils";
import { API_ENDPOINTS } from "../constants/api-endpoints";

interface LoanEligibilityResponse {
	success: boolean;
	eligible: boolean;
	maxAmount?: number;
	interestRate?: number;
	maxDuration?: number;
	reason?: string;
	error?: string;
}

interface LoanResponse {
	success: boolean;
	loan?: Loan;
	loans?: Loan[];
	meta?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
	error?: string;
}

export interface Loan {
	_id: string;
	loanId: string;
	shopId: string;
	amount: number;
	interestRate: number;
	duration: number; // in months
	status: "pending" | "approved" | "active" | "paid" | "defaulted";
	purpose: string;
	amountDue: number;
	amountPaid: number;
	dueDate: string;
	approvedAt?: string;
	disbursedAt?: string;
	createdAt: string;
	updatedAt: string;
	repaymentSchedule?: RepaymentSchedule[];
}

export interface RepaymentSchedule {
	installmentNumber: number;
	dueDate: string;
	amount: number;
	paid: boolean;
	paidAt?: string;
	paidAmount?: number;
}

export interface ApplyLoanData {
	amount: number;
	purpose: string;
	duration: number;
}

export interface RepayLoanData {
	loanId: string;
	amount: number;
	phoneNumber: string;
}

export const loanApi = {
	/**
	 * Check loan eligibility for a shop
	 */
	async checkEligibility(shopId: string, token: string): Promise<LoanEligibilityResponse> {
		try {
			const response = await apiClient.get<LoanEligibilityResponse>(
				`${API_ENDPOINTS.LOANS}/eligibility/${shopId}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to check loan eligibility");
			}

			return response.data;
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	/**
	 * Apply for a loan
	 */
	async applyForLoan(data: ApplyLoanData, token: string): Promise<Loan> {
		try {
			const response = await apiClient.post<LoanResponse>(API_ENDPOINTS.LOAN_APPLY, data, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to apply for loan");
			}

			return response.data.loan!;
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	/**
	 * Get all loans for a shop
	 */
	async getShopLoans(shopId: string, token: string, page = 1, limit = 20) {
		try {
			const response = await apiClient.get<LoanResponse>(`${API_ENDPOINTS.LOANS}/shop/${shopId}`, {
				headers: { Authorization: `Bearer ${token}` },
				params: { page, limit },
			});

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to fetch loans");
			}

			return {
				loans: response.data.loans || [],
				pagination: {
					hasNextPage: (response.data.meta?.page || 1) < (response.data.meta?.totalPages || 1),
					totalCount: response.data.meta?.total || 0,
					limit: response.data.meta?.limit || 20,
					currentPage: response.data.meta?.page || 1,
					totalPages: response.data.meta?.totalPages || 1,
				},
			};
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	/**
	 * Get loan by ID
	 */
	async getLoanById(loanId: string, token: string): Promise<Loan> {
		try {
			const response = await apiClient.get<LoanResponse>(API_ENDPOINTS.LOAN_BY_ID(loanId), {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!response.data.success) {
				throw new Error(response.data.error || "Loan not found");
			}

			return response.data.loan!;
		} catch (error) {
			throw parseApiError(error as any);
		}
	},

	/**
	 * Make a loan repayment via M-Pesa
	 */
	async repayLoan(data: RepayLoanData, token: string): Promise<any> {
		try {
			const response = await apiClient.post<any>(
				`${API_ENDPOINTS.LOANS}/${data.loanId}/repay`,
				{
					amount: data.amount,
					phoneNumber: data.phoneNumber,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			if (!response.data.success) {
				throw new Error(response.data.error || "Failed to initiate loan repayment");
			}

			return response.data;
		} catch (error) {
			throw parseApiError(error as any);
		}
	},
};

export default loanApi;
