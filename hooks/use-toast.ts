// Adapted from shadcn/ui toast component
import { useState } from "react";

interface ToastProps {
	id?: string;
	title?: string;
	description?: string;
	action?: React.ReactNode;
	status?: "default" | "success" | "error" | "warning";
}

export function useToast() {
	const [toasts, setToasts] = useState<ToastProps[]>([]);

	const toast = (props: ToastProps) => {
		const id = Math.random().toString(36).substring(2, 9);
		setToasts((prevToasts) => [...prevToasts, { ...props, id }]);

		// Auto dismiss after 5 seconds
		setTimeout(() => {
			setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
		}, 5000);

		return id;
	};

	const dismiss = (id: string) => {
		setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
	};

	return {
		toast,
		dismiss,
		toasts,
	};
}
