import React from "react";
import { ITask } from "../Interfaces";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  IconButton,
} from "@mui/material";
import { RestoreFromTrash, DeleteForever } from "@mui/icons-material";

interface Props {
  tasks: ITask[];
  updateTask: (task: Partial<ITask> & { permanentDelete?: boolean }) => void;
}

const RecycleBin: React.FC<Props> = ({ tasks, updateTask }) => {
  const deletedTasks = tasks.filter((task) => task.isDeleted);

  if (deletedTasks.length === 0) {
    return <Typography>Recycle Bin is empty</Typography>;
  }

  return (
    <Box mt={3}>
      <Typography variant="h6">♻️ Recycle Bin</Typography>
      {deletedTasks.map((task) => (
        <Card key={task.id} sx={{ mb: 2 }}>
          <CardContent
            sx={{ display: "flex", justifyContent: "space-between" }}
          >
            <Box>
              <Typography>{task.taskName}</Typography>
              <Typography variant="body2">
                Deadline: {task.deadline || "No deadline"}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              {/* Restore */}
              <IconButton
                onClick={() => updateTask({ id: task.id, isDeleted: false })}
              >
                <RestoreFromTrash />
              </IconButton>
              {/* Permanent Delete */}
              <IconButton
                onClick={() =>
                  updateTask({ id: task.id, permanentDelete: true })
                }
                color="error"
              >
                <DeleteForever />
              </IconButton>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default RecycleBin;
