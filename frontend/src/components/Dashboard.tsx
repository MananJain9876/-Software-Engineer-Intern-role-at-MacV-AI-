import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import { projectService, taskService } from '../services';
import type { Project, Task } from '../services';

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsData, tasksData] = await Promise.all([
          projectService.getProjects(),
          taskService.getTasks(),
        ]);
        setProjects(projectsData);
        setTasks(tasksData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" variant="h6" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  // Get tasks due soon (within 7 days)
  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  
  const tasksDueSoon = tasks.filter((task) => {
    if (!task.due_date) return false;
    const dueDate = new Date(task.due_date);
    return dueDate <= nextWeek && dueDate >= today;
  });

  // Get tasks by status
  const todoTasks = tasks.filter((task) => task.status === 'TODO');
  const inProgressTasks = tasks.filter((task) => task.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter((task) => task.status === 'DONE');

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h5" gutterBottom>
              Welcome to your Task Management Dashboard
            </Typography>
            <Typography variant="body1">
              You have {projects.length} projects and {tasks.length} tasks.
            </Typography>
          </Paper>
        </Grid>

        {/* Projects Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Recent Projects
              </Typography>
              <Button component={RouterLink} to="/projects" size="small">
                View All
              </Button>
            </Box>
            <Divider />
            <List sx={{ overflow: 'auto', flex: 1 }}>
              {projects.length > 0 ? (
                projects.slice(0, 5).map((project) => (
                  <ListItem
                    key={project.id}
                    button
                    component={RouterLink}
                    to={`/projects/${project.id}`}
                  >
                    <ListItemText primary={project.name} secondary={project.description} />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No projects found" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Tasks Overview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 240 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Tasks Due Soon
              </Typography>
              <Button component={RouterLink} to="/tasks" size="small">
                View All
              </Button>
            </Box>
            <Divider />
            <List sx={{ overflow: 'auto', flex: 1 }}>
              {tasksDueSoon.length > 0 ? (
                tasksDueSoon.map((task) => (
                  <ListItem
                    key={task.id}
                    button
                    component={RouterLink}
                    to={`/tasks/${task.id}`}
                  >
                    <ListItemText
                      primary={task.title}
                      secondary={
                        <>Due: {new Date(task.due_date!).toLocaleDateString()}</>
                      }
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No tasks due soon" />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Task Status Summary */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Task Status Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'warning.light',
                  }}
                >
                  <Typography variant="h4">{todoTasks.length}</Typography>
                  <Typography variant="body1">To Do</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'info.light',
                  }}
                >
                  <Typography variant="h4">{inProgressTasks.length}</Typography>
                  <Typography variant="body1">In Progress</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper
                  sx={{
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'success.light',
                  }}
                >
                  <Typography variant="h4">{doneTasks.length}</Typography>
                  <Typography variant="body1">Done</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;