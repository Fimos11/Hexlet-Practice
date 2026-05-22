import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from "react";
import axios from "axios";
import type { AuthUser, LoginPayload, RegisterPayload } from "../types/auth";

axios.defaults.baseURL = "http://localhost:3001";
axios.defaults.withCredentials = true;

interface AuthContextValue {
	user: AuthUser | null;
	loading: boolean;
	login: (payload: LoginPayload) => Promise<void>;
	register: (payload: RegisterPayload) => Promise<void>;
	logout: () => Promise<void>;
	refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const refreshUser = async () => {
		setRefreshing(true);
		try {
			const response = await axios.get("/me");
			const userData = response.data?.user ?? null;
			setUser(userData);
		} catch {
			setUser(null);
		} finally {
			setRefreshing(false);
		}
	};

	useEffect(() => {
		void refreshUser().then(() => setLoading(false));
	}, []);

	const login = async (payload: LoginPayload) => {
		await axios.post("/account-login", payload);
		await refreshUser();
	};

	const register = async (payload: RegisterPayload) => {
		await axios.post("/account-registration", payload);
		await refreshUser();
	};

	const logout = async () => {
		await axios.get("/logout");
		setUser(null);
	};

	const value = useMemo(
		() => ({
			user,
			login,
			register,
			logout,
			refreshUser,
			loading: loading || refreshing,
		}),
		[user, loading, refreshing],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used inside AuthProvider");
	}
	return context;
};
