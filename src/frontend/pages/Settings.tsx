import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Snackbar,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';
import { updateUserSettings, fetchUserSettings } from '../store/actions/settingsActions';
import { RootState } from '../store/types';
import { UserSettings } from '../types/UserSettings';

// Define styles for settings page components
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
  },
  form: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
}));

const Settings: React.FC = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const userSettings = useSelector((state: RootState) => state.settings.userSettings);

  // Set up local state for form fields and snackbar
  const [formData, setFormData] = useState<UserSettings>(userSettings);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Fetch user settings on component mount
  useEffect(() => {
    dispatch(fetchUserSettings());
  }, [dispatch]);

  // Update local state when userSettings change
  useEffect(() => {
    setFormData(userSettings);
  }, [userSettings]);

  // Handle input changes in form fields
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Handle changes in switch components
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: checked }));
  };

  // Handle form submission and save user settings
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await dispatch(updateUserSettings(formData));
      setSnackbarMessage('Settings updated successfully');
      setSnackbarSeverity('success');
    } catch (error) {
      setSnackbarMessage('Error updating settings');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
  };

  return (
    <div className={classes.root}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h4" gutterBottom>
            Settings
          </Typography>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper className={classes.paper}>
            <form className={classes.form} onSubmit={handleSubmit}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.emailNotifications}
                    onChange={handleSwitchChange}
                    name="emailNotifications"
                    color="primary"
                  />
                }
                label="Email Notifications"
              />
              <TextField
                fullWidth
                label="Default View"
                name="defaultView"
                value={formData.defaultView}
                onChange={handleInputChange}
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="list">List</option>
                <option value="grid">Grid</option>
              </TextField>
              <TextField
                fullWidth
                label="Items Per Page"
                name="itemsPerPage"
                type="number"
                value={formData.itemsPerPage}
                onChange={handleInputChange}
                inputProps={{ min: 10, max: 100 }}
              />
              <TextField
                fullWidth
                label="Date Format"
                name="dateFormat"
                value={formData.dateFormat}
                onChange={handleInputChange}
                select
                SelectProps={{
                  native: true,
                }}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </TextField>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.submitButton}
              >
                Save Settings
              </Button>
            </form>
          </Paper>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Settings;