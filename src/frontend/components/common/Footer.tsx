import React from 'react';
import { Typography, Container, Link } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

// Define styles for footer components
const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(6, 0),
    marginTop: 'auto',
  },
  text: {
    textAlign: 'center',
  },
  link: {
    margin: theme.spacing(0, 1),
  },
}));

// Function to generate copyright text with current year
const Copyright = () => {
  const currentYear = new Date().getFullYear();
  return `© ${currentYear} Jump Inventory Management. All rights reserved.`;
};

// Functional component that renders the application footer
const Footer: React.FC = () => {
  // Initialize styles using useStyles hook
  const classes = useStyles();

  return (
    <footer className={classes.footer}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="textSecondary" className={classes.text}>
          {Copyright()}
        </Typography>
        <Typography variant="body2" color="textSecondary" className={classes.text}>
          <Link color="inherit" href="/privacy" className={classes.link}>
            Privacy Policy
          </Link>
          <Link color="inherit" href="/terms" className={classes.link}>
            Terms of Service
          </Link>
        </Typography>
      </Container>
    </footer>
  );
};

export default Footer;