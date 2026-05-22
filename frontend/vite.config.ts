import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/

export default defineConfig({
	plugins: [react()],
	server: {
		proxy: {
			"/me": "http://localhost:3001",
			"/account-login": "http://localhost:3001",
			"/account-registration": "http://localhost:3001",
			"/logout": "http://localhost:3001",
		},
	},
});
