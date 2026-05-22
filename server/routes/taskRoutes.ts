import { Router } from "express";
import { DateTime } from "luxon";
import { TaskStatus } from "@prisma/client";
import prisma from "../prismaClient";
import { authMiddleware } from "../utils/checkAuth";
import avatarUpload from "../uploads/avatarUpload";
import type { AuthRequest } from "../utils/checkAuth";
import type { Response } from "express";

const router = Router();

router.get(
	"/get-tasks",
	authMiddleware,
	async (req: AuthRequest, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			res.status(401).json({ message: "Попробуйте зайти заново" });
			return;
		}
		try {
			const userTasks = await prisma.task.findMany({
				where: { madeByUserId: userId },
			});
			res.status(200).json({ tasks: userTasks });
		} catch (err) {
			res.status(500).json({ message: "Ошибка сервера" });
		}
	},
);

router.get(
	"/task/:id",
	authMiddleware,
	async (req: AuthRequest, res: Response) => {
		const userId = req.user?.id;
		const taskId = req.params.id;
		try {
			const task = await prisma.task.findUnique({ where: { id: taskId } });
			if (!task) {
				res.status(404).json({ message: "Задача не найдена" });
				return;
			}
			if (task.madeByUserId !== userId) {
				res.status(403).json({ message: "Нет доступа" });
				return;
			}
			res.json({ task });
		} catch (error) {
			res.status(500).json({ message: "Ошибка сервера" });
		}
	},
);

router.get(
	"/get-statistics",
	authMiddleware,
	async (req: AuthRequest, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			res.status(401).json({ message: "Пользователь не найден." });
			return;
		}
		try {
			const stats = await prisma.taskStatistic.findUnique({
				where: { referredToUserId: userId },
			});
			res.status(200).json({ statistics: stats });
		} catch (err) {
			res.status(500).json({ message: "Ошибка сервера" });
		}
	},
);

router.post(
	"/upload-avatar",
	authMiddleware,
	avatarUpload.single("avatar"),
	async (req: AuthRequest, res: Response) => {
		try {
			if (!req.file) {
				res.status(400).json({ message: "Файл не загружен" });
				return;
			}
			const userId = req.user?.id;
			if (!userId) {
				res.status(401).json({ message: "Нет доступа" });
				return;
			}
			const avatarPath = `/uploads/avatars/${req.file.filename}`;
			await prisma.user.update({
				where: { id: userId },
				data: { avatar: avatarPath },
			});
			res
				.status(200)
				.json({ message: "Аватар успешно обновлён", avatar: avatarPath });
		} catch (err) {
			res.status(500).json({ message: "Ошибка сервера" });
		}
	},
);

router.post(
	"/create-new-task",
	authMiddleware,
	async (req: AuthRequest, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			res.status(401).json({ message: "Попробуйте зайти заново" });
			return;
		}
		try {
			const user = await prisma.user.findUnique({ where: { id: userId } });
			const { fullTaskText, taskTitle, whenRemindToDo, dueTo } = req.body;

			if (!fullTaskText || !taskTitle) {
				res
					.status(400)
					.json({ message: "Необходимо указать заголовок и текст задачи" });
				return;
			}

			const whenRemindUTC = whenRemindToDo
				? DateTime.fromJSDate(new Date(whenRemindToDo), {
						zone: user?.timezone,
					})
						.toUTC()
						.toJSDate()
				: null;

			const dueToUTC = dueTo
				? DateTime.fromJSDate(new Date(dueTo), { zone: user?.timezone })
						.toUTC()
						.toJSDate()
				: new Date();

			const newTask = await prisma.task.create({
				data: {
					fullTaskText,
					taskTitle,
					whenRemindToDo: whenRemindUTC,
					dueTo: dueToUTC,
					madeByUserId: userId,
					status: TaskStatus.pending,
				},
			});

			await prisma.taskStatistic.update({
				where: { referredToUserId: userId },
				data: {
					amountOfAllTasksEverMadeByUser: { increment: 1 },
					pendingTasks: { increment: 1 },
				},
			});

			res.status(201).json({ message: "Задача создана", task: newTask });
		} catch (err) {
			res.status(500).json({ message: "Ошибка при создании задачи" });
		}
	},
);

router.patch(
	"/task/:id/toggle",
	authMiddleware,
	async (req: AuthRequest, res: Response) => {
		try {
			const taskId = req.params.id;
			const userId = req.user?.id;
			const task = await prisma.task.findUnique({ where: { id: taskId } });

			if (!task) {
				res.status(404).json({ message: "Задача не найдена" });
				return;
			}
			if (task.madeByUserId !== userId) {
				res.status(403).json({ message: "Доступ запрещён" });
				return;
			}

			const isCompleted = task.status === TaskStatus.completed;
			const now = new Date();
			if (task.dueTo && now > task.dueTo) {
				res
					.status(400)
					.json({ message: "Нельзя менять статус просроченной задачи" });
				return;
			}

			const updatedStatus = isCompleted
				? TaskStatus.pending
				: TaskStatus.completed;

			const updatedTask = await prisma.task.update({
				where: { id: taskId },
				data: { status: updatedStatus },
			});

			await prisma.taskStatistic.update({
				where: { referredToUserId: task.madeByUserId },
				data: {
					pendingTasks: isCompleted ? { increment: 1 } : { decrement: 1 },
					completedTasks: isCompleted ? { decrement: 1 } : { increment: 1 },
				},
			});

			res
				.status(200)
				.json({ task: updatedTask, message: "Статус задачи изменён" });
		} catch (err) {
			res.status(500).json({ message: "Ошибка при изменении статуса" });
		}
	},
);

router.delete(
	"/task/:id/delete",
	authMiddleware,
	async (req: AuthRequest, res) => {
		try {
			const taskId = req.params.id;
			const userId = req.user?.id;
			const task = await prisma.task.findUnique({ where: { id: taskId } });

			if (!task) {
				res.status(404).json({ message: "Задача не найдена" });
				return;
			}
			if (task.madeByUserId !== userId) {
				res.status(403).json({ message: "Доступ запрещён" });
				return;
			}

			const updateData: any = {
				amountOfAllTasksEverMadeByUser: { decrement: 1 },
			};

			switch (task.status) {
				case TaskStatus.completed:
					updateData.completedTasks = { decrement: 1 };
					break;
				case TaskStatus.overdue:
					updateData.overduedTasks = { decrement: 1 };
					break;
				case TaskStatus.pending:
				default:
					updateData.pendingTasks = { decrement: 1 };
					break;
			}

			await prisma.taskStatistic.update({
				where: { referredToUserId: task.madeByUserId },
				data: updateData,
			});

			await prisma.task.delete({ where: { id: taskId } });
			res.status(200).json({ message: "Задача удалена" });
		} catch (err) {
			res.status(500).json({ message: "Ошибка при удалении задачи" });
		}
	},
);

router.patch(
	"/change-task-params/:id",
	authMiddleware,
	async (req: AuthRequest, res: Response) => {
		try {
			const taskId = req.params.id;
			const userId = req.user?.id;
			const task = await prisma.task.findUnique({ where: { id: taskId } });

			if (!task) {
				res.status(404).json({ message: "Задача не найдена" });
				return;
			}
			if (task.madeByUserId !== userId) {
				res.status(403).json({ message: "Доступ запрещён" });
				return;
			}

			const { taskTitle, fullTaskText, whenRemindToDo, dueTo, status } =
				req.body;
			const updateData: any = {};

			if (taskTitle !== undefined) updateData.taskTitle = taskTitle;
			if (fullTaskText !== undefined) updateData.fullTaskText = fullTaskText;
			if (whenRemindToDo !== undefined)
				updateData.whenRemindToDo = whenRemindToDo
					? new Date(whenRemindToDo)
					: null;
			if (dueTo !== undefined) updateData.dueTo = new Date(dueTo);
			if (status !== undefined) updateData.status = status;

			if (Object.keys(updateData).length === 0) {
				res.status(400).json({ message: "Нет данных для обновления" });
				return;
			}

			await prisma.task.update({
				where: { id: taskId },
				data: updateData,
			});

			res.status(200).json({ message: "Задача успешно обновлена" });
		} catch (err) {
			res.status(500).json({ message: `Ошибка сервера: ${err}` });
		}
	},
);

export default router;
