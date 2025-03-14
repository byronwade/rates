"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileDown, Printer } from "lucide-react";
import type { Job } from "./job-calculator";

export default function Reports() {
	const [jobs, setJobs] = useState<Job[]>([]);
	const [reportType, setReportType] = useState("profitability");

	useEffect(() => {
		// Load saved jobs from localStorage
		const savedJobs = localStorage.getItem("savedJobs");
		if (savedJobs) {
			setJobs(JSON.parse(savedJobs));
		}
	}, []);

	const jobsWithRates = jobs.filter((job) => job.actualRate > 0);

	// Sort jobs based on report type
	const sortedJobs = [...jobsWithRates].sort((a, b) => {
		if (reportType === "profitability") {
			return b.profitability - a.profitability;
		} else if (reportType === "revenue") {
			return b.actualRate * b.billableHours - a.actualRate * a.billableHours;
		} else if (reportType === "cost") {
			return b.totalCost - a.totalCost;
		} else {
			return 0;
		}
	});

	const exportCSV = () => {
		// Create CSV content
		let csvContent = "Job Name,Date,Type,Hours,Worker Count,Total Cost,Recommended Rate,Actual Rate,Profitability\n";

		sortedJobs.forEach((job) => {
			const row = [`"${job.name}"`, new Date(job.date).toLocaleDateString(), job.jobType, job.billableHours, job.workers.length, job.totalCost, job.recommendedRate, job.actualRate, `${job.profitability.toFixed(2)}%`];
			csvContent += row.join(",") + "\n";
		});

		// Create download link
		const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute("download", `job_${reportType}_report.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const printReport = () => {
		window.print();
	};

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<CardTitle>Reports</CardTitle>
							<CardDescription>Generate and export job reports</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Select value={reportType} onValueChange={setReportType}>
								<SelectTrigger className="w-[180px]">
									<SelectValue placeholder="Report Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="profitability">Profitability</SelectItem>
									<SelectItem value="revenue">Revenue</SelectItem>
									<SelectItem value="cost">Cost</SelectItem>
								</SelectContent>
							</Select>
							<Button variant="outline" onClick={printReport}>
								<Printer className="mr-2 h-4 w-4" />
								Print
							</Button>
							<Button onClick={exportCSV}>
								<FileDown className="mr-2 h-4 w-4" />
								Export CSV
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{jobsWithRates.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">No job data available. Add jobs with actual rates to generate reports.</div>
					) : (
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Job Name</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Type</TableHead>
										{reportType === "cost" && (
											<>
												<TableHead className="text-right">Material Cost</TableHead>
												<TableHead className="text-right">Labor Cost</TableHead>
											</>
										)}
										<TableHead className="text-right">Total Cost</TableHead>
										{reportType === "revenue" && <TableHead className="text-right">Revenue</TableHead>}
										<TableHead className="text-right">Hourly Rate</TableHead>
										<TableHead className="text-right">Profitability</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{sortedJobs.map((job) => (
										<TableRow key={job.id}>
											<TableCell className="font-medium">{job.name}</TableCell>
											<TableCell>{new Date(job.date).toLocaleDateString()}</TableCell>
											<TableCell className="capitalize">{job.jobType}</TableCell>
											{reportType === "cost" && (
												<>
													<TableCell className="text-right">${(job.totalCost * 0.4).toFixed(2)}</TableCell>
													<TableCell className="text-right">${(job.totalCost * 0.6).toFixed(2)}</TableCell>
												</>
											)}
											<TableCell className="text-right">${job.totalCost.toFixed(2)}</TableCell>
											{reportType === "revenue" && <TableCell className="text-right">${(job.actualRate * job.billableHours).toFixed(2)}</TableCell>}
											<TableCell className="text-right">${job.actualRate.toFixed(2)}</TableCell>
											<TableCell className={`text-right ${job.profitability >= 0 ? "text-green-600" : "text-red-600"}`}>{job.profitability.toFixed(2)}%</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					)}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Summary Statistics</CardTitle>
					<CardDescription>Key metrics across all jobs</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-6 md:grid-cols-3">
						<div className="space-y-2">
							<h3 className="text-sm font-medium text-muted-foreground">Average Profitability</h3>
							<p className="text-2xl font-bold">{jobsWithRates.length > 0 ? `${(jobsWithRates.reduce((sum, job) => sum + job.profitability, 0) / jobsWithRates.length).toFixed(2)}%` : "N/A"}</p>
						</div>

						<div className="space-y-2">
							<h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
							<p className="text-2xl font-bold">{jobsWithRates.length > 0 ? `$${jobsWithRates.reduce((sum, job) => sum + job.actualRate * job.billableHours, 0).toFixed(2)}` : "N/A"}</p>
						</div>

						<div className="space-y-2">
							<h3 className="text-sm font-medium text-muted-foreground">Total Profit</h3>
							<p className="text-2xl font-bold">{jobsWithRates.length > 0 ? `$${(jobsWithRates.reduce((sum, job) => sum + job.actualRate * job.billableHours, 0) - jobsWithRates.reduce((sum, job) => sum + job.totalCost, 0)).toFixed(2)}` : "N/A"}</p>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
