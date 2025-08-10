import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { taskService, projectService } from '../../services';
import type { Task, TaskCreate, TaskUpdate, Project } from '../../services';

interface TaskFormProps {
  isEdit?: boolean;
}

const TaskForm = ({ isEdit = false }: TaskFormProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const projectIdFromQuery = queryParams.get('project_id');

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [formData, setFormData] = useState<TaskCreate | TaskUpdate>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    project_id: projectIdFromQuery ? parseInt(projectIdFromQuery) : undefined,
    due_date: undefined,
    assigned_user_id: undefined,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch projects for the dropdown
        const projectsData = await projectService.getProjects();
        setProjects(projectsData);

        // If editing, fetch task data
        if (isEdit && id) {
          const taskData = await taskService.getTask(parseInt(id));
          setFormData({
            title: taskData.title,
            description: taskData.description || '',
            status: taskData.status,
            priority: taskData.priority,
            project_id: taskData.project_id,
            due_date: taskData.due_date,
            assigned_user_id: taskData.assigned_user_id,
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isEdit, id, projectIdFromQuery]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({ ...prev, due_date: date ? date.toISOString() : undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEdit && id) {
        await taskService.updateTask(parseInt(id), formData as TaskUpdate);
      } else {
        await taskService.createTask(formData as TaskCreate);
      }
      navigate('/tasks');
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Failed to save task');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/tasks')}
        sx={{ mb: 2 }}
      >
        Back to Tasks
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEdit ? 'Edit Task' : 'Create New Task'}
        </Typography>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="title"
            label="Task Title"
            name="title"
            autoFocus
            value={formData.title}
            onChange={handleChange}
            disabled={submitting}
          />
          
          <TextField
            margin="normal"
            fullWidth
            id="description"
            label="Description"
            name="description"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
            disabled={submitting}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              id="status"
              name="status"
              value={formData.status}
              label="Status"
              onChange={handleChange}
              disabled={submitting}
            >
              <MenuItem value="TODO">To Do</MenuItem>
              <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
              <MenuItem value="DONE">Done</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              id="priority"
              name="priority"
              value={formData.priority}
              label="Priority"
              onChange={handleChange}
              disabled={submitting}
            >
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="project-label">Project</InputLabel>
            <Select
              labelId="project-label"
              id="project_id"
              name="project_id"
              value={formData.project_id || ''}
              label="Project"
              onChange={handleChange}
              disabled={submitting}
            >
              <MenuItem value="">No Project</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                label="Due Date"
                value={formData.due_date ? new Date(formData.due_date) : null}
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    margin: 'normal',
                  },
                }}
              />
            </LocalizationProvider>
            <FormHelperText>Optional: Set a due date for this task</FormHelperText>
          </FormControl>
          
          <TextField
            margin="normal"
            fullWidth
            id="assigned_user_id"
            label="Assigned User ID"
            name="assigned_user_id"
            type="number"
            value={formData.assigned_user_id || ''}
            onChange={handleChange}
            disabled={submitting}
            helperText="Optional: Assign this task to a user by ID"
          />
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/tasks')}
              sx={{ mr: 1 }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting || !formData.title.trim()}
            >
              {submitting ? <CircularProgress size={24} /> : isEdit ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TaskForm;