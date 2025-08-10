import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { projectService, taskService } from '../../services';
import type { Project, Task } from '../../services';

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

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const projectData = await projectService.getProject(parseInt(id));
        setProject(projectData);

        // Fetch tasks for this project
        const tasksData = await taskService.getTasks({ project_id: parseInt(id) });
        setTasks(tasksData);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching project details:', err);
        setError('Failed to load project details');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/projects')}
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>
        <Typography color="error" variant="h6">
          {error || 'Project not found'}
        </Typography>
      </Container>
    );
  }

  // Group tasks by status
  const todoTasks = tasks.filter((task) => task.status === 'TODO');
  const inProgressTasks = tasks.filter((task) => task.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((task) => task.status === 'DONE');

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/projects')}
        sx={{ mb: 2 }}
      >
        Back to Projects
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1">
            {project.name}
          </Typography>
          <IconButton
            color="primary"
            component={RouterLink}
            to={`/projects/edit/${project.id}`}
          >
            <EditIcon />
          </IconButton>
        </Box>

        <Typography variant="body1" paragraph>
          {project.description || 'No description provided'}
        </Typography>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
          <Typography variant="h5" component="h2">
            Tasks
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={RouterLink}
            to={`/tasks/new?project_id=${project.id}`}
          >
            Add Task
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* To Do Tasks */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: 'warning.light', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              To Do ({todoTasks.length})
            </Typography>
          </Paper>
          {todoTasks.length > 0 ? (
            todoTasks.map((task) => (
              <Card key={task.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {task.description || 'No description'}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                    />
                    {task.due_date && (
                      <Chip
                        label={`Due: ${new Date(task.due_date).toLocaleDateString()}`}
                        size="small"
                      />
                    )}
                  </Box>
                  <Box mt={2}>
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
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              No tasks in this status
            </Typography>
          )}
        </Grid>

        {/* In Progress Tasks */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: 'info.light', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              In Progress ({inProgressTasks.length})
            </Typography>
          </Paper>
          {inProgressTasks.length > 0 ? (
            inProgressTasks.map((task) => (
              <Card key={task.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {task.description || 'No description'}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                    />
                    {task.due_date && (
                      <Chip
                        label={`Due: ${new Date(task.due_date).toLocaleDateString()}`}
                        size="small"
                      />
                    )}
                  </Box>
                  <Box mt={2}>
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
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              No tasks in this status
            </Typography>
          )}
        </Grid>

        {/* Done Tasks */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, bgcolor: 'success.light', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Done ({doneTasks.length})
            </Typography>
          </Paper>
          {doneTasks.length > 0 ? (
            doneTasks.map((task) => (
              <Card key={task.id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {task.description || 'No description'}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Chip
                      label={task.priority}
                      size="small"
                      color={getPriorityColor(task.priority)}
                    />
                    {task.due_date && (
                      <Chip
                        label={`Due: ${new Date(task.due_date).toLocaleDateString()}`}
                        size="small"
                      />
                    )}
                  </Box>
                  <Box mt={2}>
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
                  </Box>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              No tasks in this status
            </Typography>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProjectDetail;