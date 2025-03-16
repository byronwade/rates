"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calculator, Home, Building2, Warehouse, ChevronRight, ListFilter, ClipboardList } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarRail } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
	const pathname = usePathname();

	const calculatorItems = [
		{
			title: "Residential Plumbing",
			url: "/calculators/residential-plumbing",
			icon: Home,
		},
		{
			title: "Commercial Plumbing",
			url: "/calculators/commercial-plumbing",
			icon: Building2,
		},
		{
			title: "Property Management",
			url: "/calculators/property-management",
			icon: Warehouse,
		},
		{
			title: "Septic Service",
			url: "/calculators/septic-service",
			icon: Calculator,
		},
		{
			title: "Single Family Service",
			url: "/calculators/single-family-service",
			icon: Home,
		},
	];

	const navItems = [
		{
			title: "Rate Calculators",
			url: "/calculators",
			icon: Calculator,
			isActive: pathname.startsWith("/calculators"),
			items: calculatorItems.map((item) => ({
				title: item.title,
				url: item.url,
			})),
		},
		{
			title: "Estimates",
			url: "/estimates",
			icon: ClipboardList,
			isActive: pathname.startsWith("/estimates"),
			items: [
				{
					title: "All Estimates",
					url: "/estimates",
				},
				{
					title: "Create New",
					url: "/estimates/new",
				},
			],
		},
		{
			title: "Analysis",
			url: "/analysis",
			icon: ListFilter,
			isActive: pathname.startsWith("/analysis"),
			items: [
				{
					title: "Rate Comparison",
					url: "/calculators/comparison",
				},
				{
					title: "Profit Analysis",
					url: "/calculators/analysis",
				},
			],
		},
	];

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<div className="px-2 py-2">
					<h2 className="px-4 text-lg font-semibold">Rate Tools</h2>
				</div>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Navigation</SidebarGroupLabel>
					<SidebarMenu>
						{navItems.map((item) => (
							<Collapsible key={item.title} asChild defaultOpen={item.isActive} className="group/collapsible">
								<SidebarMenuItem>
									<CollapsibleTrigger asChild>
										<SidebarMenuButton tooltip={item.title}>
											{item.icon && <item.icon />}
											<span>{item.title}</span>
											<ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<SidebarMenuSub>
											{item.items?.map((subItem) => (
												<SidebarMenuSubItem key={subItem.title}>
													<SidebarMenuSubButton asChild isActive={pathname === subItem.url}>
														<Link href={subItem.url}>
															<span>{subItem.title}</span>
														</Link>
													</SidebarMenuSubButton>
												</SidebarMenuSubItem>
											))}
										</SidebarMenuSub>
									</CollapsibleContent>
								</SidebarMenuItem>
							</Collapsible>
						))}
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<div className="px-4 py-2 text-xs text-muted-foreground">Rate Calculator v1.0</div>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
