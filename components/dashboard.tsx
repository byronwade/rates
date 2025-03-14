"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, TrendingDown, Percent, Clock, Users } from "lucide-react";
import type { Job } from "./job-calculator";

export default function Dashboard() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [timeframe, setTimeframe] = useState("all");
	const [stats, setStats] = useState({
		totalJobs: 0,
		avgProfitability: 0,
		totalRevenue: 0,
		totalCost: 0,
		totalProfit: 0,
		avgHourlyRate: 0,
		profitableJobs: 0,
		unprofitableJobs: 0,
	});

	useEffect(() => {
		// Load saved jobs from localStorage
		const savedJobs = localStorage.getItem("savedJobs");
		if (savedJobs) {
			setJobs(JSON.parse(savedJobs));
		}
	}, []);

	useEffect(() => {
		if (jobs.length === 0) return;

		// Filter jobs based on timeframe
		let filteredJobs = [...jobs];
		const now = new Date();

		if (timeframe === "week") {
			const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			filteredJobs = jobs.filter((job) => new Date(job.date) >= oneWeekAgo);
		} else if (timeframe === "month") {
			const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
			filteredJobs = jobs.filter((job) => new Date(job.date) >= oneMonthAgo);
		} else if (timeframe === "year") {
			const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
			filteredJobs = jobs.filter((job) => new Date(job.date) >= oneYearAgo);
		}

		// Calculate statistics
		const totalJobs = filteredJobs.length;

		// Only include jobs with actual rates in calculations
		const jobsWithRates = filteredJobs.filter((job) => job.actualRate > 0);

		if (jobsWithRates.length === 0) {
			setStats({
				totalJobs,
				avgProfitability: 0,
				totalRevenue: 0,
				totalCost: 0,
				totalProfit: 0,
				avgHourlyRate: 0,
				profitableJobs: 0,
				unprofitableJobs: 0,
			});
			return;
		}

		const totalRevenue = jobsWithRates.reduce((sum, job) => sum + job.actualRate * job.billableHours, 0);
		const totalCost = jobsWithRates.reduce((sum, job) => sum + job.totalCost, 0);
		const totalProfit = totalRevenue - totalCost;

		const avgProfitability = jobsWithRates.reduce((sum, job) => sum + job.profitability, 0) / jobsWithRates.length;
		const avgHourlyRate = jobsWithRates.reduce((sum, job) => sum + job.actualRate, 0) / jobsWithRates.length;

		const profitableJobs = jobsWithRates.filter((job) => job.profitability >= 0).length;
		const unprofitableJobs = jobsWithRates.filter((job) => job.profitability < 0).length;

		setStats({
			totalJobs,
			avgProfitability,
			totalRevenue,
			totalCost,
			totalProfit,
			avgHourlyRate,
			profitableJobs,
			unprofitableJobs,
		});
	}, [jobs, timeframe]);

	return (
		<div className="space-y-6">
			<Tabs value={timeframe} onValueChange={setTimeframe}>
				<TabsList className="grid grid-cols-4 w-[400px]">
					<TabsTrigger value="all">All Time</TabsTrigger>
					<TabsTrigger value="year">Year</TabsTrigger>
					<TabsTrigger value="month">Month</TabsTrigger>
					<TabsTrigger value="week">Week</TabsTrigger>
				</TabsList>
			</Tabs>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
						<DollarSign className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
						<p className="text-xs text-muted-foreground">From {stats.totalJobs} jobs</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Profit Margin</CardTitle>
						<Percent className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className={`text-2xl font-bold ${stats.avgProfitability >= 0 ? "text-green-600" : "text-red-600"}`}>{stats.avgProfitability.toFixed(2)}%</div>
						<p className="text-xs text-muted-foreground">Target: 30%</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Average Hourly Rate</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">${stats.avgHourlyRate.toFixed(2)}</div>
						<p className="text-xs text-muted-foreground">Per hour</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Profitability Ratio</CardTitle>
						<Users className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">
							{stats.profitableJobs} / {stats.unprofitableJobs}
						</div>
						<p className="text-xs text-muted-foreground">Profitable vs Unprofitable</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Profit Breakdown</CardTitle>
						<CardDescription>Revenue, cost, and profit analysis</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div className="flex flex-col">
									<span className="text-sm font-medium">Total Revenue</span>
									<span className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</span>
								</div>
								<TrendingUp className="h-4 w-4 text-green-500" />
							</div>

							<div className="flex items-center justify-between">
								<div className="flex flex-col">
									<span className="text-sm font-medium">Total Cost</span>
									<span className="text-2xl font-bold">${stats.totalCost.toFixed(2)}</span>
								</div>
								<TrendingDown className="h-4 w-4 text-red-500" />
							</div>

							<div className="flex items-center justify-between pt-4 border-t">
								<div className="flex flex-col">
									<span className="text-sm font-medium">Net Profit</span>
									<span className={`text-2xl font-bold ${stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>${stats.totalProfit.toFixed(2)}</span>
								</div>
								<div className={`text-sm font-medium ${stats.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>{((stats.totalProfit / stats.totalRevenue) * 100).toFixed(2)}%</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Performance Insights</CardTitle>
						<CardDescription>Key metrics and recommendations</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{stats.avgProfitability < 20 && (
								<div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
									<h4 className="font-semibold text-amber-800 mb-1">Profit Margin Alert</h4>
									<p className="text-sm text-amber-700">Your average profit margin is below 20%. Consider increasing your hourly rates or reducing costs.</p>
								</div>
							)}

							{stats.unprofitableJobs > stats.profitableJobs && (
								<div className="rounded-lg bg-red-50 p-4 border border-red-200">
									<h4 className="font-semibold text-red-800 mb-1">Profitability Warning</h4>
									<p className="text-sm text-red-700">You have more unprofitable jobs than profitable ones. Review your pricing strategy immediately.</p>
								</div>
							)}

							{stats.avgProfitability >= 30 && (
								<div className="rounded-lg bg-green-50 p-4 border border-green-200">
									<h4 className="font-semibold text-green-800 mb-1">Good Performance</h4>
									<p className="text-sm text-green-700">Your average profit margin is at or above 30%. Keep up the good work!</p>
								</div>
							)}

							<div className="rounded-lg bg-muted p-4">
								<h4 className="font-semibold mb-2">Recommendations</h4>
								<ul className="text-sm space-y-2">
									<li>Aim for a minimum 30% profit margin on all jobs</li>
									<li>Track material costs closely to prevent overruns</li>
									<li>Consider time tracking to improve labor hour estimates</li>
									<li>Review unprofitable jobs to identify common issues</li>
								</ul>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
