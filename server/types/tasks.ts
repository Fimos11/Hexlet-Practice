export interface userTask {
	id: string;
	fullTaskText: string;
	taskTitle: string;
	status: "pending" | "completed" | "overdue";
	whenRemindToDo: Date | null;
	dueTo: Date | null;
	lastTimeNotified: Date | null;
	madeByUserId: string;
	createdAt: Date;
	updatedAt: Date;
}
