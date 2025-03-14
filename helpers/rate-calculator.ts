"use client";

interface OverheadCost {
	id: string;
	name: string;
	monthlyCost: number;
}

interface Worker {
	id: string;
	rate: number;
	commission: number;
}

interface Crew {
	id: string;
	name: string;
	workers: Worker[];
}

interface OfficeStaff {
	id: string;
	title: string;
	payType: "hourly" | "salary";
	hourlyRate: number;
	monthlySalary: number;
}

export interface CalculatorInputs {
	crews: Crew[];
	totalCrews: number;
	overheadCosts: OverheadCost[];
	officeStaff: OfficeStaff[];
	monthlyBillableHours: number;
	wastagePercent: number;
	desiredMargin: number;
	commissionEnabled: boolean;
}

export interface CalculatorResults {
	baseLaborCost: number; // Base labor cost per crew, billable time only
	wastageCost: number; // Cost of non-billable time
	totalLaborCost: number; // Total labor cost per crew
	officeStaffCost: number; // Office staff cost per billable hour
	overheadCost: number; // Other overhead cost per billable hour
	totalCost: number; // Total cost per hour
	profitMargin: number; // Profit amount per hour
	recommendedRate: number; // Final recommended hourly rate
}

export function calculateHourlyRate(inputs: CalculatorInputs): CalculatorResults {
	// 1. Calculate total hours based on wastage
	const wastageMultiplier = 1 / (1 - inputs.wastagePercent / 100);
	const totalHours = 1 * wastageMultiplier; // 1 hour base with wastage

	// 2. Calculate labor costs
	const crewCount = Math.max(1, inputs.crews.length);

	// Calculate per-crew costs by averaging across crews
	const perCrewHourlyRateSum = inputs.crews.reduce((sum, crew) => sum + crew.workers.reduce((crewSum, worker) => crewSum + worker.rate, 0), 0) / crewCount;

	// Labor costs for billable hours only (1 hour)
	const baseLaborCost = perCrewHourlyRateSum;

	// Total labor cost including wastage
	const totalLaborCost = perCrewHourlyRateSum * totalHours;

	// Cost of wastage (non-billable time)
	const wastageCost = totalLaborCost - baseLaborCost;

	// 3. Calculate office staff costs
	let totalOfficeStaffMonthlyCost = 0;
	inputs.officeStaff.forEach((staff) => {
		const hourlyRate = typeof staff.hourlyRate === "number" && !isNaN(staff.hourlyRate) ? staff.hourlyRate : 0;
		const monthlySalary = typeof staff.monthlySalary === "number" && !isNaN(staff.monthlySalary) ? staff.monthlySalary : 0;

		// Calculate monthly cost based on pay type
		const staffMonthlyCost =
			staff.payType === "hourly"
				? hourlyRate * 40 * 4.33 // 40 hours per week, 4.33 weeks per month
				: monthlySalary;

		totalOfficeStaffMonthlyCost += staffMonthlyCost;
	});

	// Calculate total monthly billable hours across all crews
	const totalMonthlyBillableHours = inputs.monthlyBillableHours * inputs.totalCrews;

	// Office staff cost per billable hour
	const officeStaffCost = totalMonthlyBillableHours > 0 ? totalOfficeStaffMonthlyCost / totalMonthlyBillableHours : 0;

	// 4. Calculate overhead costs
	const totalMonthlyOverhead = inputs.overheadCosts.reduce((sum, cost) => sum + (cost.monthlyCost || 0), 0);

	// Overhead cost per billable hour
	const overheadCost = totalMonthlyBillableHours > 0 ? totalMonthlyOverhead / totalMonthlyBillableHours : 0;

	// 5. Calculate total cost and margin
	const totalCost = totalLaborCost + officeStaffCost + overheadCost;

	// 6. Apply margin to get recommended rate
	const marginMultiplier = 1 / (1 - inputs.desiredMargin / 100);

	// Base cost per billable hour before applying margin
	const baseCostPerBillableHour = totalLaborCost + officeStaffCost + overheadCost;

	// Apply margin multiplier to get recommended rate
	const recommendedRate = baseCostPerBillableHour * marginMultiplier;

	// Calculate profit margin amount
	const profitMargin = recommendedRate - totalCost;

	return {
		baseLaborCost,
		wastageCost,
		totalLaborCost,
		officeStaffCost,
		overheadCost,
		totalCost,
		profitMargin,
		recommendedRate,
	};
}
