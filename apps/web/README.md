# Observer web app

The web app provides Better Auth email/password and Google sign-in, a project
dashboard, project error lists, and error detail/state management.

## Local setup

Set `NEXT_PUBLIC_API_URL` to the API origin (for example,
`http://localhost:5000`) in the web app environment. The API must be running and
configured with the matching `FRONTEND_URL` as a trusted Better Auth origin.
Google sign-in additionally requires valid Google OAuth credentials in the API
environment. Email/password auth is handled by Better Auth.

Run the app from the repository root:

```bash
npm run dev --workspace=web
```

Open [http://localhost:3000](http://localhost:3000). Create an account or sign
in, then create a project to view its errors. The API key is shown once after
project creation.
