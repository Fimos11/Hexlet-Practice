export interface AuthUser {
	id: string;
	name: string;
	email: string;
	timezone?: string;
	avatar?: string;
	userTelegram?: string;
	didUserInteractWithBot?: boolean;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface RegisterPayload {
	name: string;
	email: string;
	password: string;
	userTelegram?: string;
}
