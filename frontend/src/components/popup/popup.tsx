import { useEffect, type ReactNode } from "react";
import "./popup.scss";

type PopupProps = {
	children: ReactNode;
	onClose: () => void;
};

const Popup = ({ children, onClose }: PopupProps) => {
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("keydown", handleEsc);
		return () => {
			document.removeEventListener("keydown", handleEsc);
		};
	}, [onClose]);

	return (
		<div
			className="popup__wrapper"
			onClick={onClose}>
			<div
				className="popup__content"
				onClick={(e) => e.stopPropagation()}>
				<button
					className="popup__close"
					onClick={onClose}>
					&times;
				</button>
				{children}
			</div>
		</div>
	);
};

export default Popup;
