export default function Login({
  authenticate,
  loading = false,
  error,
}: {
  authenticate: (username: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="login-card">
      <div className="eyebrow">Access Dashboard</div>
      <h2 className="login-title">Sign in to StreamX Console</h2>
      <p className="login-subtitle">
        Use your configured AUTH_USER and AUTH_PASS credentials to view live
        streaming analytics.
      </p>

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
        <label className="form-label">
          Username
          <input
            name="username"
            placeholder="ops-admin"
            required
            autoComplete="username"
            className="input-field"
            disabled={loading}
          />
        </label>

        <label className="form-label">
          Password
          <input
            name="password"
            type="password"
            placeholder="********"
            required
            autoComplete="current-password"
            className="input-field"
            disabled={loading}
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </div>
  );
}
