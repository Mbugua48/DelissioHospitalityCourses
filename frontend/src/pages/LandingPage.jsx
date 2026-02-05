import React, { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Register from "../components/Register.jsx";
import Login from "../components/Login.jsx";


export default function LandingPage() {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: "grey.100",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {showRegister ? <Register /> : <Login />}
        <Box mt={2}>
          <Typography variant="body2">
            {showRegister ? "Already have an account? " : "Don't have an account? "}
            <Link component="button" variant="body2" onClick={() => setShowRegister(!showRegister)}>
              {showRegister ? "Sign In" : "Sign Up"}
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}