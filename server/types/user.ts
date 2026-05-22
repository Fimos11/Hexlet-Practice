export interface RegisterAccountBody {
	name: string;
	email: string;
	password: string;
	userTelegram: string;
}

export interface LoginAccountBody {
	email: string;
	password: string;
}

export interface IUser {
	id: string;
	name: string;
	email: string;
	avatar: string | null;
	userTelegram: string;
	userTelegramChatId: string | null;
	didUserInteractWithBot: boolean;
	timezone: string;
	createdAt: Date;
	updatedAt: Date;
}
