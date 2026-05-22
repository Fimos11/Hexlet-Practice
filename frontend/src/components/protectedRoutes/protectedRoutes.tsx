import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import "./protectedRoutes.scss";
import Popup from "../popup/popup.tsx";
import { useAuth } from "../../providers/AuthProvider.tsx";

const ProtectedRoutes = ({ children }: { children: ReactNode }) => {
	const { user, loading } = useAuth();
	const [showBotPopup, setShowBotPopup] = useState(false);

	useEffect(() => {
		if (user?.didUserInteractWithBot) {
			setShowBotPopup(true);
		}
	}, [user]);

	if (loading) {
		return (
			<div className="loading">
				<div className="spinner"></div>
			</div>
		);
	}

	return user ? (
		<>
			{showBotPopup && (
				<Popup onClose={() => setShowBotPopup(false)}>
					<h2 className="bot-title">Привет 👋</h2>
					<p>
						Пожалуйста, перейди к Telegram-боту и напиши ему любое сообщение,
						чтобы завершить регистрацию.
					</p>
					<a
						href="https://t.me/Schedule_TaskManager_bot"
						target="_blank"
						rel="noopener noreferrer"
						className="popup__bot-link">
						Перейти к боту
					</a>
				</Popup>
			)}
			{children}
		</>
	) : (
		<Navigate
			to="/login"
			replace
		/>
	);
};

export default ProtectedRoutes;
