import mailIcon from "../../assets/icon__form__mail.svg";
import passwordIcon from "../../assets/icon__form__password.svg";
import manIcon from "../../assets/icon__form__man.svg";
import telegram from "../../assets/icon__form__telegram.svg";

export const authData = {
	formTitle: "Вход в аккаунт",
	textPS: "Войдите в систему, чтобы продолжить.",
	primaryButtonText: "Войти",
	secondaryButtonText: "Перейти к регистрации",
	path: "/account-login",
	inputs: [
		{
			inputPlaceHolder: "Введите email",
			logoSrc: mailIcon,
			inputType: "email",
			name: "email",
		},
		{
			inputPlaceHolder: "Введите пароль",
			logoSrc: passwordIcon,
			inputType: "password",
			name: "password",
		},
	],
};

export const registerData = {
	formTitle: "Регистрация",
	textPS: "Создайте новый аккаунт.",
	primaryButtonText: "Зарегистрироваться",
	secondaryButtonText: "Уже есть аккаунт? Вход",
	path: "/account-registration",
	inputs: [
		{
			inputPlaceHolder: "Введите ваше имя",
			logoSrc: manIcon,
			inputType: "text",
			name: "name",
		},
		{
			inputPlaceHolder: "Введите email",
			logoSrc: mailIcon,
			inputType: "email",
			name: "email",
		},
		{
			inputPlaceHolder: "Введите пароль",
			logoSrc: passwordIcon,
			inputType: "password",
			name: "password",
		},
		{
			inputPlaceHolder: "Подтвердите пароль",
			logoSrc: passwordIcon,
			inputType: "password",
			name: "confirmPassword",
		},
		{
			inputPlaceHolder: "Ваш телеграмм",
			inputType: "text",
			logoSrc: telegram,
			name: "userTelegram",
		},
	],
};
