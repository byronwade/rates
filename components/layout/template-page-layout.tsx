"use client";

import { ReactNode } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/header";

interface TemplatePageLayoutProps {
	children: ReactNode;
}

export function TemplatePageLayout({ children }: TemplatePageLayoutProps) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="p-0 flex flex-col w-full">
				<Header />
				<div className="flex flex-1 flex-col w-full">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
