import Header from "../header/header";
import "./taskDetails.scss";
import { navLinks } from "../header/headerData";
import { useGetTaskByIdQuery } from "../../api/api";
import { useParams } from "react-router-dom";

const TaskDetailsPage = () => {
	const { id } = useParams<{ id: string }>();
	const { data, error, isLoading } = useGetTaskByIdQuery(id ?? "");

	const task = data?.task;

	return (
		<>
			<Header navLinks={navLinks} />
			<div className="task-details-container">
				{isLoading && <p>Загрузка задачи...</p>}
				{error && <p>Ошибка загрузки задачи</p>}
				{task && (
					<div className="task-details-card">
						<h1 className="task-title">{task.taskTitle}</h1>
						<p className="task-fulltext">{task.fullTaskText}</p>
						{task.DueTo && (
							<p className="task-date">
								📅 Дедлайн:{" "}
								{new Date(task.DueTo).toLocaleDateString()}
							</p>
						)}
						{task.whenRemindToDo && (
							<p className="task-date">
								⏰ Напомнить:{" "}
								{new Date(
									task.whenRemindToDo
								).toLocaleDateString()}
							</p>
						)}
						<p className="task-status">
							Статус:
							<span className={`task-${task.status}`}>
								{task.status === "completed"
									? " Завершено"
									: task.status === "pending"
									? "В процессе"
									: "Просрочено"}
							</span>
						</p>
					</div>
				)}
			</div>
		</>
	);
};

export default TaskDetailsPage;
