import React, { useState } from "react";
import {
  TextField,
  Button,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Paper,
  Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { ITask } from "../Interfaces";

interface Props {
  updateTask: (task: Partial<ITask>) => void;
  onSearchChange: (query: string) => void;
  onFilterChange: (value: ITask["taskType"] | "All") => void;
}

const AddTaskForm: React.FC<Props> = ({
  updateTask,
  onSearchChange,
  onFilterChange,
}) => {
  const [taskName, setTaskName] = useState("");
  const [taskType, setTaskType] = useState<ITask["taskType"]>("Work");
  const [deadline, setDeadline] = useState<Dayjs | null>(null);

  // 🔍 Local state for search & filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<ITask["taskType"] | "All">(
    "All"
  );

  const getPriority = (deadline: Dayjs) => {
    const today = dayjs().startOf("day");
    const diffDays = deadline.diff(today, "day");

    if (diffDays < 1) return "Urgent";
    if (diffDays <= 3) return "High";
    if (diffDays <= 7) return "Medium";
    return "Low";
  };

  const handleSubmit = () => {
    if (!taskName.trim() || !deadline) return;

    const priority = getPriority(deadline);

    updateTask({
      taskName,
      taskType,
      deadline: deadline.format("YYYY-MM-DD"),
      priority,
      completed: false,
      isDeleted: false,
    });

    setTaskName("");
    setTaskType("Work");
    setDeadline(null);
  };

  // 🔍 Run search only when pressing button
  const handleSearch = () => {
    onSearchChange(searchQuery);
    onFilterChange(filterType);
  };

  // ❌ Clear search and filter
  const handleClearFilters = () => {
    setSearchQuery("");
    setFilterType("All");
    onSearchChange("");
    onFilterChange("All");
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        boxShadow: 4,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" mb={2} fontWeight="bold" color="primary">
        ➕ Add a New Task
      </Typography>

      <Stack spacing={2}>
        {/* 🔍 Search + Filter */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <TextField
            label="🔍 Search Tasks"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
          />

          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value as ITask["taskType"] | "All")
              }
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Work">Work</MenuItem>
              <MenuItem value="Assignment">Assignment</MenuItem>
              <MenuItem value="Personal">Personal</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          {/* Search Button */}
          <Button
            variant="outlined"
            size="large"
            onClick={handleSearch}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: "bold",
              color: "primary.main",
              borderColor: "primary.main",
              "&:hover": { bgcolor: "primary.light" },
            }}
          >
            Search
          </Button>

          {/* Clear Filters Button */}
          <Button
            variant="text"
            size="large"
            onClick={handleClearFilters}
            sx={{
              px: 2,
              py: 1,
              borderRadius: 2,
              fontWeight: "bold",
              color: "error.main",
              "&:hover": { bgcolor: "error.light", color: "white" },
            }}
          >
            Clear
          </Button>
        </Stack>

        {/* 📝 Task Adding Row */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          flexWrap="wrap"
        >
          <TextField
            label="Task Name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            fullWidth
          />

          <FormControl sx={{ minWidth: 160 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as ITask["taskType"])}
            >
              <MenuItem value="Work">Work</MenuItem>
              <MenuItem value="Assignment">Assignment</MenuItem>
              <MenuItem value="Personal">Personal</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Deadline"
              value={deadline}
              onChange={(val) => setDeadline(val)}
              minDate={dayjs().startOf("day")}
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            sx={{
              px: 4,
              py: 1,
              borderRadius: 2,
              fontWeight: "bold",
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            Add Task
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AddTaskForm;
