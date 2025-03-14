"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Minus, Users, DollarSign, Briefcase, UserPlus, PenLine, AlertCircle } from "lucide-react";
import type { Worker } from "./hourly-rate-calculator";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";

interface Crew {
	id: string;
	name: string;
	workers: Worker[];
}

interface CrewConfigurationProps {
	serviceType: string;
	crews: Crew[];
	setCrews: (crews: Crew[]) => void;
	selectedCrewId: string;
	setSelectedCrewId: (id: string) => void;
	commissionEnabled: boolean;
	onCommissionToggle: (enabled: boolean) => void;
}

export default function CrewConfiguration({ serviceType, crews, setCrews, selectedCrewId, setSelectedCrewId, commissionEnabled, onCommissionToggle }: CrewConfigurationProps) {
	const [editingCrewName, setEditingCrewName] = useState<string | null>(null);
	const [crewNameInput, setCrewNameInput] = useState("");

	// Keep track of which crew accordions are expanded
	const [expandedCrews, setExpandedCrews] = useState<string[]>([selectedCrewId]);
	const [showCrewSection, setShowCrewSection] = useState(true);

	const addCrew = () => {
		// Generate IDs synchronously
		const crewId = crypto.randomUUID();
		const worker1Id = crypto.randomUUID();
		const worker2Id = crypto.randomUUID();

		const newCrew = {
			id: crewId,
			name: `Crew ${crews.length + 1}`,
			workers: [
				{ id: worker1Id, rate: 25, commission: 10 },
				{ id: worker2Id, rate: 25, commission: 10 },
			],
		};
		const updatedCrews = [...crews, newCrew];
		setCrews(updatedCrews);
		setSelectedCrewId(newCrew.id);

		// Auto expand the new crew
		setExpandedCrews([...expandedCrews, newCrew.id]);
	};

	const removeCrew = (crewId: string) => {
		if (crews.length > 1) {
			const newCrews = crews.filter((crew) => crew.id !== crewId);
			setCrews(newCrews);

			// Update selected crew if needed
			if (selectedCrewId === crewId) {
				setSelectedCrewId(newCrews[0].id);
			}

			// Remove from expanded list
			setExpandedCrews(expandedCrews.filter((id) => id !== crewId));
		}
	};

	const startEditingCrewName = (crewId: string, currentName: string) => {
		setEditingCrewName(crewId);
		setCrewNameInput(currentName);
	};

	const saveCrewName = (crewId: string) => {
		if (crewNameInput.trim()) {
			const updatedCrews = crews.map((crew) => (crew.id === crewId ? { ...crew, name: crewNameInput } : crew));
			setCrews(updatedCrews);
		}
		setEditingCrewName(null);
	};

	const addWorker = (crewId: string) => {
		// Generate worker ID synchronously
		const workerId = crypto.randomUUID();

		const updatedCrews = crews.map((crew) => {
			if (crew.id === crewId) {
				const updatedWorkers = [...crew.workers, { id: workerId, rate: 25, commission: 10 }];

				// Update commission percentages if in commission mode
				if (commissionEnabled) {
					const workerCount = updatedWorkers.length;
					const commissionPerWorker = 30 / workerCount; // 30% total split evenly

					return {
						...crew,
						workers: updatedWorkers.map((worker) => ({
							...worker,
							commission: commissionPerWorker,
						})),
					};
				}

				return {
					...crew,
					workers: updatedWorkers,
				};
			}
			return crew;
		});
		setCrews(updatedCrews);
	};

	const removeWorker = (crewId: string, workerId: string) => {
		const crew = crews.find((c) => c.id === crewId);
		if (crew && crew.workers.length > 1) {
			const updatedCrews = crews.map((c) => {
				if (c.id === crewId) {
					const filteredWorkers = c.workers.filter((w) => w.id !== workerId);

					// Update commission percentages if in commission mode
					if (commissionEnabled) {
						const workerCount = filteredWorkers.length;
						const commissionPerWorker = 30 / workerCount; // 30% total split evenly

						return {
							...c,
							workers: filteredWorkers.map((worker) => ({
								...worker,
								commission: commissionPerWorker,
							})),
						};
					}

					return {
						...c,
						workers: filteredWorkers,
					};
				}
				return c;
			});
			setCrews(updatedCrews);
		}
	};

	const updateWorker = (crewId: string, workerId: string, field: "rate" | "commission", value: number) => {
		const updatedCrews = crews.map((crew) => {
			if (crew.id === crewId) {
				return {
					...crew,
					workers: crew.workers.map((worker) => (worker.id === workerId ? { ...worker, [field]: value } : worker)),
				};
			}
			return crew;
		});
		setCrews(updatedCrews);
	};

	const handleAccordionChange = (value: string) => {
		if (expandedCrews.includes(value)) {
			setExpandedCrews(expandedCrews.filter((id) => id !== value));
		} else {
			setExpandedCrews([...expandedCrews, value]);
		}

		// Update selected crew
		setSelectedCrewId(value);
	};

	const totalWorkers = crews.reduce((sum, crew) => sum + crew.workers.length, 0);

	return (
		<Accordion type="single" collapsible value={showCrewSection ? "crew" : ""} onValueChange={(value) => setShowCrewSection(value === "crew")}>
			<AccordionItem value="crew">
				<AccordionTrigger className="text-base font-medium">
					<div className="flex items-center gap-2">
						<Briefcase className="h-5 w-5" />
						<span>{serviceType.replace("-", " ").charAt(0).toUpperCase() + serviceType.replace("-", " ").slice(1)} Crew Configuration</span>
						<Badge variant="outline" className="ml-2">
							{totalWorkers} worker{totalWorkers !== 1 ? "s" : ""} in {crews.length} crew{crews.length !== 1 ? "s" : ""}
						</Badge>
					</div>
				</AccordionTrigger>
				<AccordionContent>
					<div className="space-y-4 pt-2">
						<div className="flex justify-between items-center">
							<div className="space-y-1">
								<Label className="text-sm font-medium">Configure Your Crews</Label>
								<p className="text-xs text-muted-foreground">{commissionEnabled ? "Set commission percentages for workers in each crew" : "Set hourly rates for workers in each crew"}</p>
							</div>
							<div className="flex items-center gap-3">
								<div className="flex items-center gap-2">
									<Label htmlFor="commission-toggle" className="text-sm">
										{commissionEnabled ? "Commission-Based Payment" : "Hourly Rate Payment"}
									</Label>
									<Switch id="commission-toggle" checked={commissionEnabled} onCheckedChange={onCommissionToggle} />
								</div>
								<Button variant="default" size="sm" onClick={addCrew} className="flex items-center gap-1">
									<Briefcase className="h-4 w-4" />
									<span>Add Crew</span>
								</Button>
							</div>
						</div>

						<Accordion type="multiple" value={expandedCrews} className="space-y-2">
							{crews.map((crew) => (
								<AccordionItem key={crew.id} value={crew.id} className="border rounded-lg overflow-hidden">
									<AccordionTrigger onClick={() => handleAccordionChange(crew.id)} className={`px-4 py-3 hover:no-underline ${crew.id === selectedCrewId ? "bg-muted/50" : ""}`}>
										<div className="flex items-center justify-between w-full mr-4">
											<div className="flex items-center gap-2">
												{editingCrewName === crew.id ? (
													<Input value={crewNameInput} onChange={(e) => setCrewNameInput(e.target.value)} onBlur={() => saveCrewName(crew.id)} onKeyDown={(e) => e.key === "Enter" && saveCrewName(crew.id)} autoFocus className="w-40 h-8" onClick={(e) => e.stopPropagation()} />
												) : (
													<>
														<Users className="h-4 w-4" />
														<span className="font-medium">{crew.name}</span>

														<span
															className="inline-flex h-6 w-6 ml-1 opacity-50 hover:opacity-100 items-center justify-center rounded-md cursor-pointer"
															onClick={(e) => {
																e.stopPropagation();
																startEditingCrewName(crew.id, crew.name);
															}}
														>
															<PenLine className="h-3 w-3" />
														</span>
													</>
												)}
											</div>

											<div className="flex items-center gap-2">
												<Badge variant="secondary" className="text-xs">
													{crew.workers.length} worker{crew.workers.length !== 1 ? "s" : ""}
												</Badge>

												<span className="text-sm font-medium">{commissionEnabled ? `${crew.workers.reduce((sum, w) => sum + w.commission, 0)}%` : `$${crew.workers.reduce((sum, w) => sum + w.rate, 0).toFixed(2)}/hr`}</span>

												{crews.length > 1 && (
													<span
														className="inline-flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:text-destructive cursor-pointer"
														onClick={(e) => {
															e.stopPropagation();
															removeCrew(crew.id);
														}}
													>
														<Minus className="h-4 w-4" />
													</span>
												)}
											</div>
										</div>
									</AccordionTrigger>

									<AccordionContent className="px-4 pt-2 pb-4">
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<h4 className="text-sm font-medium">Workers in {crew.name}</h4>
												<Button variant="outline" size="sm" onClick={() => addWorker(crew.id)} className="h-8">
													<UserPlus className="h-4 w-4 mr-1" />
													Add Worker
												</Button>
											</div>

											<div className="space-y-3">
												{crew.workers.map((worker, index) => (
													<div key={worker.id} className="flex items-center gap-3 p-2 border rounded-md bg-background">
														<div className="text-sm font-medium w-20">Worker {index + 1}</div>
														<div className="flex-1 flex items-center">
															<Label htmlFor={`worker-${index}-${crew.id}`} className="w-24 text-sm text-muted-foreground">
																{commissionEnabled ? "Commission %" : "Hourly Rate"}
															</Label>
															<div className="relative">
																{!commissionEnabled && <DollarSign className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
																<Input id={`worker-${index}-${crew.id}`} type="number" min="0" value={commissionEnabled ? worker.commission || 0 : worker.rate || 0} onChange={(e) => updateWorker(crew.id, worker.id, commissionEnabled ? "commission" : "rate", Number(e.target.value) || 0)} className={commissionEnabled ? "w-24" : "w-24 pl-8"} />
																{commissionEnabled && <span className="ml-1">%</span>}
															</div>
														</div>
														<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeWorker(crew.id, worker.id)} disabled={crew.workers.length === 1}>
															<Minus className="h-4 w-4" />
														</Button>
													</div>
												))}
											</div>

											<div className="flex justify-between items-center px-2 py-1.5 bg-muted/50 rounded-md">
												<div className="flex items-center gap-1.5">
													<Users className="h-4 w-4 text-muted-foreground" />
													<span className="text-sm font-medium">Total {commissionEnabled ? "Commission" : "Cost"}:</span>
												</div>
												<span className="text-sm font-bold">{commissionEnabled ? `${crew.workers.reduce((sum, w) => sum + w.commission, 0)}%` : `$${crew.workers.reduce((sum, w) => sum + w.rate, 0).toFixed(2)}/hr`}</span>
											</div>
										</div>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>

						<div className="p-3 border rounded-md bg-amber-50 border-amber-200">
							<h4 className="text-sm font-medium text-amber-800 mb-1 flex items-center gap-2">
								<AlertCircle className="h-4 w-4" />
								{commissionEnabled ? "Commission Mode Active" : "Hourly Rate Mode Active"}
							</h4>
							<p className="text-xs text-amber-700">{commissionEnabled ? "In commission mode, workers are paid a percentage of the job revenue instead of an hourly rate." : "In hourly rate mode, workers are paid a fixed hourly rate regardless of the job's revenue."}</p>
						</div>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}
