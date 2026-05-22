import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { userTaskClient } from "../../server/types/tasks.ts";
import type { IStatistics } from "../../server/types/statistics.ts";
import type { IUser } from "../../server/types/user.ts";
type UpdateTaskPayload = {
	taskId: string;
	data: Partial<
		Pick<
			userTaskClient,
			"taskTitle" | "status" | "fullTaskText" | "DueTo" | "whenRemindToDo"
		>
	>;
};

export const api = createApi({
	reducerPath: "api",
	baseQuery: fetchBaseQuery({
		baseUrl: "http://localhost:3001",
		credentials: "include",
	}),
	tagTypes: ["Tasks", "Statistics", "User"],
	endpoints: (builder) => ({
		getTasks: builder.query<{ tasks: userTaskClient[] }, void>({
			query: () => "/get-tasks",
			providesTags: ["Tasks"],
		}),
		getTaskById: builder.query<{ task: userTaskClient }, string>({
			query: (taskId) => `/task/${taskId}`,
			providesTags: ["Tasks"],
		}),

		getStatistics: builder.query<{ statistics: IStatistics }, void>({
			query: () => "/get-statistics",
			providesTags: ["Statistics"],
		}),
		getUser: builder.query<IUser, void>({
			query: () => "/get-user",
			providesTags: ["User"],
		}),
		uploadAvatar: builder.mutation<
			{ avatar: string; message: string },
			FormData
		>({
			query: (formData) => ({
				url: "/upload-avatar",
				method: "POST",
				body: formData,
			}),
			invalidatesTags: ["User"],
		}),
		logout: builder.mutation<{ message: string }, void>({
			query: () => ({
				url: "/logout",
				method: "GET",
			}),
		}),
		createTask: builder.mutation<
			{ message: string; task: userTaskClient },
			Partial<userTaskClient>
		>({
			query: (taskData) => ({
				url: "/create-new-task",
				method: "POST",
				body: taskData,
			}),
			invalidatesTags: ["Tasks", "Statistics"],
		}),
		toggleTaskCompleted: builder.mutation<
			{ task: userTaskClient; message: string },
			string
		>({
			query: (taskId) => ({
				url: `/task/${taskId}/toggle`,
				method: "PATCH",
			}),
			invalidatesTags: ["Tasks", "Statistics"],
		}),
		deleteTask: builder.mutation<{ message: string }, string>({
			query: (taskId) => ({
				url: `/task/${taskId}/delete`,
				method: "DELETE",
			}),
			invalidatesTags: ["Tasks"],
		}),
		updateTimezone: builder.mutation<
			{ success: boolean; message: string; timezone: string },
			{ timezone: string }
		>({
			query: (body) => ({
				url: `/account-timezone`,
				method: "PATCH",
				body,
			}),
			invalidatesTags: ["User"],
		}),
		updateTask: builder.mutation<{ message: string }, UpdateTaskPayload>({
			query: ({ taskId, data }) => ({
				url: `/change-task-params/${taskId}`,
				method: "PATCH",
				body: data,
			}),
			invalidatesTags: ["Tasks", "Statistics"],
		}),
	}),
});

export const {
	useGetTasksQuery,
	useGetStatisticsQuery,
	useGetUserQuery,
	useUploadAvatarMutation,
	useLogoutMutation,
	useGetTaskByIdQuery,
	useCreateTaskMutation,
	useToggleTaskCompletedMutation,
	useDeleteTaskMutation,
	useUpdateTimezoneMutation,
	useUpdateTaskMutation,
} = api;
