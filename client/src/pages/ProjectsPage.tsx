import { useState } from "react";
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
  Chip,
  Container,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  ACCEPT_INVITATION,
  CREATE_PROJECT,
  INVITE_TO_PROJECT,
  MY_INVITATIONS,
  PROJECTS,
  REJECT_INVITATION,
} from "../graphql";
import { clearToken } from "../auth";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  location: yup.string().required("Location is required"),
});

type FormValues = { name: string; location: string };

export function ProjectsPage({ onLogout }: { onLogout: () => void }) {
  const { data, loading, error, refetch } = useQuery(PROJECTS);
  const invitations = useQuery(MY_INVITATIONS);

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

  const [inviteProjectId, setInviteProjectId] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState<string | null>(null);
  const [inviteErr, setInviteErr] = useState<string | null>(null);

  const [invite, { loading: inviting }] = useMutation(INVITE_TO_PROJECT, {
    onError: (e) => {
      setInviteMsg(null);
      setInviteErr(e.message);
    },
    onCompleted: () => {
      setInviteErr(null);
      setInviteMsg("Invitation sent");
      setInviteEmail("");
    },
  });

  const [accept] = useMutation(ACCEPT_INVITATION, {
    onCompleted: () => {
      invitations.refetch();
      refetch();
    },
  });
  const [reject] = useMutation(REJECT_INVITATION, {
    onCompleted: () => invitations.refetch(),
  });

  const onSubmit = (values: FormValues) =>
    createProject({ variables: { input: values } });

  const onInvite = () => {
    if (!inviteProjectId || !inviteEmail) return;
    invite({ variables: { projectId: inviteProjectId, email: inviteEmail } });
  };

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

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Invite a member
            </Typography>
            {inviteErr && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {inviteErr}
              </Alert>
            )}
            {inviteMsg && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {inviteMsg}
              </Alert>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="invite-project-label">Project</InputLabel>
                <Select
                  labelId="invite-project-label"
                  label="Project"
                  value={inviteProjectId}
                  onChange={(e) => setInviteProjectId(e.target.value)}
                >
                  {data?.projects?.map((p: any) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Invitee email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button variant="contained" onClick={onInvite} disabled={inviting}>
                Send invitation
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="h6" gutterBottom>
          My invitations
        </Typography>
        {invitations.data?.myInvitations?.length === 0 && (
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            No invitations.
          </Typography>
        )}
        <List sx={{ mb: 3 }}>
          {invitations.data?.myInvitations?.map((inv: any) => (
            <ListItem
              key={inv.id}
              divider
              secondaryAction={
                inv.status === "PENDING" && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => accept({ variables: { id: inv.id } })}
                    >
                      Accept
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => reject({ variables: { id: inv.id } })}
                    >
                      Reject
                    </Button>
                  </Stack>
                )
              }
            >
              <ListItemText primary={inv.project.name} />
              <Chip label={inv.status} size="small" sx={{ mr: 2 }} />
            </ListItem>
          ))}
        </List>

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
