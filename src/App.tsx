import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Grid,
  TextField,
  Typography,
  Paper,
  Stack,
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

const App: React.FC = () => {
  const [task, setTask] = useState<string>("");
  const [deadline, setDeadline] = useState<number>(0);
  const [todoList, setTodoList] = useState<ITask[]>([]);

  // ✅ Load tasks from cookies
  useEffect(() => {
    const savedTasks = Cookies.get("tasks");
    if (savedTasks) {
      setTodoList(JSON.parse(savedTasks));
    }
  }, []);

  // ✅ Save tasks before exit
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

  const incompleteTasks = todoList.filter((t) => !t.completed);
  const completeTasks = todoList.filter((t) => t.completed);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Typography
        variant="h4"
        align="center"
        gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        ToDo Application
      </Typography>

      {/* Input Form */}
      <Paper
        elevation={3}
        sx={{ p: 3, mb: 4, borderRadius: 3, backgroundColor: "#fafafa" }}
      >
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

      {/* Task Sections */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <Grid container spacing={3}>
          {/* Incomplete */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 3,
                height: "100%",
                backgroundColor: "#fff3e0",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Incomplete Tasks
              </Typography>
              <SortableContext
                items={incompleteTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <Stack spacing={2}>
                  {incompleteTasks.length === 0 ? (
                    <Typography color="text.secondary">
                      No incomplete tasks 🎉
                    </Typography>
                  ) : (
                    incompleteTasks.map((task) => (
                      <TodoTask
                        key={task.id}
                        task={task}
                        toggleTaskCompletion={toggleTaskCompletion}
                        editTask={editTask}
                        deleteTask={deleteTask}
                      />
                    ))
                  )}
                </Stack>
              </SortableContext>
            </Paper>
          </Grid>

          {/* Complete */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 3,
                height: "100%",
                backgroundColor: "#e8f5e9",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Complete Tasks
              </Typography>
              <SortableContext
                items={completeTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <Stack spacing={2}>
                  {completeTasks.length === 0 ? (
                    <Typography color="text.secondary">
                      No completed tasks yet
                    </Typography>
                  ) : (
                    completeTasks.map((task) => (
                      <TodoTask
                        key={task.id}
                        task={task}
                        toggleTaskCompletion={toggleTaskCompletion}
                        editTask={editTask}
                        deleteTask={deleteTask}
                      />
                    ))
                  )}
                </Stack>
              </SortableContext>
            </Paper>
          </Grid>
        </Grid>
      </DndContext>
    </Container>
  );
};

export default App;
