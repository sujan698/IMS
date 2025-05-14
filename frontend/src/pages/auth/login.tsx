"use client";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../app/store";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { login } from "../../features/auth/authSlice";
import { Input, Button, Typography, message } from "antd";

// Validation schema
const schema = yup
  .object({
    email: yup
      .string()
      .email("Invalid email address")
      .required("Email is required"),
    password: yup.string().required("Password is required"),
  })
  .required();

type FormData = yup.InferType<typeof schema>;

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading } = useSelector((state: RootState) => state.auth);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(login(data)).unwrap();
      message.success("Login successful. Welcome to Inventory Pro!");
    } catch (error) {
      message.error((error as string) || "Login failed.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <Typography.Title level={2} style={{ textAlign: "center" }}>
          Login
        </Typography.Title>
        <Typography.Paragraph style={{ textAlign: "center" }}>
          Enter your credentials to continue
        </Typography.Paragraph>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Email Field */}
          <div style={{ marginBottom: "1rem" }}>
            <label>Email</label>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="email"
                  placeholder="name@example.com"
                  status={errors.email ? "error" : ""}
                />
              )}
            />
            {errors.email && (
              <Typography.Text type="danger">
                {errors.email.message}
              </Typography.Text>
            )}
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: "1rem" }}>
            <label>Password</label>
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input.Password
                  {...field}
                  placeholder="Enter your password"
                  status={errors.password ? "error" : ""}
                />
              )}
            />
            {errors.password && (
              <Typography.Text type="danger">
                {errors.password.message}
              </Typography.Text>
            )}
          </div>

          <Button type="primary" htmlType="submit" block loading={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    minHeight: "100vh",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f2f5",
    padding: "1rem",
  },
  formBox: {
    width: "100%",
    maxWidth: "400px",
    padding: "2rem",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
};

export default Login;
