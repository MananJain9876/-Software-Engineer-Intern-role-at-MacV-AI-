import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { taskService, projectService } from '../../services';
import type { Task, Project } from '../../services';

const getStatusColor = (status: string) => {
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

const getPriorityColor = (priority: string) => {
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

const TaskDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const taskData = await taskService.getTask(parseInt(id));
        setTask(taskData);

        // If task has a project, fetch project details
        if (taskData.project_id) {
          const projectData = await projectService.getProject(taskData.project_id);
          setProject(projectData);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching task details:', err);
        setError('Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !task) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/tasks')}
          sx={{ mb: 2 }}
        >
          Back to Tasks
        </Button>
        <Typography color="error" variant="h6">
          {error || 'Task not found'}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/tasks')}
        sx={{ mb: 2 }}
      >
        Back to Tasks
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            {task.title}
          </Typography>
          <IconButton
            color="primary"
            component={RouterLink}
            to={`/tasks/edit/${task.id}`}
          >
            <EditIcon />
          </IconButton>
        </Box>

        <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
          <Chip
            label={task.status}
            color={getStatusColor(task.status)}
          />
          <Chip
            label={task.priority}
            color={getPriorityColor(task.priority)}
          />
          {project && (
            <Chip
              label={project.name}
              variant="outlined"
              component={RouterLink}
              to={`/projects/${project.id}`}
              clickable
            />
          )}
        </Box>

        <Typography variant="body1" paragraph>
          {task.description || 'No description provided'}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" fontWeight="bold">
              Due Date
            </Typography>
            <Typography variant="body1">
              {task.due_date
                ? new Date(task.due_date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'No due date set'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle1" fontWeight="bold">
              Assigned To
            </Typography>
            <Typography variant="body1">
              {task.assigned_user_id ? `User ID: ${task.assigned_user_id}` : 'Unassigned'}
            </Typography>
          </Grid>

          {project && (
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Project
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  component={RouterLink}
                  to={`/projects/${project.id}`}
                >
                  View Project: {project.name}
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
                taskService.deleteTask(task.id).then(() => {
                  navigate('/tasks');
                });
              }
            }}
          >
            Delete Task
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default TaskDetail;