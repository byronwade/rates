"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Home, Settings, BarChart3, Calculator, FileText, Building2, Warehouse, FilePlus, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItem {
	title: string;
	href: string;
	icon: React.ReactNode;
	badge?: string;
}

export function NavBar() {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const navItems: NavItem[] = [
		{
			title: "Rate Calculators",
			href: "/calculators",
			icon: <Calculator className="h-4 w-4" />,
		},
		{
			title: "Estimates",
			href: "/estimates",
			icon: <FileText className="h-4 w-4" />,
		},
		{
			title: "Saved Jobs",
			href: "/saved",
			icon: <Bookmark className="h-4 w-4" />,
		},
		{
			title: "Reports",
			href: "/reports",
			icon: <BarChart3 className="h-4 w-4" />,
		},
	];

	const isActive = (href: string) => {
		if (href === "/" && pathname === "/") return true;
		if (href !== "/" && pathname.startsWith(href)) return true;
		return false;
	};

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	return (
		<nav className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
			<div className="container mx-auto px-4">
				<div className="flex justify-between h-16">
					<div className="flex">
						<div className="flex-shrink-0 flex items-center">
							<Link href="/calculators" className="text-xl font-bold text-gray-800 dark:text-white">
								Rates Pro
							</Link>
						</div>
						<div className="hidden sm:ml-6 sm:flex sm:space-x-4">
							{navItems.map((item, index) => (
								<Link key={index} href={item.href} className={cn("inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium", isActive(item.href) ? "border-indigo-500 text-gray-900 dark:text-white" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white")}>
									{item.icon}
									<span className="ml-2">{item.title}</span>
								</Link>
							))}
						</div>
					</div>
					<div className="hidden sm:ml-6 sm:flex sm:items-center">
						{/* Settings or profile button could go here */}
						<Link href="/settings" className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
							<Settings className="h-5 w-5" />
						</Link>
					</div>

					{/* Mobile menu button */}
					<div className="flex items-center sm:hidden">
						<button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500" aria-controls="mobile-menu" aria-expanded={mobileMenuOpen} onClick={toggleMobileMenu}>
							<span className="sr-only">Open main menu</span>
							<svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Mobile menu, toggle based on menu state */}
			<div className={`sm:hidden ${mobileMenuOpen ? "block" : "hidden"}`} id="mobile-menu">
				<div className="pt-2 pb-3 space-y-1">
					{navItems.map((item, index) => (
						<Link key={index} href={item.href} className={cn("block pl-3 pr-4 py-2 border-l-4 text-base font-medium", isActive(item.href) ? "bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-gray-800 dark:border-indigo-500 dark:text-indigo-300" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white")} onClick={() => setMobileMenuOpen(false)}>
							<div className="flex items-center">
								{item.icon}
								<span className="ml-2">{item.title}</span>
							</div>
						</Link>
					))}
				</div>
			</div>
		</nav>
	);
}

export function SubNavBar({ links }: { links: NavItem[] }) {
	const pathname = usePathname();

	return (
		<div className="border-b border-gray-200 dark:border-gray-700 mb-4">
			<div className="flex space-x-4 overflow-x-auto pb-2">
				{links.map((link, index) => (
					<Link key={index} href={link.href} className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors", pathname === link.href ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white")}>
						{link.icon}
						<span className="ml-2">{link.title}</span>
					</Link>
				))}
			</div>
		</div>
	);
}

export function getCalculatorLinks() {
	return [
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
			title: "Commercial",
			href: "/calculators/commercial",
			icon: <Warehouse className="h-4 w-4" />,
		},
	];
}

export function getEstimateLinks() {
	return [
		{
			title: "New Estimate",
			href: "/estimates/new",
			icon: <FilePlus className="h-4 w-4" />,
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
	];
}
