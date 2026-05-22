import { useEffect, useState, useRef } from "react";
import "./calendar.scss";
import calendarIcon from "../../assets/calendar.svg";
type CalendarProps = {
	selectedDate: Date | null;
	setSelectedDate: (date: Date | null) => void;
	placeholder?: string;
};
const Calendar = ({
	selectedDate,
	setSelectedDate,
	placeholder,
}: CalendarProps) => {
	const date = new Date();
	const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
	const [month, setMonth] = useState(date.getMonth());
	const [year, setYear] = useState(date.getFullYear());
	const [inputValue, setInputValue] = useState("");
	const [showCalendar, setShowCalendar] = useState(false);
	const [inputError, setInputError] = useState<string>();
	const refPopUp = useRef<HTMLDivElement>(null);
	const refInput = useRef<HTMLDivElement>(null);

	// Sync inputValue with selectedDate prop
	useEffect(() => {
		if (selectedDate) {
			setInputValue(formatToStringDate(selectedDate, { withDay: true }));
			setMonth(selectedDate.getMonth());
			setYear(selectedDate.getFullYear());
		} else {
			setInputValue("");
		}
	}, [selectedDate]);

	function toggleCalendar() {
		if (!showCalendar) {
			const now = new Date();
			setMonth(now.getMonth());
			setYear(now.getFullYear());
		}
		setShowCalendar(!showCalendar);
	}
	const formatToStringDate = (
		date: Date,
		options?: { withDay?: boolean }
	): string => {
		const dayStr = date.getDate().toString().padStart(2, "0");
		const monthStr = (date.getMonth() + 1).toString().padStart(2, "0");
		const yearStr = date.getFullYear();

		if (options?.withDay === false) {
			return new Date(date.getFullYear(), date.getMonth()).toLocaleString(
				"ru-RU",
				{
					month: "long",
					year: "numeric",
				}
			);
		}

		return `${dayStr}.${monthStr}.${yearStr}`;
	};
	function handleSelectDate(day: number) {
		const newDate = new Date(year, month, day);
		newDate.setHours(0, 0, 0, 0);

		const now = new Date();
		now.setHours(0, 0, 0, 0);

		if (newDate >= now) {
			setSelectedDate(newDate);

			setInputValue(formatToStringDate(newDate, { withDay: true }));
			setShowCalendar(false);
		}
	}

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				refPopUp.current &&
				refInput.current &&
				!refPopUp.current.contains(event.target as Node) &&
				!refInput.current.contains(event.target as Node)
			) {
				setShowCalendar(false);
			}
		};

		if (showCalendar) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showCalendar]);

	function handlePrevMonth() {
		if (month === 0) {
			setMonth(11);
			setYear(year - 1);
		} else {
			setMonth(month - 1);
		}
	}

	function handleNextMonth() {
		if (month === 11) {
			setMonth(0);
			setYear(year + 1);
		} else {
			setMonth(month + 1);
		}
	}

	const handleDateChanger = (e: React.ChangeEvent<HTMLInputElement>) => {
		const rawValue = e.target.value.replace(/\D/g, "");
		if (e.target.value.length <= 9) setInputError("");
		let formatted = "";
		if (rawValue.length <= 2) {
			formatted = rawValue;
		} else if (rawValue.length <= 4) {
			formatted = `${rawValue.slice(0, 2)}.${rawValue.slice(2)}`;
		} else {
			formatted = `${rawValue.slice(0, 2)}.${rawValue.slice(
				2,
				4
			)}.${rawValue.slice(4, 8)}`;
		}
		setInputValue(formatted);

		if (rawValue.length === 8) {
			const day = parseInt(rawValue.slice(0, 2), 10);
			const monthInput = parseInt(rawValue.slice(2, 4), 10) - 1;
			const yearInput = parseInt(rawValue.slice(4, 8), 10);

			const newDate = new Date(yearInput, monthInput, day);
			const now = new Date();
			now.setHours(0, 0, 0, 0);
			newDate.setHours(0, 0, 0, 0);

			if (
				newDate.getFullYear() === yearInput &&
				newDate.getMonth() === monthInput &&
				newDate.getDate() === day &&
				newDate >= now
			) {
				setSelectedDate(newDate);
				setMonth(monthInput);
				setYear(yearInput);
			} else {
				setInputError("Укажите валидную дату");
			}
		}
	};

	const generateCalendarMatrix = (
		year: number,
		month: number
	): (number | null)[][] => {
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;

		const days: (number | null)[] = [];

		for (let i = 0; i < firstDayIndex; i++) days.push(null);
		for (let i = 1; i <= daysInMonth; i++) days.push(i);

		const weeks: (number | null)[][] = [];
		for (let i = 0; i < days.length; i += 7) {
			weeks.push(days.slice(i, i + 7));
		}

		return weeks;
	};

	return (
		<div className="calendar__wrapper">
			<div className="calendar__input__wrapper">
				<div className="calendar__input__container" ref={refInput}>
					<input
						type="text"
						onChange={handleDateChanger}
						value={inputValue}
						className="calendar__input"
						placeholder={placeholder ? placeholder : "ДД.ММ.ГГГГ"}
					/>
					<img
						src={calendarIcon}
						alt="calendar"
						onMouseDown={(e) => {
							e.preventDefault();
							toggleCalendar();
						}}
					/>
				</div>
				{inputError && <p className="input-error">{inputError}</p>}
			</div>
			{showCalendar && (
				<div className="calendar__popup" ref={refPopUp}>
					<div className="calendar__header">
						<button onClick={handlePrevMonth}>←</button>
						<span>
							{formatToStringDate(new Date(year, month), {
								withDay: false,
							})}
						</span>
						<button onClick={handleNextMonth}>→</button>
					</div>
					<table className="calendar__table">
						<thead>
							<tr>
								{weekdays.map((day) => (
									<th key={day}>{day}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{generateCalendarMatrix(year, month).map(
								(week, i) => (
									<tr key={i}>
										{week.map((day, j) => {
											const isDisabled =
												day === null ||
												new Date(
													year,
													month,
													day
												).setHours(0, 0, 0, 0) <
													new Date().setHours(
														0,
														0,
														0,
														0
													);
											const isSelected =
												day !== null &&
												selectedDate &&
												day ===
													selectedDate.getDate() &&
												month ===
													selectedDate.getMonth() &&
												year ===
													selectedDate.getFullYear();

											return (
												<td
													key={j}
													className="calendar__cell"
												>
													{day ? (
														<button
															disabled={
																isDisabled
															}
															className={`calendar__day${
																isSelected
																	? " selected"
																	: ""
															}`}
															onClick={() =>
																handleSelectDate(
																	day
																)
															}
															type="button"
														>
															{day}
														</button>
													) : (
														<span className="calendar__empty-cell"></span>
													)}
												</td>
											);
										})}
									</tr>
								)
							)}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
};

export default Calendar;
