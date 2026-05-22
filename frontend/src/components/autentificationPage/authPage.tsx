import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import "./authPage.scss";
import iconShowPassword from "../../assets/icon__form__shown.svg";
import iconHiddenPassword from "../../assets/icon__form__hidden.svg";
import { useAuth } from "../../providers/AuthProvider.tsx";

interface InputData {
	inputPlaceHolder: string;
	logoSrc: string;
	buttonText?: string;
	inputType: string;
	name: string;
}

interface AuthPageProps {
	inputs: InputData[];
	formTitle: string;
	textPS?: string;
	primaryButtonText: string;
	secondaryButtonText?: string;
	path: string;
}

const loginSchema = z.object({
	email: z.string().min(1, "Введите email").email("Введите корректный email"),
	password: z.string().min(6, "Пароль должен содержать минимум 6 символов"),
});

const registerSchema = loginSchema
	.extend({
		name: z.string().trim().min(3, "Имя должно содержать минимум 3 символа"),
		confirmPassword: z.string().min(1, "Подтвердите пароль"),
		userTelegram: z
			.string()
			.optional()
			.transform((value) => value?.trim())
			.refine((value) => !value || value.startsWith("@"), {
				message: "Telegram должен начинаться с @",
			}),
	})
	.superRefine((data, ctx) => {
		if (data.password !== data.confirmPassword) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["confirmPassword"],
				message: "Пароли не совпадают",
			});
		}
	});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type FormValues = LoginValues & Partial<RegisterValues>;

const AuthPage = ({
	inputs,
	formTitle,
	textPS,
	primaryButtonText,
	secondaryButtonText,
	path,
}: AuthPageProps): React.ReactElement => {
	const [isPasswordVisible, setPasswordVisibility] = useState(false);
	const [serverError, setServerError] = useState("");

	const location = useLocation();
	const navigate = useNavigate();
	const { login, register: registerAction } = useAuth();
	const isRegistration = path === "/account-registration";

	const schema = isRegistration ? registerSchema : loginSchema;
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors, isValid },
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		mode: "onChange",
	});

	useEffect(() => {
		reset();
		setServerError("");
		setPasswordVisibility(false);
	}, [location.pathname, reset]);

	const onSubmit = async (formData: FormValues) => {
		try {
			if (isRegistration) {
				await registerAction({
					name: formData.name?.trim() ?? "",
					email: formData.email,
					password: formData.password,
					userTelegram: formData.userTelegram,
				});
			} else {
				await login({
					email: formData.email,
					password: formData.password,
				});
			}

			reset();
			setServerError("");
			navigate("/", { replace: true });
		} catch (error: any) {
			setServerError(
				error?.response?.data?.message ||
					"Что-то пошло не так. Попробуйте ещё раз.",
			);
		}
	};

	return (
		<div className="form__container">
			<form
				className="form__auth"
				onSubmit={handleSubmit(onSubmit)}>
				<h3 className="form__auth_title">{formTitle}</h3>

				{inputs.map((inputData, index) => {
					const fieldError = errors[inputData.name as keyof FormValues]
						?.message as string | undefined;
					return (
						<div
							className="form__auth__input_block"
							key={index}>
							<div className="form__auth__input__container">
								<div className="form__auth__input_wrapper">
									<img
										src={inputData.logoSrc}
										alt={inputData.name}
										className="form__auth__input_logo"
									/>
									<input
										{...register(inputData.name as keyof FormValues)}
										type={
											inputData.inputType === "password"
												? isPasswordVisible
													? "text"
													: "password"
												: inputData.inputType
										}
										className="form__input_with_logo"
										placeholder={inputData.inputPlaceHolder}
										id={`${inputData.name}-id`}
									/>
									{inputData.inputType === "password" && (
										<img
											src={
												isPasswordVisible
													? iconShowPassword
													: iconHiddenPassword
											}
											onClick={() => setPasswordVisibility(!isPasswordVisible)}
											className="form__auth_password_icon"
											alt="Toggle password visibility"
										/>
									)}
								</div>
								{inputData.buttonText && (
									<button className="form__auth__button">
										{inputData.buttonText}
									</button>
								)}
							</div>
							{fieldError && <p className="form__input_error">{fieldError}</p>}
						</div>
					);
				})}

				{serverError && (
					<p className="form__input_error form__input_error_server">
						{serverError}
					</p>
				)}

				<p className="text__ps">{textPS}</p>
				<div className="form__button__container">
					<button
						disabled={!isValid}
						className="form__primary__button">
						{primaryButtonText}
					</button>
					<Link
						to={isRegistration ? "/login" : "/registration"}
						className="form__secondary__button">
						{secondaryButtonText}
					</Link>
				</div>
			</form>
		</div>
	);
};

export default AuthPage;
