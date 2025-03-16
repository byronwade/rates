"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export interface CalculatorCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	href: string;
	category: string;
}

export function CalculatorCard({ icon, title, description, href, category }: CalculatorCardProps) {
	return (
		<Card className="h-full flex flex-col transition-all duration-200 hover:shadow-md">
			<CardHeader className="pb-2 sm:pb-4">
				<div className="flex items-center gap-2">
					{icon}
					<CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
				</div>
				<CardDescription className="text-xs sm:text-sm">{description}</CardDescription>
			</CardHeader>
			<CardContent className="pb-2 sm:pb-4 flex-grow">
				<div className="flex flex-wrap gap-2">
					<div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 capitalize">{category}</div>
				</div>
			</CardContent>
			<CardFooter className="pt-0">
				<Button asChild className="w-full text-sm sm:text-base">
					<Link href={href}>Calculate Rates</Link>
				</Button>
			</CardFooter>
		</Card>
	);
}
