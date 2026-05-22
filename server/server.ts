import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import path from "path";
import dotenv from "dotenv";
import { dirname } from "path";
import { fileURLToPath } from "url";
import { DateTime } from "luxon";
import { Telegraf } from "telegraf";
import { TaskStatus } from "@prisma/client";

import prisma from "./prismaClient";
import authRoutes from "./routes/authRoutes.ts";
import taskRoutes from "./routes/taskRoutes.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

const databaseURL = process.env.DATABASE_URL ?? "";
const telegramToken = process.env.TELEGRAM_BOT_TOKEN ?? "";
const secretEncoding = process.env.SECRET_JWT_ENCODING ?? "";

const missingEnvVars = [];
if (!databaseURL) missingEnvVars.push("DATABASE_URL");
if (!telegramToken) missingEnvVars.push("TELEGRAM_BOT_TOKEN");
if (!secretEncoding) missingEnvVars.push("SECRET_JWT_ENCODING");

if (missingEnvVars.length > 0) {
	console.error(
		`Missing required environment variables: ${missingEnvVars.join(", ")}`,
	);
	process.exit(1);
}

const app = express();
const bot = new Telegraf(telegramToken);
const PORT = 3001;

bot.start(async (ctx) => {
	try {
		const username = ctx.message.from.username;
		const chatId = ctx.message.from.id;

		if (!username) {
			ctx.reply(
				"У вашего аккаунта отсутствует username в настройках Telegram.",
			);
			return;
		}

		await prisma.user.update({
			where: { userTelegram: `@${username}` },
			data: {
				didUserInteractWithBot: true,
				userTelegramChatId: BigInt(chatId),
			},
		});
		ctx.reply("Регистрация была завершена, поздравляем вас!");
	} catch (err) {
		console.error(err);
		ctx.reply(
			"Что-то пошло не так при подтверждении вашего телеграмм аккаунта.",
		);
	}
});

cron.schedule("* * * * *", async () => {
	const nowUtc = DateTime.utc().toJSDate();
	const todayStr = DateTime.utc().toISODate();

	try {
		const remindWindowStart = DateTime.utc().toJSDate();
		const remindWindowEnd = DateTime.utc().plus({ hours: 1 }).toJSDate();

		const changeBackToPending = await prisma.task.findMany({
			where: {
				dueTo: { gt: nowUtc },
				status: TaskStatus.overdue,
			},
		});

		for (const backToPendingTask of changeBackToPending) {
			await prisma.$transaction([
				prisma.task.update({
					where: { id: backToPendingTask.id },
					data: { status: TaskStatus.pending },
				}),
				prisma.taskStatistic.update({
					where: { referredToUserId: backToPendingTask.madeByUserId },
					data: {
						overduedTasks: { decrement: 1 },
						pendingTasks: { increment: 1 },
					},
				}),
			]);
		}

		const overDuedTasks = await prisma.task.findMany({
			where: {
				dueTo: { lt: nowUtc },
				status: TaskStatus.pending,
			},
		});

		for (const overDuedTask of overDuedTasks) {
			await prisma.$transaction([
				prisma.task.update({
					where: { id: overDuedTask.id },
					data: { status: TaskStatus.overdue },
				}),
				prisma.taskStatistic.update({
					where: { referredToUserId: overDuedTask.madeByUserId },
					data: {
						overduedTasks: { increment: 1 },
						pendingTasks: { decrement: 1 },
					},
				}),
			]);
		}

		const tasks = await prisma.task.findMany({
			where: {
				whenRemindToDo: { gte: remindWindowStart, lte: remindWindowEnd },
				dueTo: { gte: nowUtc },
				status: TaskStatus.pending,
			},
			include: { madeByUser: true },
		});

		for (const task of tasks) {
			const user = task.madeByUser;
			if (!user || !user.didUserInteractWithBot || !user.userTelegramChatId)
				continue;

			const lastNotifiedDate = task.lastTimeNotified
				? DateTime.fromJSDate(task.lastTimeNotified).toISODate()
				: null;
			if (lastNotifiedDate === todayStr) continue;

			const dueTo = task.dueTo ? DateTime.fromJSDate(task.dueTo) : null;
			if (!dueTo) continue;

			const remaining = dueTo
				.diff(DateTime.utc(), ["days", "hours", "minutes"])
				.toObject();
			const { days = 0, hours = 0, minutes = 0 } = remaining;

			const parts = [];
			if (days > 0) parts.push(`${Math.floor(days)} дн.`);
			if (hours > 0) parts.push(`${Math.floor(hours)} ч.`);
			if (minutes > 0) parts.push(`${Math.floor(minutes)} мин.`);

			await bot.telegram.sendMessage(
				user.userTelegramChatId.toString(),
				`🔔 Привет! У тебя есть задача: "${task.taskTitle}". До дедлайна осталось: ${parts.join(" ") || "менее минуты"}`,
			);

			await prisma.task.update({
				where: { id: task.id },
				data: { lastTimeNotified: nowUtc },
			});
		}
	} catch (err) {
		console.error("Ошибка в напоминалке:", err);
	}
});

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());

app.use("/uploads", express.static(path.resolve(__dirname, "uploads")));

app.use(authRoutes);
app.use(taskRoutes);

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
bot.launch();
