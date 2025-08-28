// src/Components/TodoTask.tsx
import React, { useState, useEffect } from "react";
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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
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

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

interface Props {
  task: ITask;
  updateTask: (task: ITask) => void;
}

const TodoTask: React.FC<Props> = ({ task, updateTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(task.taskName);
  const [newDeadline, setNewDeadline] = useState<Dayjs | null>(
    task.deadline ? dayjs(task.deadline) : null
  );
  const [newType, setNewType] = useState<ITask["taskType"]>(task.taskType);
  const [nameError, setNameError] = useState("");
  const [deadlineError, setDeadlineError] = useState("");

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
    opacity: isDragging ? 0.6 : 1,
  };

  // 🔹 Priority calculator
  const calculatePriority = (deadline: Dayjs | null): ITask["priority"] => {
    if (!deadline) return "Low";
    const diff = deadline.diff(dayjs(), "day");
    if (diff < 1) return "Urgent";
    if (diff <= 3) return "High";
    if (diff <= 7) return "Medium";
    return "Low";
  };

  // 🔹 Handle Save when editing
  const handleSave = () => {
    let valid = true;

    if (!newName.trim()) {
      setNameError("Task name cannot be empty");
      valid = false;
    } else setNameError("");

    if (newDeadline && newDeadline.isBefore(dayjs().startOf("day"))) {
      setDeadlineError("Deadline cannot be in the past");
      valid = false;
    } else setDeadlineError("");

    if (!valid) return;

    updateTask({
      ...task,
      taskName: newName.trim(),
      taskType: newType,
      deadline: newDeadline ? newDeadline.format("YYYY-MM-DD") : "",
      priority: calculatePriority(newDeadline),
    });
    setIsEditing(false);
  };

  // --- 🔹 Auto Update Priority as time passes ---
  useEffect(() => {
    if (!task.deadline || task.completed) return;

    const interval = setInterval(() => {
      const deadline = dayjs(task.deadline);
      const newPriority = calculatePriority(deadline);

      if (newPriority !== task.priority) {
        updateTask({ ...task, priority: newPriority });
      }
    }, 60 * 1000); // check every 1 min

    return () => clearInterval(interval);
  }, [task, updateTask]);

  // --- Deadline Text ---
  const getDeadlineText = () => {
    if (!task.deadline) return "No deadline";

    const deadline = dayjs(task.deadline);
    if (task.completed) return `Completed (was due ${deadline.fromNow()})`;
    if (deadline.isBefore(dayjs(), "day"))
      return `Overdue (${deadline.fromNow()})`;
    if (deadline.isSame(dayjs(), "day")) return "Due Today";

    return `Due ${deadline.fromNow()}`;
  };

  const isOverdue =
    task.deadline && !task.completed
      ? dayjs(task.deadline).isBefore(dayjs(), "day")
      : false;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 2,
        borderRadius: 3,
        boxShadow: isDragging ? 6 : 2,
        backgroundColor: task.completed
          ? "rgba(76, 175, 80, 0.1)"
          : isOverdue
          ? "rgba(244, 67, 54, 0.1)"
          : "#fff",
        border: isOverdue ? "1px solid red" : "1px solid transparent",
        transition: "0.2s",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        {isEditing ? (
          <Stack spacing={2}>
            {/* Task Name */}
            <TextField
              label="Task Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              fullWidth
              error={!!nameError}
              helperText={nameError}
            />

            {/* Task Type */}
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={newType}
                onChange={(e) =>
                  setNewType(e.target.value as ITask["taskType"])
                }
              >
                <MenuItem value="Work">Work</MenuItem>
                <MenuItem value="Assignment">Assignment</MenuItem>
                <MenuItem value="Personal">Personal</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>

            {/* Deadline */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Deadline"
                value={newDeadline}
                minDate={dayjs().startOf("day")}
                onChange={(newValue) => setNewDeadline(newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!deadlineError,
                    helperText: deadlineError,
                  },
                }}
              />
            </LocalizationProvider>

            {/* Action Buttons */}
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
            {/* Drag Handle + Task Info */}
            <Box
              display="flex"
              alignItems="center"
              gap={1.5}
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
                  sx={{
                    fontSize: "0.8rem",
                    color: isOverdue ? "error.main" : "text.secondary",
                  }}
                >
                  Type: {task.taskType} • {getDeadlineText()}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: "bold",
                    color:
                      task.priority === "Urgent"
                        ? "error.main"
                        : task.priority === "High"
                        ? "warning.main"
                        : task.priority === "Medium"
                        ? "info.main"
                        : "text.secondary",
                  }}
                >
                  Priority: {task.priority}
                </Typography>
              </Box>
            </Box>

            {/* Actions */}
            <Stack direction="row" spacing={1} flexShrink={0}>
              <IconButton
                color={task.completed ? "warning" : "success"}
                onClick={() =>
                  updateTask({ ...task, completed: !task.completed })
                }
              >
                {task.completed ? <Undo /> : <CheckCircle />}
              </IconButton>

              <IconButton color="primary" onClick={() => setIsEditing(true)}>
                <Edit />
              </IconButton>

              <IconButton
                color="error"
                onClick={() => updateTask({ ...task, isDeleted: true })}
              >
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
