import "./App.css";
import AuthPage from "./components/autentificationPage/authPage.tsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./components/protectedRoutes/protectedRoutes.tsx";
import {
	authData,
	registerData,
} from "./components/autentificationPage/data.ts";
import AuthRedirect from "./components/authRedirect.tsx";
import PersonalAccountPage from "./components/personalAccount/personalAccount.tsx";
import TaskManagePage from "./components/tasksManagePage/taskManage.tsx";
import TaskDetailsPage from "./components/taskDetails/taskDetails.tsx";
import { AuthProvider } from "./providers/AuthProvider.tsx";

function App() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route
						path="/"
						element={<AuthRedirect />}
					/>
					<Route
						path="/login"
						element={
							<AuthPage
								formTitle={authData.formTitle}
								textPS={authData.textPS}
								inputs={authData.inputs}
								path={authData.path}
								primaryButtonText={authData.primaryButtonText}
								secondaryButtonText={authData.secondaryButtonText}
							/>
						}
					/>
					<Route
						path="/registration"
						element={
							<AuthPage
								formTitle={registerData.formTitle}
								textPS={registerData.textPS}
								path={registerData.path}
								inputs={registerData.inputs}
								primaryButtonText={registerData.primaryButtonText}
								secondaryButtonText={registerData.secondaryButtonText}
							/>
						}
					/>
					<Route
						path="/personal-account"
						element={
							<ProtectedRoutes>
								<PersonalAccountPage />
							</ProtectedRoutes>
						}
					/>
					<Route
						path="/task-manage"
						element={
							<ProtectedRoutes>
								<TaskManagePage />
							</ProtectedRoutes>
						}
					/>
					<Route
						path="/task-manage/:id"
						element={
							<ProtectedRoutes>
								<TaskDetailsPage />
							</ProtectedRoutes>
						}
					/>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}

export default App;
