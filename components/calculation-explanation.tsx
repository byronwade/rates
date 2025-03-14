import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Info } from "lucide-react";

export default function CalculationExplanation() {
	return (
		<Card className="mt-8">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calculator className="h-5 w-5" />
					Calculation Methodology
				</CardTitle>
				<CardDescription>Detailed explanation of how each calculation in the rate calculator works</CardDescription>
			</CardHeader>
			<CardContent>
				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="crew-concept">
						<AccordionTrigger>Understanding Crews and Rates</AccordionTrigger>
						<AccordionContent className="text-muted-foreground space-y-2">
							<p>
								<strong>The Crew Concept:</strong> A crew is a team of workers that operate together on jobs. Your hourly rate is calculated per crew, not per individual worker.
							</p>
							<p>
								<strong>Why Crews Matter:</strong> When you add workers to a crew, your labor costs increase, but your ability to complete work also increases. The calculator ensures your hourly rate properly accounts for the entire crew&apos;s cost.
							</p>
							<p>
								<strong>Company-Wide Perspective:</strong> The calculator also considers how many total crews your company operates. This affects how overhead costs are distributed across billable hours.
							</p>
							<p>
								<strong>Key Point:</strong> The recommended hourly rate is what you should charge clients for one hour of a crew&apos;s time, not per worker. This ensures all costs (labor, overhead, wastage) are covered and your desired profit margin is achieved.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="payment-models">
						<AccordionTrigger>Payment Models: Hourly vs. Commission</AccordionTrigger>
						<AccordionContent className="text-muted-foreground space-y-2">
							<p>
								<strong>The calculator supports two payment models:</strong>
							</p>
							<p>
								<strong>1. Hourly Rate Model:</strong> Workers are paid a fixed hourly rate regardless of the job&apos;s revenue. This is the traditional model where labor is a fixed cost.
							</p>
							<p>
								<strong>2. Commission-Based Model:</strong> Workers receive a percentage of the job&apos;s total revenue instead of an hourly rate. In this model, labor cost scales with the job&apos;s revenue.
							</p>
							<p>
								<strong>Key Difference:</strong> With hourly rates, your labor costs are fixed and known upfront. With commission, your labor costs vary based on the job&apos;s revenue, which affects how we calculate the recommended rate.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="time-wastage">
						<AccordionTrigger>Time Wastage and Total Hours</AccordionTrigger>
						<AccordionContent className="text-muted-foreground space-y-2">
							<p>
								<strong>Formula:</strong> Total Hours = Billable Hours ÷ (1 - Wastage Percentage / 100)
							</p>
							<p>
								<strong>Example:</strong> If you have 5 billable hours out of an 8-hour workday, your wastage is 37.5%:
							</p>
							<p className="pl-4">Wastage = (8 - 5) ÷ 8 × 100 = 37.5%</p>
							<p className="pl-4">For every billable hour, you need 1 ÷ (1 - 0.375) = 1.6 total hours</p>
							<p>
								<strong>What is Time Wastage?</strong> Time wastage represents non-billable time that workers spend on a job but can&apos;t charge for. This includes setup, cleanup, travel between jobs, administrative tasks, and other non-billable activities.
							</p>
							<p>
								<strong>Why It Matters:</strong> You need to account for wastage time in your hourly rate calculations because workers need to be compensated for all their time, not just billable hours. If you don&apos;t factor in wastage, you&apos;ll underestimate your true labor costs.
							</p>
							<p>
								<strong>Commission Model Note:</strong> In the commission-based payment model, time wastage doesn&apos;t affect worker compensation since they&apos;re only paid based on billable hours and revenue.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="overhead-costs">
						<AccordionTrigger>Overhead Costs Calculation</AccordionTrigger>
						<AccordionContent className="text-muted-foreground space-y-2">
							<p>
								<strong>Formula:</strong> Overhead Cost Per Hour = Total Monthly Overhead ÷ Monthly Billable Hours
							</p>
							<p>
								<strong>Example:</strong> If your monthly overhead costs are $2,300 and your company has 160 billable hours per month:
							</p>
							<p className="pl-4">Overhead Cost Per Hour = $2,300 ÷ 160 = $14.38 per hour</p>
							<p>
								<strong>What are Overhead Costs?</strong> Overhead costs are the ongoing business expenses that aren&apos;t directly tied to creating a product or service. These include rent, utilities, insurance, administrative salaries, software subscriptions, and other expenses required to run your business.
							</p>
							<p>
								<strong>Why It Matters:</strong> Including overhead in your rate calculations ensures that every billable hour contributes to covering your fixed business costs. Without accounting for overhead, you might be profitable on paper but still unable to cover your monthly expenses.
							</p>
							<p>
								<strong>Crew Impact:</strong> The number of crews in your company affects how overhead is distributed. More crews generate more billable hours, which reduces the overhead cost per hour.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="hourly-labor-cost">
						<AccordionTrigger>Hourly Rate Labor Cost Calculation</AccordionTrigger>
						<AccordionContent className="text-muted-foreground space-y-2">
							<p>
								<strong>Formula:</strong> Labor Cost = Sum of (Each Worker&apos;s Rate × Total Hours)
							</p>
							<p>
								<strong>Example:</strong> If your crew has 3 workers with rates of $40/hour, $30/hour, and $23/hour, and your wastage is 37.5% (1.6 total hours per billable hour):
							</p>
							<p className="pl-4">Worker 1: $40 × 1.6 = $64 per billable hour</p>
							<p className="pl-4">Worker 2: $30 × 1.6 = $48 per billable hour</p>
							<p className="pl-4">Worker 3: $23 × 1.6 = $36.80 per billable hour</p>
							<p className="pl-4">Total Labor Cost = $64 + $48 + $36.80 = $148.80 per billable hour</p>
							<p>
								<strong>Note:</strong> This calculation is for the entire crew, not individual workers. The total labor cost represents what you pay your entire crew for each billable hour of work (accounting for wastage).
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="commission-calculation">
						<AccordionTrigger>Commission-Based Payment Calculation</AccordionTrigger>
						<AccordionContent className="text-muted-foreground space-y-2">
							<p>
								<strong>Formula:</strong> Commission Payout = Job Revenue × Total Commission Percentage
							</p>
							<p>
								<strong>Where:</strong>
							</p>
							<p className="pl-4">Job Revenue = Hourly Rate × Billable Hours</p>
							<p className="pl-4">Total Commission Percentage = Sum of all worker commission percentages</p>
							<p>
								<strong>Example:</strong> If your crew has 3 workers with commission percentages of 8%, 7%, and 5%, the job rate is $150/hour, and it takes 4 billable hours:
							</p>
							<p className="pl-4">Total Commission Percentage = 8% + 7% + 5% = 20%</p>
							<p className="pl-4">Job Revenue = $150 × 4 = $600</p>
							<p className="pl-4">Commission Payout = $600 × 20% = $120</p>
							<p>
								<strong>Note:</strong> This calculation is only used when the commission-based payment model is selected. Commission is based on billable hours only, not total hours.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="hourly-rate-calculation">
						<AccordionTrigger>Hourly Rate Model - Recommended Rate</AccordionTrigger>
						<AccordionContent className="text-muted-foreground space-y-2">
							<p>
								<strong>Formula:</strong> Recommended Rate = ((Labor Cost + Overhead Cost) ÷ Billable Hours) × Margin Multiplier
							</p>
							<p>
								<strong>Where:</strong> Margin Multiplier = 1 ÷ (1 - (Desired Margin ÷ 100))
							</p>
							<p>
								<strong>Example:</strong> If labor costs $148.80 per billable hour (with 37.5% wastage), overhead is $14.38 per hour, and desired margin is 30%:
							</p>
							<p className="pl-4">Margin Multiplier = 1 ÷ (1 - (30 ÷ 100)) = 1 ÷ 0.7 = 1.429</p>
							<p className="pl-4">Recommended Rate = (($148.80 + $14.38) ÷ 1) × 1.429 = $163.18 × 1.429 = $233.18 per billable hour</p>
							<p>
								<strong>Key Point:</strong> We divide the total cost by billable hours (not total hours) because clients only pay for billable hours. This ensures the rate is high enough to cover all costs including non-billable time and overhead.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="commission-rate-calculation">
						<AccordionTrigger>Commission Model - Recommended Rate</AccordionTrigger>
						<AccordionContent className="text-muted-foreground space-y-2">
							<p>
								<strong>Formula:</strong> Recommended Rate = (Labor Cost + Overhead Cost) / (Billable Hours × (1 - Total Commission % - Desired Margin %))
							</p>
							<p>
								<strong>Example:</strong> If overhead cost is $14.38 per hour, labor cost is $0 (since we&apos;re using commission), billable hours is 1, total worker commission is 20%, and desired margin is 30%:
							</p>
							<p className="pl-4">Denominator = 1 × (1 - 0.20 - 0.30) = 1 × 0.50 = 0.5</p>
							<p className="pl-4">Recommended Rate = ($0 + $14.38) ÷ 0.5 = $28.76 per hour</p>
							<p>
								<strong>Note:</strong> In the commission model, if there are no fixed labor costs, the recommended rate would be based primarily on overhead costs and desired margin. The overhead ensures you&apos;re covering your business expenses even with a commission-based model.
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value="effective-hourly-rate">
						<AccordionTrigger>Effective Hourly Rate Calculation</AccordionTrigger>
						<AccordionContent className="text-muted-foreground space-y-2">
							<p>
								<strong>Formula:</strong> Effective Hourly Rate = (Billable Rate × Billable Hours) ÷ Total Hours
							</p>
							<p>
								<strong>Example:</strong> If your billable rate is $233.18/hour, billable hours is 1, and total hours is 1.6 (with 37.5% wastage):
							</p>
							<p className="pl-4">Effective Hourly Rate = ($233.18 × 1) ÷ 1.6 = $233.18 ÷ 1.6 = $145.74 per hour</p>
							<p>
								<strong>Meaning:</strong> This is what your crew effectively earns per hour when accounting for both billable and non-billable time. It&apos;s useful for comparing job profitability from the worker&apos;s perspective.
							</p>
							<p>
								<strong>Why It Matters:</strong> Even though you charge clients $233.18 per billable hour, your crew is effectively earning $145.74 for each hour they work (including non-billable time). This helps you understand the true hourly value of different jobs.
							</p>
						</AccordionContent>
					</AccordionItem>
				</Accordion>

				<div className="mt-6 p-4 bg-muted rounded-lg">
					<div className="flex items-start gap-2">
						<Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
						<div>
							<h3 className="font-medium mb-2">Important Notes on Calculations</h3>
							<ul className="space-y-2 text-sm text-muted-foreground list-disc pl-4">
								<li>The calculator now uses a crew-based approach, calculating rates for entire crews rather than individual workers. This provides more accurate and consistent pricing.</li>
								<li>Time wastage is calculated based on the ratio of billable to total work hours, providing a more accurate representation of your actual business operations.</li>
								<li>Monthly billable hours are now calculated based on the number of crews in your company, not individual workers, which better reflects how your business generates revenue.</li>
								<li>Overhead costs are distributed across all billable hours company-wide, ensuring that each job contributes proportionally to covering your fixed business expenses.</li>
								<li>The recommended rate is calculated based on billable hours only, as that&apos;s what clients pay for. However, costs are calculated based on total hours (including wastage).</li>
								<li>The rate comparisons feature helps you understand how different variables impact your pricing, allowing you to make more informed business decisions.</li>
								<li>For the most accurate results, regularly update your crew configuration, monthly billable hours, and overhead costs as your business grows or changes.</li>
							</ul>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
