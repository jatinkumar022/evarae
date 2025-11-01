'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: 'sm' | 'md' | 'lg';
	showCloseButton?: boolean;
};

const sizeToMaxWidth: Record<NonNullable<ModalProps['size']>, string> = {
	sm: 'sm:max-w-md',
	md: 'sm:max-w-lg',
	lg: 'sm:max-w-2xl',
};

export default function Modal({
	isOpen,
	onClose,
	title,
	children,
	footer,
	size = 'md',
	showCloseButton = true,
}: ModalProps) {
	// Prevent background scrolling when modal is open
	useEffect(() => {
		if (isOpen) {
			// Save original overflow style
			const originalStyle = window.getComputedStyle(document.body).overflow;
			// Disable scrolling
			document.body.style.overflow = 'hidden';
			
			return () => {
				// Restore original overflow style on cleanup
				document.body.style.overflow = originalStyle;
			};
		}
	}, [isOpen]);

	// Handle ESC key to close modal
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			return () => {
				document.removeEventListener('keydown', handleEscape);
			};
		}
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div 
			className="fixed inset-0 z-50 overflow-hidden" 
			role="dialog" 
			aria-modal="true"
			aria-labelledby={title ? 'modal-title' : undefined}
		>
			{/* Backdrop with blur - non-clickable overlay */}
			<div
				className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Modal Container - bottom on mobile, centered on desktop */}
			<div className="fixed inset-0 flex items-end sm:items-center justify-center p-2 sm:p-4 pointer-events-none">
				{/* Modal Panel */}
				<div
					className={`relative z-50 w-full ${sizeToMaxWidth[size]} max-h-[90vh] sm:max-h-[85vh] flex flex-col pointer-events-auto bg-white dark:bg-[#242424] shadow-xl border-t sm:border border-gray-200 dark:border-[#2f2f2f] rounded-xl overflow-hidden transform transition-all duration-300 ease-out`}
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					{(title || showCloseButton) && (
						<div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-[#2f2f2f]">
							{title && (
								<h3 
									id="modal-title"
									className="text-lg font-semibold text-gray-900 dark:text-white"
								>
									{title}
								</h3>
							)}
							{!title && <span />}
							{showCloseButton && (
								<button
									onClick={onClose}
									className="ml-auto rounded-md p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-[#2a2a2a] transition-colors"
									aria-label="Close dialog"
								>
									<X className="h-5 w-5" />
								</button>
							)}
						</div>
					)}

					{/* Content - scrollable */}
					<div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
						{children}
					</div>

					{/* Footer */}
					{footer && (
						<div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-[#2f2f2f] bg-gray-50 dark:bg-[#1e1e1e] flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
							{footer}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}


