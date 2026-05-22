import React, { useState } from "react";
import {
	useCreateTaskMutation,
	useGetTasksQuery,
	useToggleTaskCompletedMutation,
	useDeleteTaskMutation,
	useUpdateTaskMutation,
} from "../../api/api.ts";
import Calendar from "../calendar/calendar.tsx";
import "./taskManage.scss";
import Popup from "../popup/popup.tsx";
import Header from "../header/header.tsx";
import { navLinks } from "../header/headerData.ts";
import type { userTaskClient } from "../../../../server/types/tasks.ts";
import deleteIcon from "../../assets/delete.svg";
import { Link } from "react-router-dom";

const TaskManagePage = () => {
	const [showCreatePanel, setShowCreatePanel] = useState(false);
	const [title, setTitle] = useState("");
	const [text, setText] = useState("");
	const [filter, setFilter] = useState<
		"all" | "completed" | "pending" | "overdue"
	>("all");
	const [selectedDueToDate, setSelectedDueToDate] = useState<Date | null>(null);
	const [selectedRemindDate, setSelectedRemindDate] = useState<Date | null>(
		null,
	);
	const [dueToTime, setDueToTime] = useState("");

	const [editTaskData, setEditTaskData] = useState<userTaskClient | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [editText, setEditText] = useState("");
	const [editDueToDate, setEditDueToDate] = useState<Date | null>(null);
	const [editRemindDate, setEditRemindDate] = useState<Date | null>(null);
	const [editDueToTime, setEditDueToTime] = useState("");

	const [deleteTask] = useDeleteTaskMutation();
	const [createTask] = useCreateTaskMutation();
	const [updateTask] = useUpdateTaskMutation();
	const [toggleTaskCompleted] = useToggleTaskCompletedMutation();
	const { data, isLoading, error } = useGetTasksQuery();
	const tasks: userTaskClient[] = data?.tasks || [];

	const combineDateAndTime = (
		date: Date | null,
		timeStr: string,
	): Date | undefined => {
		if (!date || !timeStr) return undefined;
		const [hours, minutes] = timeStr.split(":").map(Number);
		const combined = new Date(date);
		combined.setHours(hours);
		combined.setMinutes(minutes);
		combined.setSeconds(0);
		combined.setMilliseconds(0);
		return combined;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const dueTo = combineDateAndTime(selectedDueToDate, dueToTime);
		const remindToDo = combineDateAndTime(selectedRemindDate, dueToTime);

		if (dueTo && remindToDo && remindToDo > dueTo) {
			alert("Дата напоминания не может быть позже дедлайна!");
			return;
		}

		try {
			await createTask({
				taskTitle: title,
				fullTaskText: text,
				DueTo: dueTo,
				whenRemindToDo: remindToDo,
			}).unwrap();

			setTitle("");
			setText("");
			setSelectedDueToDate(null);
			setSelectedRemindDate(null);
			setDueToTime("");
			setShowCreatePanel(false);
		} catch (err) {
			console.error("Ошибка создания задачи", err);
			alert("Ошибка создания задачи: " + JSON.stringify(err));
		}
	};

	const getFilteredTasks = (): userTaskClient[] => {
		if (filter === "all") return tasks;
		return tasks.filter((task) => task.status === filter);
	};

	const handleOpenEdit = (task: userTaskClient) => {
		setEditTaskData(task);
		setEditTitle(task.taskTitle);
		setEditText(task.fullTaskText);
		setEditDueToDate(task.DueTo ? new Date(task.DueTo) : null);
		setEditRemindDate(
			task.whenRemindToDo ? new Date(task.whenRemindToDo) : null,
		);
		setEditDueToTime(
			task.DueTo
				? new Date(task.DueTo).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})
				: "",
		);
	};

	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editTaskData) return;

		const dueTo = combineDateAndTime(editDueToDate, editDueToTime);
		const remindToDo = combineDateAndTime(editRemindDate, editDueToTime);

		if (dueTo && remindToDo && remindToDo > dueTo) {
			alert("Дата напоминания не может быть позже дедлайна!");
			return;
		}

		try {
			await updateTask({
				taskId: editTaskData._id.toString(),
				data: {
					taskTitle: editTitle,
					fullTaskText: editText,
					DueTo: dueTo,
					whenRemindToDo: remindToDo,
				},
			}).unwrap();
			setEditTaskData(null);
		} catch (err) {
			console.error("Ошибка обновления задачи", err);
			alert("Ошибка обновления задачи: " + JSON.stringify(err));
		}
	};

	return (
		<>
			<Header navLinks={navLinks} />

			<div className="task-manage-container">
				<button
					onClick={() => setShowCreatePanel(true)}
					className="btn-show-panel">
					Создать новую задачу
				</button>

				<div className="task-filter">
					{["all", "pending", "completed", "overdue"].map((f) => (
						<button
							key={f}
							onClick={() => setFilter(f as any)}
							className={filter === f ? "active" : ""}>
							{f === "all"
								? "Все"
								: f === "pending"
									? "В процессе"
									: f === "completed"
										? "Завершено"
										: "Просрочено"}
						</button>
					))}
				</div>

				{showCreatePanel && (
					<Popup onClose={() => setShowCreatePanel(false)}>
						<div className="task-create-panel">
							<form
								onSubmit={handleSubmit}
								className="form__task_creation">
								<input
									type="text"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder="Заголовок задачи"
									className="input__task_creation_data"
									required
								/>
								<input
									type="text"
									value={text}
									onChange={(e) => setText(e.target.value)}
									placeholder="Полный текст задачи"
									className="input__task_creation_data"
									required
								/>
								<Calendar
									selectedDate={selectedDueToDate}
									setSelectedDate={setSelectedDueToDate}
									placeholder="Дедлайн"
								/>
								<Calendar
									selectedDate={selectedRemindDate}
									setSelectedDate={setSelectedRemindDate}
									placeholder="Напомнить с..."
								/>
								<input
									type="time"
									value={dueToTime}
									onChange={(e) => setDueToTime(e.target.value)}
									className="input__task_creation_data"
								/>
								<div className="task-form-buttons">
									<button
										type="submit"
										className="btn-submit-task">
										Создать
									</button>
									<button
										type="button"
										className="btn-cancel-task"
										onClick={() => setShowCreatePanel(false)}>
										Отмена
									</button>
								</div>
							</form>
						</div>
					</Popup>
				)}

				{editTaskData && (
					<Popup onClose={() => setEditTaskData(null)}>
						<div className="task-create-panel">
							<form
								onSubmit={handleEditSubmit}
								className="form__task_creation">
								<input
									type="text"
									value={editTitle}
									onChange={(e) => setEditTitle(e.target.value)}
									placeholder="Заголовок задачи"
									className="input__task_creation_data"
								/>
								<input
									type="text"
									value={editText}
									onChange={(e) => setEditText(e.target.value)}
									placeholder="Полный текст задачи"
									className="input__task_creation_data"
								/>
								<Calendar
									selectedDate={editDueToDate}
									setSelectedDate={setEditDueToDate}
									placeholder="Дедлайн"
								/>
								<Calendar
									selectedDate={editRemindDate}
									setSelectedDate={setEditRemindDate}
									placeholder="Напомнить с..."
								/>
								<input
									type="time"
									value={editDueToTime}
									onChange={(e) => setEditDueToTime(e.target.value)}
									className="input__task_creation_data"
								/>
								<div className="task-form-buttons">
									<button
										type="submit"
										className="btn-submit-task">
										Сохранить
									</button>
									<button
										type="button"
										className="btn-cancel-task"
										onClick={() => setEditTaskData(null)}>
										Отмена
									</button>
								</div>
							</form>
						</div>
					</Popup>
				)}

				{isLoading && <p>Загрузка задач...</p>}
				{error && <p>Ошибка загрузки задач</p>}

				<div className="task-list">
					{getFilteredTasks().length > 0 ? (
						getFilteredTasks().map((task: userTaskClient) => (
							<div
								className={`task-card ${
									task.status === "completed" ? "completed-task" : ""
								}`}
								key={task._id.toString()}>
								<div className="card-header-block">
									<Link
										to={`/task-manage/${task._id}`}
										className="card-title">
										{task.taskTitle}
									</Link>
								</div>

								<div className="card-body">
									{task.fullTaskText && (
										<p className="task-text">{task.fullTaskText}</p>
									)}
									{task.DueTo && (
										<p className="date">
											<span>📅 Дедлайн:</span>{" "}
											{new Date(task.DueTo).toLocaleString([], {
												hour: "2-digit",
												minute: "2-digit",
												day: "2-digit",
												month: "2-digit",
											})}
										</p>
									)}
									{task.whenRemindToDo && (
										<p className="date">
											<span>⏰ Напомнить:</span>{" "}
											{new Date(task.whenRemindToDo).toLocaleDateString()}
										</p>
									)}
									<p className="status-text">
										Статус:{" "}
										<span className={`task-${task.status}`}>
											{task.status === "completed"
												? "Завершено"
												: task.status === "pending"
													? "В процессе"
													: "Просрочено"}
										</span>
									</p>
								</div>

								<div className="options__with_tasks">
									<label className="change-task-state">
										<input
											type="checkbox"
											checked={task.status === "completed"}
											onChange={async () =>
												await toggleTaskCompleted(task._id.toString())
											}
										/>
									</label>
									<button
										onClick={() => handleOpenEdit(task)}
										className="edit-task">
										Изменить
									</button>
									<div
										className="delete-task"
										onClick={async () => await deleteTask(task._id.toString())}>
										<img
											src={deleteIcon}
											alt="Удалить"
										/>
									</div>
								</div>
							</div>
						))
					) : (
						<p className="no-tasks">Задачи не найдены</p>
					)}
				</div>
			</div>
		</>
	);
};

export default TaskManagePage;
