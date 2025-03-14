import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FilePlus2, FileText, Droplets, Flame, ReceiptText } from "lucide-react";
import { SubNavBar } from "@/components/ui/nav-bar";

export default function EstimatesPage() {
	// Define links directly in the server component instead of calling client functions
	const estimateLinks = [
		{
			title: "New Estimate",
			href: "/estimates/new",
			icon: <FilePlus2 className="h-4 w-4" />,
		},
		{
			title: "Tankless Water Heater",
			href: "/estimates/templates/tankless-water-heater",
			icon: <FileText className="h-4 w-4" />,
		},
		{
			title: "Standard Water Heater",
			href: "/estimates/templates/standard-water-heater",
			icon: <FileText className="h-4 w-4" />,
		},
		{
			title: "Enhanced Septic System",
			href: "/estimates/templates/enhanced-septic-system",
			icon: <ReceiptText className="h-4 w-4" />,
		},
	];

	return (
		<>
			<SubNavBar links={estimateLinks} />

			<div className="py-6">
				<h1 className="text-3xl font-bold mb-2">Estimates</h1>
				<p className="text-muted-foreground mb-6">Create estimates using your calculated hourly rates</p>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<FilePlus2 className="h-5 w-5 text-blue-500" />
								<CardTitle>Create New Estimate</CardTitle>
							</div>
							<CardDescription>Start a blank estimate for any job</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm">Create a custom estimate from scratch for any job type, using your calculated hourly rates and adding labor and materials as needed.</p>
						</CardContent>
						<CardFooter>
							<Button asChild className="w-full">
								<Link href="/estimates/new">Create Estimate</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Flame className="h-5 w-5 text-orange-500" />
								<CardTitle>Tankless Water Heater</CardTitle>
							</div>
							<CardDescription>Tankless water heater installation template</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm">Pre-filled estimate template for tankless water heater installations with standard labor hours and materials.</p>
						</CardContent>
						<CardFooter>
							<Button asChild className="w-full">
								<Link href="/estimates/templates/tankless-water-heater">Use Template</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Droplets className="h-5 w-5 text-blue-500" />
								<CardTitle>Standard Water Heater</CardTitle>
							</div>
							<CardDescription>Standard water heater replacement template</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm">Pre-filled estimate template for standard tank water heater replacements with typical labor hours and materials.</p>
						</CardContent>
						<CardFooter>
							<Button asChild className="w-full">
								<Link href="/estimates/templates/standard-water-heater">Use Template</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<ReceiptText className="h-5 w-5 text-green-600" />
								<CardTitle>Enhanced Septic System</CardTitle>
							</div>
							<CardDescription>Enhanced septic system installation template</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm">Pre-filled estimate template for advanced septic system installations with treatment units and proper material markups.</p>
						</CardContent>
						<CardFooter>
							<Button asChild className="w-full">
								<Link href="/estimates/templates/enhanced-septic-system">Use Template</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<FileText className="h-5 w-5 text-gray-500" />
								<CardTitle>Saved Estimates</CardTitle>
							</div>
							<CardDescription>View all of your saved estimates</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm">Access your previously saved estimates, review details, and make copies or modifications as needed.</p>
						</CardContent>
						<CardFooter>
							<Button asChild className="w-full">
								<Link href="/estimates/saved">View Saved</Link>
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</>
	);
}
