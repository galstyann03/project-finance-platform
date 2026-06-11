import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ApolloProvider } from "@apollo/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { apolloClient } from "./apollo";
import App from "./App";

const theme = createTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApolloProvider client={apolloClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </ApolloProvider>
  </StrictMode>,
);
