import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider.tsx";

const AuthRedirect = () => {
	const { user, loading } = useAuth();

	if (loading) {
		return null;
	}

	return user ? (
		<Navigate
			to="/personal-account"
			replace
		/>
	) : (
		<Navigate
			to="/login"
			replace
		/>
	);
};

export default AuthRedirect;
