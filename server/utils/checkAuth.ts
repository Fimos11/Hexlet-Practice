import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import type { Request, Response, NextFunction } from "express";
dotenv.config();
interface JwtPayload {
	id: string;
	email: string;
}

export interface AuthRequest extends Request {
	file?: Express.Multer.File;
	user?: JwtPayload;
}

export const authMiddleware = (
	req: AuthRequest,
	res: Response,
	next: NextFunction
): void => {
	const token = req.cookies.token;

	if (!token) {
		res.status(401).json({ message: "Нет токена авторизации" });
		return;
	}

	try {
		const secret = process.env.SECRET_JWT_ENCODING ?? "";
		const decoded = jwt.verify(token, secret) as JwtPayload;
		req.user = decoded;
		next();
	} catch (err) {
		res.status(401).json({ message: "Неверный токен" });
	}
};
