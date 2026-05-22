import { body } from "express-validator";

export const registrationValidator = [
	body("password")
		.isLength({ min: 5, max: 50 })
		.withMessage(
			"Пароль должен содержать минимум 5 символов и максимум 50 символов.",
		),

	body("name")
		.trim()
		.isLength({ min: 3 })
		.withMessage("Имя должно содержать минимум 3 символа."),

	body("email")
		.isEmail()
		.withMessage("Укажите корректный email")
		.normalizeEmail(),
];
export const loginValidator = [
	body("password")
		.isLength({ min: 5, max: 50 })
		.withMessage(
			"Пароль должен содержать минимум 5 символов и максимум 50 символов.",
		),

	body("email")
		.isEmail()
		.withMessage("Укажите корректный email")
		.normalizeEmail(),
];
