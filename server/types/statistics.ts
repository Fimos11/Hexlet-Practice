export interface IStatistics {
	id: string;
	completedTasks: number;
	overduedTasks: number;
	pendingTasks: number;
	amountOfAllTasksEverMadeByUser: number;
	referredToUserId: string;
	createdAt: Date;
	updatedAt: Date;
}
