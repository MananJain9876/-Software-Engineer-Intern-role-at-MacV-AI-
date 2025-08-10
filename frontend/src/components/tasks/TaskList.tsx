import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { taskService, projectService } from '../../services';
import type { Task, Project } from '../../services';

const getStatusColor = (status: Task['status'] | string): 'warning' | 'info' | 'success' | 'default' => {
  switch (status) {
    case 'TODO':
      return 'warning';
    case 'IN_PROGRESS':
      return 'info';
    case 'DONE':
      return 'success';
    default:
      return 'default';
  }
};

const getPriorityColor = (priority: Task['priority'] | string): 'success' | 'warning' | 'error' | 'default' => {
  switch (priority) {
    case 'LOW':
      return 'success';
    case 'MEDIUM':
      return 'warning';
    case 'HIGH':
      return 'error';
    default:
      return 'default';
  }
};

const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<'' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('');
  const [priorityFilter, setPriorityFilter] = useState<'' | 'LOW' | 'MEDIUM' | 'HIGH'>('');
  const [projectFilter, setProjectFilter] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksData, projectsData] = await Promise.all([
        taskService.getTasks({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          project_id: projectFilter ? parseInt(projectFilter) : undefined,
        }),
        projectService.getProjects(),
      ]);
      setTasks(tasksData);
      setProjects(projectsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, priorityFilter, projectFilter]);

  const handleDeleteClick = (task: Task) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    try {
      await taskService.deleteTask(taskToDelete.id);
      setTasks(tasks.filter((t) => t.id !== taskToDelete.id));
      setDeleteDialogOpen(false);
      setTaskToDelete(null);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTaskToDelete(null);
  };

  const handleStatusFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setStatusFilter(event.target.value as '' | 'TODO' | 'IN_PROGRESS' | 'DONE');
  };

  const handlePriorityFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setPriorityFilter(event.target.value as '' | 'LOW' | 'MEDIUM' | 'HIGH');
  };

  const handleProjectFilterChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setProjectFilter(event.target.value as string);
  };

  const getProjectName = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  if (loading && tasks.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tasks
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/tasks/new"
        >
          New Task
        </Button>
      </Box>

      {/* Filters */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="status-filter-label">Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Status"
              onChange={handleStatusFilterChange}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="priority-filter-label">Priority</InputLabel>
            <Select
              labelId="priority-filter-label"
              id="priority-filter"
              value={priorityFilter}
              label="Priority"
              onChange={handlePriorityFilterChange}
            >
              <MenuItem value="">All Priorities</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel id="project-filter-label">Project</InputLabel>
            <Select
              labelId="project-filter-label"
              id="project-filter"
              value={projectFilter}
              label="Project"
              onChange={handleProjectFilterChange}
            >
              <MenuItem value="">All Projects</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id.toString()}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {tasks.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No tasks found
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {statusFilter || priorityFilter || projectFilter
              ? 'Try changing your filters or create a new task'
              : 'Create your first task to get started'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to="/tasks/new"
          >
            Create Task
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {task.description || 'No description'}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    <Chip
                      label={task.status}
                      size="small"
                      color={getStatusColor(task.status)}
                    />
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                    />
                    {task.project_id && (
                      <Chip
                        label={getProjectName(task.project_id)}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  {task.due_date && (
                    <Typography variant="body2">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/tasks/${task.id}`}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/tasks/edit/${task.id}`}
                  >
                    Edit
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDeleteClick(task)}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Task</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the task "{taskToDelete?.title}"? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TaskList;