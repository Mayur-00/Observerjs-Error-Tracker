# Observer SDK for Express

`@observer-js/express` is the Observer error-monitoring SDK for **Express.js
applications**. Express support is the SDK's current focus.

The SDK provides:

- `ErrorTracker` for configuring Observer and sending captured exceptions.
- `ExpressMiddleware` for Express error handling. It captures unhandled internal
  errors and returns them in a consistent JSON response format.
- `ApiError` for forwarding application errors with an HTTP status and error
  code.
- `captureException` for capturing an exception you handle yourself.

## Install

```sh
npm install @observer-js/express@latest
```

## Get your Observer credentials

Create an account in the Observer web app, create a project, and copy the
project's API key and endpoint. Keep these credentials private; load them from
environment variables rather than committing them to your source code.

## Configure the SDK

Create `src/config/observer.js`:

```js
import * as Observer from "@observer-js/express";

export const observerClient = new Observer.ErrorTracker({
  apiKey: process.env.OBSERVER_API_KEY,
  endpoint: process.env.OBSERVER_ENDPOINT,
  environment: process.env.NODE_ENV || "development",
});
```

Set `OBSERVER_API_KEY`, `OBSERVER_ENDPOINT`, and `NODE_ENV` in your **.env** file safely before starting the application.

## Express setup

Register `ExpressMiddleware` **after your routes** so Express can pass errors
from those routes to it. With Express 5, errors thrown from route handlers and
rejected route-handler promises are forwarded to error middleware.

```js
import express from "express";
import * as Observerjs from "@observer-js/express";
import { observerClient } from "./config/observer.js";

const app = express();
const router = express.Router();
const port = Number(process.env.PORT) || 8000;

app.use(express.json());
app.use("/", router);

router.get("/", (_request, response) => {
  response.send("Hello from the Observer Express example");
});

// Express 5 forwards this error to the error middleware below.
router.get("/error", (_request, _response) => {
  throw new Error("Example unhandled route error");
});

router.post("/profile", (request, response, next) => {
  const { first, last } = request.body ?? {};

  if (typeof first !== "string" || typeof last !== "string") {

     throw new Observerjs.ApiError(
        400,
        "Both first and last must be strings",
        "VALIDATION_ERROR",
      ), // use this to throw custom but consistant errors

  }

  response.status(200).json({ name: `${first} ${last}`.trim() });
});

// Keep error middleware after every route and other middleware.
app.use(Observerjs.ExpressMiddleware(observerClient));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
```
Use **ExpressMiddleware** to capture custom or unhandled errors gracefully.

```js
    app.use(Observerjs.ExpressMiddleware(observerClient));
```

Generic internal errors (HTTP status `500`) are sent to Observer with request
context, including the HTTP method, route, and user agent. The middleware
returns a JSON error response with this shape:

```json
{
  "success": false,
  "message": "Something went wrong",
  "error_code": "SERVER_ERROR",
  "errors": []
}
```

The `stack` field is included only when `NODE_ENV` is `"development"`. Avoid
running production deployments with that environment value to prevent exposing
stack traces to clients. Errors created with `ApiError` retain their supplied
status, message, error code, and errors; use it for expected application errors
such as validation failures.

## Note

Always use `ExpressMiddleware` if you are throwing custom errors with `ApiError`

## Capture an exception manually

Use `captureException` when you catch an exception and handle it locally instead
of forwarding it through Express error middleware:

```js
try {
  await performOperation();
} catch (error) {
  if (!(error instanceof Error)) {
    throw error;
  }

  observerClient.captureException(error, {
    method: request.method,
    route: request.originalUrl,
    userAgent: request.get("user-agent") ?? null,
  });

  // Handle the error here, for example by returning a suitable response.
}
```

If you want `ExpressMiddleware` to handle an error, pass it to `next(error)`
instead of calling `captureException` first. The middleware captures internal
server errors itself, so doing both would report the same error twice.

## Automatic process-level capture

Creating an `ErrorTracker` also registers Node.js process handlers for
`uncaughtException` and `unhandledRejection`. An uncaught exception is reported
and the process exits after a short delay. Use normal Express error handling
for request errors; process-level handlers are a last-resort safety net, not a
replacement for handling errors in your application.
