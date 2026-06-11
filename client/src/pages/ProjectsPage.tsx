import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQuery } from "@apollo/client";
import {
  Alert,
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  List,
  ListItem,
  ListItemText,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { CREATE_PROJECT, PROJECTS } from "../graphql";
import { clearToken } from "../auth";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  location: yup.string().required("Location is required"),
});

type FormValues = { name: string; location: string };

export function ProjectsPage({ onLogout }: { onLogout: () => void }) {
  const { data, loading, error, refetch } = useQuery(PROJECTS);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const [createProject, { loading: creating }] = useMutation(CREATE_PROJECT, {
    onCompleted: () => {
      reset();
      refetch();
    },
  });

  const onSubmit = (values: FormValues) =>
    createProject({ variables: { input: values } });

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Projects
          </Typography>
          <Button
            color="inherit"
            onClick={() => {
              clearToken();
              onLogout();
            }}
          >
            Log out
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              New project
            </Typography>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="Name"
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <TextField
                label="Location"
                {...register("location")}
                error={!!errors.location}
                helperText={errors.location?.message}
              />
              <Button type="submit" variant="contained" disabled={creating}>
                Create
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="h6" gutterBottom>
          Your projects
        </Typography>
        {loading && <Typography>Loading…</Typography>}
        {error && <Alert severity="error">{error.message}</Alert>}
        <List>
          {data?.projects?.map((p: any) => (
            <ListItem key={p.id} divider>
              <ListItemText
                primary={p.name}
                secondary={`${p.location} · owner: ${p.owner.email}`}
              />
            </ListItem>
          ))}
          {data?.projects?.length === 0 && (
            <Typography color="text.secondary">No projects yet.</Typography>
          )}
        </List>
      </Container>
    </>
  );
}
