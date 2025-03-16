"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export function CardSkeleton() {
	return (
		<Card className="h-full flex flex-col">
			<CardHeader className="pb-2 sm:pb-4">
				<div className="flex items-center gap-2">
					<div className="w-5 h-5 bg-muted rounded-full animate-pulse" />
					<div className="h-6 bg-muted rounded w-1/2 animate-pulse" />
				</div>
				<div className="h-4 bg-muted rounded w-3/4 mt-2 animate-pulse" />
			</CardHeader>
			<CardContent className="pb-2 sm:pb-4 flex-grow">
				<div className="h-12 bg-muted rounded animate-pulse" />
			</CardContent>
			<CardFooter className="pt-0">
				<div className="h-9 bg-muted rounded w-full animate-pulse" />
			</CardFooter>
		</Card>
	);
}
