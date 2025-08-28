// src/Interfaces.ts
export interface ITask {
  id: string;
  taskName: string;
  taskType: "Work" | "Assignment" | "Personal" | "Other";
  deadline: string; 
  priority: "Urgent" | "High" | "Medium" | "Low";
  completed: boolean;
  isDeleted: boolean;
}
