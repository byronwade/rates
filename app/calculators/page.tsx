import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home, Building2, Warehouse, ReceiptText } from "lucide-react";
import { SubNavBar } from "@/components/ui/nav-bar";

export default function CalculatorsPage() {
	const calculatorLinks = [
		{
			title: "Residential",
			href: "/calculators/residential",
			icon: <Home className="h-4 w-4" />,
		},
		{
			title: "Property Management",
			href: "/calculators/property-management",
			icon: <Building2 className="h-4 w-4" />,
		},
		{
			title: "Single Family",
			href: "/calculators/single-family",
			icon: <Home className="h-4 w-4" />,
		},
		{
			title: "Septic",
			href: "/calculators/septic",
			icon: <ReceiptText className="h-4 w-4" />,
		},
		{
			title: "Commercial",
			href: "/calculators/commercial",
			icon: <Warehouse className="h-4 w-4" />,
		},
	];

	return (
		<>
			<SubNavBar links={calculatorLinks} />

			<div className="py-6">
				<h1 className="text-3xl font-bold mb-2">Rate Calculators</h1>
				<p className="text-muted-foreground mb-6">Calculate accurate hourly rates for different service types</p>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Home className="h-5 w-5 text-blue-500" />
								<CardTitle>Residential</CardTitle>
							</div>
							<CardDescription>Standard residential service rates for homes</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm">Calculate hourly rates for standard residential service calls and projects, factoring in labor costs, overhead, and desired profit margins.</p>
						</CardContent>
						<CardFooter>
							<Button asChild className="w-full">
								<Link href="/calculators/residential">Open Calculator</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Building2 className="h-5 w-5 text-indigo-500" />
								<CardTitle>Property Management</CardTitle>
							</div>
							<CardDescription>Rates for property management contracts</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm">Specialized calculator for creating rates for property management clients with different margins and efficiency factors.</p>
						</CardContent>
						<CardFooter>
							<Button asChild className="w-full">
								<Link href="/calculators/property-management">Open Calculator</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Home className="h-5 w-5 text-green-500" />
								<CardTitle>Single Family</CardTitle>
							</div>
							<CardDescription>Rates for single family home services</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm">Calculate rates specifically tailored for single family home services, with adjusted efficiency and profit margins.</p>
						</CardContent>
						<CardFooter>
							<Button asChild className="w-full">
								<Link href="/calculators/single-family">Open Calculator</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<ReceiptText className="h-5 w-5 text-purple-500" />
								<CardTitle>Septic</CardTitle>
							</div>
							<CardDescription>Rates for septic installation and maintenance</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm">Calculate specialized rates for septic system installation, maintenance, and repair services with appropriate margins.</p>
						</CardContent>
						<CardFooter>
							<Button asChild className="w-full">
								<Link href="/calculators/septic">Open Calculator</Link>
							</Button>
						</CardFooter>
					</Card>

					<Card>
						<CardHeader>
							<div className="flex items-center gap-2">
								<Warehouse className="h-5 w-5 text-amber-500" />
								<CardTitle>Commercial</CardTitle>
							</div>
							<CardDescription>Rates for commercial service contracts</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-sm">Generate accurate hourly rates for commercial clients, considering specialized labor requirements and overhead costs.</p>
						</CardContent>
						<CardFooter>
							<Button asChild className="w-full">
								<Link href="/calculators/commercial">Open Calculator</Link>
							</Button>
						</CardFooter>
					</Card>
				</div>
			</div>
		</>
	);
}
