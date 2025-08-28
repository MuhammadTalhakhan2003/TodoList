import React, { useState, useEffect } from "react";
import { ITask } from "./Interfaces";
import RecycleBin from "./Components/RecycleBin";
import ProgressBar from "./Components/ProgressBar";
import AddTaskForm from "./Components/AddTaskForm";
import TodoTask from "./Components/TodoTask";

import {
  Box,
  Stack,
  Typography,
  Paper,
  Divider,
  Chip,
  Card,
  IconButton,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { ThemeProvider, CssBaseline, useTheme } from "@mui/material";
import { lightTheme, darkTheme } from "./Components/theme";

import { v4 as uuidv4 } from "uuid";
import Cookies from "js-cookie";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

const App: React.FC = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTask, setActiveTask] = useState<ITask | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // 🔍 Search + Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<ITask["taskType"] | "All">(
    "All"
  );

  const sensors = useSensors(useSensor(PointerSensor));
  const theme = useTheme();

  // ✅ Load from cookies on first render
  useEffect(() => {
    const savedTasks = Cookies.get("tasks");
    const savedTheme = Cookies.get("darkMode");

    if (savedTasks) {
      try {
        setTasks(JSON.parse(savedTasks));
      } catch (err) {
        console.error("Error parsing tasks cookie", err);
      }
    }
    if (savedTheme) {
      setDarkMode(savedTheme === "true");
    }
  }, []);

  // ✅ Save to cookies whenever tasks change
  useEffect(() => {
    Cookies.set("tasks", JSON.stringify(tasks), { expires: 7 }); // expires in 7 days
  }, [tasks]);

  // ✅ Save darkMode preference
  useEffect(() => {
    Cookies.set("darkMode", String(darkMode), { expires: 7 });
  }, [darkMode]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateTask = (task: Partial<ITask> & { permanentDelete?: boolean }) => {
    setTasks((prev) => {
      if (task.permanentDelete && task.id) {
        return prev.filter((t) => t.id !== task.id);
      }
      if (task.id) {
        return prev.map((t) => (t.id === task.id ? { ...t, ...task } : t));
      } else {
        const newTask: ITask = {
          id: uuidv4(),
          taskName: task.taskName || "Untitled Task",
          taskType: task.taskType || "Other",
          deadline: task.deadline || "",
          priority: task.priority || "Low",
          completed: false,
          isDeleted: false,
        };
        return [...prev, newTask];
      }
    });
  };

  // ✅ Apply Search + Filter
  const activeTasks = tasks.filter((t) => !t.isDeleted);
  const filteredTasks = activeTasks.filter((t) => {
    const matchesSearch = t.taskName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "All" || t.taskType === filterType;
    return matchesSearch && matchesFilter;
  });

  const incompleteTasks = filteredTasks.filter((t) => !t.completed);
  const completeTasks = filteredTasks.filter((t) => t.completed);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    const activeTaskObj = tasks.find((t) => t.id === activeId);
    if (!activeTaskObj) return;

    // Move between incomplete ↔ complete
    if (
      incompleteTasks.some((t) => t.id === activeId) &&
      completeTasks.some((t) => t.id === overId)
    ) {
      updateTask({ id: activeId, completed: true });
      return;
    }

    if (
      completeTasks.some((t) => t.id === activeId) &&
      incompleteTasks.some((t) => t.id === overId)
    ) {
      updateTask({ id: activeId, completed: false });
      return;
    }

    // Reorder inside same section
    setTasks((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId);
      const newIndex = prev.findIndex((t) => t.id === overId);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Box sx={{ p: 4, maxWidth: 950, mx: "auto" }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={theme.spacing(5)}
        >
          <Typography variant="h4" fontWeight="bold" sx={{ letterSpacing: 1 }}>
            ✨ Smart Todo List
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={`🕒 ${currentTime.toLocaleTimeString()}`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: "bold", px: 2 }}
            />
            <IconButton
              onClick={() => setDarkMode(!darkMode)}
              sx={{
                bgcolor: "background.paper",
                boxShadow: 2,
                borderRadius: 2,
                "&:hover": { bgcolor: "primary.light", color: "white" },
              }}
            >
              {darkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Stack>
        </Stack>

        {/* Progress */}
        <Paper
          sx={{
            p: 3,
            mb: theme.spacing(5),
            borderRadius: 4,
            boxShadow: 5,
            bgcolor: "background.default",
          }}
        >
          <Typography variant="subtitle1" mb={2} fontWeight="bold">
            📊 Progress Overview
          </Typography>
          <ProgressBar
            completed={completeTasks.length}
            total={filteredTasks.length}
          />
        </Paper>

        {/* Add Task + Search + Filter */}
        <Paper
          sx={{
            p: 3,
            mb: theme.spacing(6),
            borderRadius: 4,
            boxShadow: 5,
            bgcolor: "background.default",
          }}
        >
          <AddTaskForm
            updateTask={updateTask}
            onSearchChange={setSearchQuery}
            onFilterChange={setFilterType}
          />
        </Paper>

        {/* Drag & Drop Sections */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={(event) => {
            const task = tasks.find((t) => t.id === event.active.id);
            setActiveTask(task || null);
          }}
          onDragEnd={handleDragEnd}
        >
          <Stack spacing={6}>
            {/* Incomplete Tasks */}
            <Card
              sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: 4,
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="h6"
                mb={2}
                sx={{ color: "warning.main", fontWeight: "bold" }}
              >
                ⏳ Incomplete Tasks
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <SortableContext
                items={incompleteTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <Stack spacing={2}>
                  {incompleteTasks.length > 0 ? (
                    incompleteTasks.map((task) => (
                      <TodoTask
                        key={task.id}
                        task={task}
                        updateTask={updateTask}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      🎉 All tasks completed!
                    </Typography>
                  )}
                </Stack>
              </SortableContext>
            </Card>

            {/* Completed Tasks */}
            <Card
              sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: 4,
                bgcolor: "background.paper",
              }}
            >
              <Typography
                variant="h6"
                mb={2}
                sx={{ color: "success.main", fontWeight: "bold" }}
              >
                ✅ Completed Tasks
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <SortableContext
                items={completeTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <Stack spacing={2}>
                  {completeTasks.length > 0 ? (
                    completeTasks.map((task) => (
                      <TodoTask
                        key={task.id}
                        task={task}
                        updateTask={updateTask}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No tasks completed yet.
                    </Typography>
                  )}
                </Stack>
              </SortableContext>
            </Card>
          </Stack>

          {/* Drag Overlay Preview */}
          <DragOverlay>
            {activeTask ? (
              <Paper
                sx={{
                  p: 2,
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: 3,
                  boxShadow: 6,
                  fontWeight: "bold",
                  minWidth: 200,
                  textAlign: "center",
                }}
              >
                {activeTask.taskName}
              </Paper>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Recycle Bin */}
        <Box mt={theme.spacing(7)}>
          <RecycleBin tasks={tasks} updateTask={updateTask} />
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default App;
