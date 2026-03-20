import React from "react";

export default function Login({
  authenticate,
}: {
  authenticate: (username: string, password: string) => Promise<void>;
}) {
  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form
          className="login-form"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const username = formData.get("username") as string;
            const password = formData.get("password") as string;
            authenticate(username, password);
          }}
        >
          <input
            name="username"
            placeholder="Username"
            required
            autoComplete="username"
            className="input-field"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            autoComplete="current-password"
            className="input-field"
          />
          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
