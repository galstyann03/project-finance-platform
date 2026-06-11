import { useState } from "react";
import { AuthPage } from "./pages/AuthPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { getToken } from "./auth";

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());

  return authed ? (
    <ProjectsPage onLogout={() => setAuthed(false)} />
  ) : (
    <AuthPage onAuth={() => setAuthed(true)} />
  );
}
