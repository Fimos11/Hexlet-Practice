import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import prisma from "../prismaClient";
import { loginValidator, registrationValidator } from "../utils/authValidator";
import { authMiddleware } from "../utils/checkAuth";
import type { AuthRequest } from "../utils/checkAuth";
import type { Request, Response } from "express";
import type { RegisterAccountBody, LoginAccountBody } from "../types/user";

const router = Router();
const secretEncoding = process.env.SECRET_JWT_ENCODING ?? "";

router.post(
	"/account-registration",
	registrationValidator,
	async (req: Request<{}, {}, RegisterAccountBody>, res: Response) => {
		try {
			const errors = validationResult(req);
			const { name, email, password, userTelegram } = req.body;

			if (!errors.isEmpty()) {
				res.status(400).json({
					success: false,
					message: "Ошибка валидации",
					errors: errors.array(),
				});
				return;
			}

			const existingUser = await prisma.user.findUnique({ where: { email } });
			if (existingUser) {
				res.status(400).json({ message: "Логин уже занят" });
				return;
			}

			const hashedPassword = await bcrypt.hash(password, 12);

			const savedUser = await prisma.user.create({
				data: {
					name,
					email,
					password: hashedPassword,
					userTelegram,
					didUserInteractWithBot: false,
					taskStatistic: { create: {} },
				},
			});

			const { password: _, userTelegramChatId, ...userData } = savedUser;
			const token = jwt.sign(
				{ id: savedUser.id, email: savedUser.email },
				secretEncoding,
				{ expiresIn: "7d" },
			);

			res
				.cookie("token", token, {
					httpOnly: true,
					secure: false,
					sameSite: "lax",
					maxAge: 15 * 24 * 60 * 60 * 1000,
				})
				.status(200)
				.json({
					success: true,
					message: "Регистрация прошла успешно",
					user: {
						...userData,
						userTelegramChatId: userTelegramChatId?.toString(),
					},
				});
		} catch (err) {
			res.status(500).json({ message: `Ошибка при регистрации: ${err}` });
		}
	},
);

router.post(
	"/account-login",
	loginValidator,
	async (req: Request<{}, {}, LoginAccountBody>, res: Response) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				res.status(400).json({ success: false, errors: errors.array() });
				return;
			}

			const { email, password } = req.body;
			const user = await prisma.user.findUnique({ where: { email } });
			if (!user) {
				res.status(400).json({ message: "Пользователь не найден." });
				return;
			}
			const isPasswordValid = await bcrypt.compare(password, user.password);
			if (!isPasswordValid) {
				res.status(400).json({ message: "Неверный пароль" });
				return;
			}
			const token = jwt.sign(
				{ id: user.id, email: user.email },
				secretEncoding,
				{ expiresIn: "7d" },
			);

			const { password: _, userTelegramChatId, ...userData } = user;

			res
				.cookie("token", token, {
					httpOnly: true,
					secure: false,
					sameSite: "lax",
					maxAge: 15 * 24 * 60 * 60 * 1000,
				})
				.status(200)
				.json({
					success: true,
					user: {
						...userData,
						userTelegramChatId: userTelegramChatId?.toString(),
					},
				});
		} catch (err) {
			res.status(500).json({ message: `Ошибка при входе: ${err}` });
		}
	},
);

router.patch(
	"/account-timezone",
	authMiddleware,
	async (req: AuthRequest, res: Response) => {
		try {
			const { timezone } = req.body;
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ message: "Не авторизован" });
				return;
			}

			const user = await prisma.user.findUnique({ where: { id: userId } });
			if (!user) {
				res.status(404).json({ message: "Пользователь не найден" });
				return;
			}

			if (user.timezone === timezone) {
				res.status(400).json({
					message: `Получен уже установленный часовой пояс: ${timezone}`,
				});
				return;
			}

			const updatedUser = await prisma.user.update({
				where: { id: userId },
				data: { timezone },
			});

			res.status(200).json({
				success: true,
				message: "Успешная смена часового пояса",
				timezone: updatedUser.timezone,
			});
		} catch (err) {
			res
				.status(500)
				.json({ message: `Ошибка обновления часового пояса: ${err}` });
		}
	},
);

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
	const userId = req.user?.id;
	if (!userId) {
		res.status(401).json({ message: "Пользователь не найден" });
		return;
	}
	try {
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			res.status(404).json({ message: "Пользователь не найден" });
			return;
		}
		const { password: _, userTelegramChatId, ...userData } = user;
		res.status(200).json({
			user: {
				...userData,
				userTelegramChatId: userTelegramChatId?.toString(),
			},
		});
	} catch (err) {
		res.status(500).json({ message: "Ошибка сервера" });
	}
});

router.get("/logout", async (req: Request, res: Response) => {
	res.clearCookie("token", { httpOnly: true, secure: false, sameSite: "lax" });
	res.status(200).json({ success: true, message: "Вы вышли из аккаунта" });
});

router.get(
	"/get-user",
	authMiddleware,
	async (req: AuthRequest, res: Response) => {
		const userId = req.user?.id;
		if (!userId) {
			res.status(401).json({ message: "Попробуйте зайти заново" });
			return;
		}
		try {
			const user = await prisma.user.findUnique({ where: { id: userId } });
			if (!user) {
				res.status(404).json({ message: "Пользователь не найден" });
				return;
			}
			const { password: _, userTelegramChatId, ...userData } = user;
			res.status(200).json({
				...userData,
				userTelegramChatId: userTelegramChatId?.toString(),
			});
		} catch (err) {
			res.status(500).json({ message: "Ошибка сервера" });
		}
	},
);

export default router;
