import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./header.scss";
import headerLogo from "../../assets/settings__icon.svg";
import BurgerIcon from "../../assets/header__burger-menu.svg";
import closeIcon from "../../assets/close__icon.svg";
import Popup from "../popup/popup";
import { useLogoutMutation } from "../../api/api";
type NavItem = {
	label: string;
	path: string;
	isExternal?: boolean;
};

type HeaderProps = {
	navLinks: NavItem[];
};

const Header = ({ navLinks }: HeaderProps) => {
	const [isBurgerMenuOpen, setBurgerMenu] = useState<boolean>(false);
	const [isPhoneMode, setPhoneMode] = useState<boolean>(false);
	const [isSettingsOpen, setSettingsOpen] = useState<boolean>(false);
	const [logout] = useLogoutMutation();
	const logoutHandle = async () => {
		try {
			await logout().unwrap();
			console.log("Успешный выход");
			window.location.href = "/";
		} catch (err) {
			console.error("Ошибка logout:", err);
		}
	};
	useEffect(() => {
		const handleResize = () => {
			const width = window.innerWidth;
			setPhoneMode(width < 768);
		};

		window.addEventListener("resize", handleResize);
		handleResize();

		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const renderLinks = () =>
		navLinks.map(({ label, path, isExternal }, index) => (
			<li
				key={index}
				className="header__navigation_list_item">
				{isExternal ? (
					<a
						href={path}
						target="_blank"
						rel="noopener noreferrer">
						{label}
					</a>
				) : (
					<Link to={path}>{label}</Link>
				)}
			</li>
		));

	return (
		<header className="header">
			{isPhoneMode ? (
				<div className="phone__header">
					<img
						src={headerLogo}
						alt="logo"
						className="header__logo"
						onClick={() => setSettingsOpen(!isSettingsOpen)}
					/>

					<img
						src={isBurgerMenuOpen ? closeIcon : BurgerIcon}
						alt="menu"
						onClick={() => setBurgerMenu(!isBurgerMenuOpen)}
						className="header__burger_icon"
					/>
					{isBurgerMenuOpen && (
						<div className="header__burger__menu">
							<ul className="header__navigation_list">{renderLinks()}</ul>
						</div>
					)}
				</div>
			) : (
				<>
					<img
						src={headerLogo}
						alt="logo"
						className="header__logo"
						onClick={() => setSettingsOpen(!isSettingsOpen)}
					/>
					<nav>
						<ul className="header__navigation_list">{renderLinks()}</ul>
					</nav>
				</>
			)}
			{isSettingsOpen && (
				<Popup onClose={() => setSettingsOpen(!isSettingsOpen)}>
					<h4 className="logout__title">
						Вы уверены что хотите выйти из аккаунта?
					</h4>
					<button
						className="logout__button"
						onClick={logoutHandle}>
						Да, уверен.
					</button>
				</Popup>
			)}
		</header>
	);
};

export default Header;
