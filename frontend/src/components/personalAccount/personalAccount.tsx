import { useRef } from "react";
import "./personalAccount.scss";
import Header from "../header/header";
import { navLinks } from "../header/headerData.ts";
import {
	useGetStatisticsQuery,
	useGetUserQuery,
	useUploadAvatarMutation,
} from "../../api/api.ts";
import defaultAvatar from "../../assets/avatar.png";

const backendBaseUrl = "http://localhost:3001";

const PersonalAccountPage = () => {
	const { data: userData, isLoading: isUserLoading } = useGetUserQuery();
	const { data: statsData, isLoading: isStatsLoading } =
		useGetStatisticsQuery();
	const [uploadAvatar, { isLoading: isUploading }] = useUploadAvatarMutation();
	const fileInputRef = useRef<HTMLInputElement>(null);

	if (isUserLoading || isStatsLoading) {
		return <p>Загрузка...</p>;
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files && e.target.files[0]) {
			const formData = new FormData();
			formData.append("avatar", e.target.files[0]);

			try {
				await uploadAvatar(formData).unwrap();
			} catch (err) {
				console.error("Ошибка загрузки аватара:", err);
			}
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	return (
		<>
			<Header navLinks={navLinks} />
			<main>
				<div className="personal_account__container">
					<div className="personal_info__container">
						<h2 className="username">Здравствуйте, {userData?.name}</h2>
						<img
							src={
								userData?.avatar
									? `${backendBaseUrl}${userData.avatar}`
									: defaultAvatar
							}
							alt="Аватар пользователя"
							className="avatar"
						/>
						<button
							onClick={triggerFileInput}
							disabled={isUploading}>
							{isUploading ? "Загрузка..." : "Загрузить аватар"}
						</button>
						<input
							type="file"
							ref={fileInputRef}
							style={{ display: "none" }}
							accept="image/*"
							onChange={handleFileChange}
						/>
					</div>
					<div className="statistics__container">
						<h3 className="statistics__container_title">
							Статистика {userData?.name} по задачам.
						</h3>
						<ul className="user__statistics_list">
							<li className="user__statistics_list_item">
								Просрочено: {statsData?.statistics.overDuedTasks}
							</li>
							<li className="user__statistics_list_item">
								Выполнено:
								{statsData?.statistics.completedTasks}
							</li>
							<li className="user__statistics_list_item">
								В процессе: {statsData?.statistics.pendingTasks}
							</li>
							<li className="user__statistics_list_item">
								Всего создано:
								{statsData?.statistics.amountOfAllTasksEverMadeByUser}
							</li>
						</ul>
					</div>
				</div>
			</main>
		</>
	);
};

export default PersonalAccountPage;
