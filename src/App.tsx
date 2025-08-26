import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  Stack,
  IconButton,
  CssBaseline,
  LinearProgress,
} from "@mui/material";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import Cookies from "js-cookie";
import { ITask } from "./Interfaces";
import TodoTask from "./Components/TodoTask";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";

const App: React.FC = () => {
  const [task, setTask] = useState<string>("");
  const [deadline, setDeadline] = useState<number>(0);
  const [todoList, setTodoList] = useState<ITask[]>([]);
  const [mode, setMode] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  // ✅ NEW STATES for search + filter
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">(
    "all"
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: mode === "light" ? "#1976d2" : "#008cffff" },
          background: {
            default: mode === "light" ? "#f5f5f5" : "#121212",
            paper: mode === "light" ? "#ffffff" : "#ffffff20",
          },
          text: {
            primary: mode === "light" ? "#000000" : "#838383ff",
            secondary: mode === "light" ? "#333" : "#838383ff",
          },
        },
      }),
    [mode]
  );

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem("theme", mode);
  }, [mode]);

  // Load tasks from cookies
  useEffect(() => {
    const savedTasks = Cookies.get("tasks");
    if (savedTasks) {
      setTodoList(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      Cookies.set("tasks", JSON.stringify(todoList), { expires: 7 });
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [todoList]);

  // Add new task
  const addTask = () => {
    if (!task.trim() || deadline <= 0) return;
    const newTask: ITask = {
      id: Date.now().toString(),
      taskName: task,
      deadline,
      completed: false,
    };
    setTodoList([...todoList, newTask]);
    setTask("");
    setDeadline(0);
  };

  // Toggle complete
  const toggleTaskCompletion = (id: string) => {
    setTodoList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  // Edit task
  const editTask = (id: string, newName: string, newDeadline: number) => {
    setTodoList((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, taskName: newName, deadline: newDeadline } : t
      )
    );
  };

  // Delete task
  const deleteTask = (id: string) => {
    const taskToDelete = todoList.find((t) => t.id === id);
    if (taskToDelete && window.confirm(`Delete "${taskToDelete.taskName}"?`)) {
      setTodoList((prev) => prev.filter((t) => t.id !== id));
    }
  };

  // Drag handler
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const incompleteTasks = todoList.filter((t) => !t.completed);
    const completeTasks = todoList.filter((t) => t.completed);

    if (incompleteTasks.some((t) => t.id === active.id)) {
      const oldIndex = incompleteTasks.findIndex((t) => t.id === active.id);
      const newIndex = incompleteTasks.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(incompleteTasks, oldIndex, newIndex);
      setTodoList([...reordered, ...completeTasks]);
    } else {
      const oldIndex = completeTasks.findIndex((t) => t.id === active.id);
      const newIndex = completeTasks.findIndex((t) => t.id === over.id);
      const reordered = arrayMove(completeTasks, oldIndex, newIndex);
      setTodoList([...incompleteTasks, ...reordered]);
    }
  };

  // ✅ Apply Search + Filter
  const filteredTasks = todoList.filter((t) => {
    const matchesSearch = t.taskName
      .toLowerCase()
      .includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    if (filter === "completed") return t.completed && matchesSearch;
    if (filter === "incomplete") return !t.completed && matchesSearch;
    return true;
  });

  const incompleteTasks = filteredTasks.filter((t) => !t.completed);
  const completeTasks = filteredTasks.filter((t) => t.completed);

  // ✅ Progress percentage
  const progress =
    todoList.length === 0
      ? 0
      : Math.round((completeTasks.length / todoList.length) * 100);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header with Theme Toggle */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          sx={(theme) => ({
            bgcolor: theme.palette.background.paper,
            p: 2,
            borderRadius: 2,
          })}
        >
          <Typography variant="h4" fontWeight="bold">
            ToDo Application
          </Typography>
          <IconButton
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            color="inherit"
          >
            {mode === "light" ? <Brightness4 /> : <Brightness7 />}
          </IconButton>
        </Box>

        {/* ✅ Progress Bar */}
        {todoList.length > 0 && (
          <Box mb={4}>
            <Typography gutterBottom>
              Progress: {progress}% ({completeTasks.length}/{todoList.length})
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
        )}

        {/* Input Form */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
          <Stack spacing={2}>
            <TextField
              label="Task Name"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              fullWidth
            />
            <TextField
              label="Deadline (days)"
              type="number"
              value={deadline}
              onChange={(e) => setDeadline(Number(e.target.value))}
              fullWidth
            />
            <Button
              variant="contained"
              color="primary"
              onClick={addTask}
              sx={{ py: 1.5 }}
            >
              Add Task
            </Button>
          </Stack>
        </Paper>

        {/* ✅ Search & Filter Controls */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              label="Search Task"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              fullWidth
            />
            <Button
              variant={filter === "all" ? "contained" : "outlined"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "incomplete" ? "contained" : "outlined"}
              onClick={() => setFilter("incomplete")}
            >
              Incomplete
            </Button>
            <Button
              variant={filter === "completed" ? "contained" : "outlined"}
              onClick={() => setFilter("completed")}
            >
              Completed
            </Button>
          </Stack>
        </Paper>

        {/* Task Sections */}
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <Grid container spacing={3}>
            {/* Incomplete */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 2, borderRadius: 3, height: "100%" }}
              >
                <Typography variant="h6" gutterBottom>
                  Incomplete Tasks
                </Typography>
                <SortableContext
                  items={incompleteTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack spacing={2}>
                    <AnimatePresence>
                      {incompleteTasks.length === 0 ? (
                        <Typography color="text.secondary">
                          No incomplete tasks 🎉
                        </Typography>
                      ) : (
                        incompleteTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TodoTask
                              task={task}
                              toggleTaskCompletion={toggleTaskCompletion}
                              editTask={editTask}
                              deleteTask={deleteTask}
                            />
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </Stack>
                </SortableContext>
              </Paper>
            </Grid>

            {/* Complete */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 2, borderRadius: 3, height: "100%" }}
              >
                <Typography variant="h6" gutterBottom>
                  Complete Tasks
                </Typography>
                <SortableContext
                  items={completeTasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Stack spacing={2}>
                    <AnimatePresence>
                      {completeTasks.length === 0 ? (
                        <Typography color="text.secondary">
                          No completed tasks yet
                        </Typography>
                      ) : (
                        completeTasks.map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 50 }}
                            transition={{ duration: 0.3 }}
                          >
                            <TodoTask
                              task={task}
                              toggleTaskCompletion={toggleTaskCompletion}
                              editTask={editTask}
                              deleteTask={deleteTask}
                            />
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </Stack>
                </SortableContext>
              </Paper>
            </Grid>
          </Grid>
        </DndContext>
      </Container>
    </ThemeProvider>
  );
};

export default App;
