import React from "react";
import { ITask } from "../Interfaces";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Box, Typography } from "@mui/material";
import TodoTask from "./TodoTask";

interface Props {
  title: string;
  tasks: ITask[];
  updateTask: (task: ITask) => void;
  droppableId: string; // For multiple lists
}

const TaskList: React.FC<Props> = ({
  title,
  tasks,
  updateTask,
  droppableId,
}) => {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: "300px",
        p: 2,
        borderRadius: 3,
        bgcolor: "#fafafa",
        boxShadow: 2,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        {title}
      </Typography>

      {/* DnD Context */}
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TodoTask key={task.id} task={task} updateTask={updateTask} />
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No tasks
          </Typography>
        )}
      </SortableContext>
    </Box>
  );
};

export default TaskList;
