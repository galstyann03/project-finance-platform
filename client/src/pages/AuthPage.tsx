import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@apollo/client";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { LOGIN, REGISTER } from "../graphql";
import { setToken } from "../auth";

const schema = yup.object({
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "At least 6 characters")
    .required("Password is required"),
});

type FormValues = { email: string; password: string };

export function AuthPage({ onAuth }: { onAuth: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(schema) });

  const mutation = mode === "login" ? LOGIN : REGISTER;
  const [submit, { loading }] = useMutation(mutation, {
    onError: (e) => setErrorMsg(e.message),
    onCompleted: (data) => {
      const payload = mode === "login" ? data.login : data.register;
      setToken(payload.token);
      onAuth();
    },
  });

  const onSubmit = (values: FormValues) => {
    setErrorMsg(null);
    submit({ variables: { input: values } });
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
      <Card sx={{ width: 380 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            {mode === "login" ? "Log in" : "Register"}
          </Typography>

          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              label="Email"
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              type="password"
              {...register("password")}
              error={!!errors.password}
              helperText={errors.password?.message}
            />
            <Button type="submit" variant="contained" disabled={loading}>
              {mode === "login" ? "Log in" : "Register"}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 2 }}>
            {mode === "login" ? "No account?" : "Have an account?"}{" "}
            <Link
              component="button"
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setMode(mode === "login" ? "register" : "login");
              }}
            >
              {mode === "login" ? "Register" : "Log in"}
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
