import { ReactNode } from "react";

// Worker type for crew members
export type Worker = {
	id: string;
	rate: number;
	commission: number;
};

// Crew type containing workers
export type Crew = {
	id: string;
	name: string;
	workers: Worker[];
};

// Office staff type
export type OfficeStaff = {
	id: string;
	title: string;
	payType: "salary" | "hourly";
	hourlyRate: number;
	monthlySalary: number;
};

// Overhead cost type
export type OverheadCost = {
	id: string;
	name: string;
	monthlyCost: number;
};

// Calculator state type
export type CalculatorState = {
	rateName: string;
	wastagePercent: number;
	crews: Crew[];
	selectedCrewId: string;
	officeStaff?: OfficeStaff[];
	desiredMargin: number;
	commissionEnabled: boolean;
	overheadCosts: OverheadCost[];
	monthlyBillableHours: number;
	dailyWorkHours: number;
	dailyBillableHours: number;
	totalCrews: number;
	showOverheadSection: boolean;
	showOfficeStaffSection?: boolean;
	showComparisons: boolean;
	showExplanation: boolean;
	recommendedRate?: number;
};

// Navigation link type
export type NavLink = {
	title: string;
	href: string;
	icon?: ReactNode;
};
