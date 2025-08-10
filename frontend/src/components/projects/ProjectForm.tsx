import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { projectService } from '../../services';
import type { Project, ProjectCreate, ProjectUpdate } from '../../services';

interface ProjectFormProps {
  isEdit?: boolean;
}

const ProjectForm = ({ isEdit = false }: ProjectFormProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectCreate | ProjectUpdate>({
    name: '',
    description: '',
  });

  useEffect(() => {
    const fetchProject = async () => {
      if (!isEdit || !id) return;

      try {
        setLoading(true);
        const project = await projectService.getProject(parseInt(id));
        setFormData({
          name: project.name,
          description: project.description || '',
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project data');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [isEdit, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEdit && id) {
        await projectService.updateProject(parseInt(id), formData as ProjectUpdate);
      } else {
        await projectService.createProject(formData as ProjectCreate);
      }
      navigate('/projects');
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project');
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
        onClick={() => navigate('/projects')}
        sx={{ mb: 2 }}
      >
        Back to Projects
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEdit ? 'Edit Project' : 'Create New Project'}
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
            id="name"
            label="Project Name"
            name="name"
            autoFocus
            value={formData.name}
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
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="outlined"
              onClick={() => navigate('/projects')}
              sx={{ mr: 1 }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submitting || !formData.name.trim()}
            >
              {submitting ? <CircularProgress size={24} /> : isEdit ? 'Update' : 'Create'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectForm;