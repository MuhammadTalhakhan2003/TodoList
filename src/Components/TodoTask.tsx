import React, { useState } from "react";
import { ITask } from "../Interfaces";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  Stack,
  IconButton,
  Button,
} from "@mui/material";
import {
  CheckCircle,
  Undo,
  Edit,
  Delete,
  Save,
  Close,
} from "@mui/icons-material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

interface Props {
  task: ITask;
  toggleTaskCompletion: (id: string) => void;
  editTask: (id: string, newName: string, newDeadline: number) => void;
  deleteTask: (id: string) => void;
}

const TodoTask: React.FC<Props> = ({
  task,
  toggleTaskCompletion,
  editTask,
  deleteTask,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(task.taskName);
  const [newDeadline, setNewDeadline] = useState(task.deadline);
  const [error, setError] = useState("");

  // DnD setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (!newName.trim()) {
      setError("Task name cannot be empty");
      return;
    }
    if (newDeadline <= 0) {
      setError("Deadline must be greater than 0");
      return;
    }
    setError("");
    editTask(task.id, newName, newDeadline);
    setIsEditing(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 2,
        borderRadius: 3,
        boxShadow: isDragging ? 6 : 2,
        backgroundColor: task.completed ? "rgba(76, 175, 80, 0.08)" : "#fff",
        transition: "0.2s",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {isEditing ? (
          <Stack spacing={2}>
            <TextField
              label="Task Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              fullWidth
              error={!!error && !newName.trim()}
              helperText={!newName.trim() ? error : ""}
            />
            <TextField
              label="Deadline (days)"
              type="number"
              value={newDeadline}
              onChange={(e) => setNewDeadline(Number(e.target.value))}
              fullWidth
              error={!!error && newDeadline <= 0}
              helperText={newDeadline <= 0 ? error : ""}
            />
            <Stack direction="row" justifyContent="flex-end" spacing={1}>
              <Button
                variant="contained"
                size="small"
                color="success"
                startIcon={<Save />}
                onClick={handleSave}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Close />}
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            gap={2}
            flexWrap="wrap"
          >
            {/* Left: Drag + task info */}
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              flex={1}
              minWidth={0}
            >
              <IconButton
                {...attributes}
                {...listeners}
                size="small"
                sx={{ cursor: "grab", color: "text.secondary" }}
              >
                <GripVertical size={18} />
              </IconButton>
              <Box sx={{ overflow: "hidden" }}>
                <Typography
                  variant="subtitle1"
                  noWrap
                  sx={{
                    textDecoration: task.completed ? "line-through" : "none",
                    fontWeight: 500,
                  }}
                >
                  {task.taskName}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.8rem" }}
                >
                  {task.deadline} days
                </Typography>
              </Box>
            </Box>

            {/* Right: actions (icons) */}
            <Stack direction="row" spacing={1} flexShrink={0}>
              <IconButton
                color={task.completed ? "warning" : "success"}
                onClick={() => toggleTaskCompletion(task.id)}
              >
                {task.completed ? <Undo /> : <CheckCircle />}
              </IconButton>
              <IconButton color="primary" onClick={() => setIsEditing(true)}>
                <Edit />
              </IconButton>
              <IconButton color="error" onClick={() => deleteTask(task.id)}>
                <Delete />
              </IconButton>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TodoTask;
