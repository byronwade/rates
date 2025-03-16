"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { PanelLeft, Calculator, FileText, Bookmark, BarChart2, Settings, Menu, X } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface NavLink {
	href: string;
	icon: React.ReactNode;
	label: string;
}

export function Header() {
	const pathname = usePathname();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	const navLinks: NavLink[] = [
		{
			href: "/calculators",
			icon: <Calculator className="h-4 w-4" />,
			label: "Rate Calculators",
		},
		{
			href: "/estimates",
			icon: <FileText className="h-4 w-4" />,
			label: "Estimates",
		},
		{
			href: "/saved",
			icon: <Bookmark className="h-4 w-4" />,
			label: "Saved Jobs",
		},
		{
			href: "/reports",
			icon: <BarChart2 className="h-4 w-4" />,
			label: "Reports",
		},
	];

	return (
		<header className="bg-background border-b flex flex-col sticky top-0 z-10 w-full">
			<div className="h-14 sm:h-16 md:h-16 flex items-center px-4 w-full">
				<div className="flex w-full items-center justify-between">
					<div className="flex items-center space-x-4">
						<SidebarTrigger className="hover:bg-muted p-2 rounded-md">
							<PanelLeft className="h-5 w-5 sm:h-6 sm:w-6" />
							<span className="sr-only">Toggle Sidebar</span>
						</SidebarTrigger>

						<Link href="/" className="text-lg sm:text-xl font-bold text-foreground">
							Rates Pro
						</Link>
					</div>

					<nav className="hidden md:flex items-center space-x-4">
						{navLinks.map((link) => {
							const isActive = pathname.startsWith(link.href);

							return (
								<Link
									key={link.href}
									href={link.href}
									className={`inline-flex items-center px-1 h-14 sm:h-16 md:h-16 border-b-2 text-sm font-medium transition-colors 
                  ${isActive ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
								>
									{link.icon}
									<span className="ml-2">{link.label}</span>
								</Link>
							);
						})}
					</nav>

					<div className="flex items-center space-x-2">
						<Link href="/settings" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring">
							<Settings className="h-5 w-5 sm:h-6 sm:w-6" />
							<span className="sr-only">Settings</span>
						</Link>

						<Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
							{mobileMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
							<span className="sr-only">{mobileMenuOpen ? "Close menu" : "Open menu"}</span>
						</Button>
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			{mobileMenuOpen && (
				<div className="md:hidden py-3 px-4 border-t w-full">
					<nav className="flex flex-col space-y-3">
						{navLinks.map((link) => {
							const isActive = pathname.startsWith(link.href);

							return (
								<Link key={link.href} href={link.href} className={`flex items-center py-2.5 px-3 rounded-md text-sm font-medium ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`} onClick={() => setMobileMenuOpen(false)}>
									{link.icon}
									<span className="ml-2">{link.label}</span>
								</Link>
							);
						})}

						{/* Settings link in mobile menu */}
						<Link href="/settings" className="flex items-center py-2.5 px-3 rounded-md text-sm font-medium text-foreground hover:bg-muted" onClick={() => setMobileMenuOpen(false)}>
							<Settings className="h-4 w-4" />
							<span className="ml-2">Settings</span>
						</Link>
					</nav>
				</div>
			)}
		</header>
	);
}
