import { TrackerConfig, ErrorPayload, ReqContext } from "./types.js";
import { extractErrorLocationFromStackTrace } from "./utils.js";

export class ErrorTracker {
  protected config: TrackerConfig;
  protected isSending: boolean;

  constructor(config: TrackerConfig) {
    if (!config) {
      throw new Error("[Observer SDK] Config is Required.");
    }
    this.config = config;
    this.isSending = false;
    this.setupGlobalHandlers();
  }

  /**
   * Automatically captures unhandled exceptions and promise rejections.
   */
  protected setupGlobalHandlers(): void {
    // Node.js process-level error handlers
    process.on("uncaughtException", (error: Error) => {
      this.captureException(error);
      // Best Practice: Give the SDK a moment to flush the network request,
      // then gracefully exit since the application state is now corrupted.
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    });

    process.on("unhandledRejection", (reason: unknown) => {
      const error =
        reason instanceof Error ? reason : new Error(String(reason));
      this.captureException(error);
    });
  }

  /**
   * Manually capture an error and forward it to the endpoint.
   */

  public captureException(error: Error, context?: ReqContext): void {
    if (!this.config) {
      console.error("[Observer SDK] Config is Required.");
      return;
    }
    const errorLocation = extractErrorLocationFromStackTrace(error.stack!);
    const payload: ErrorPayload = {
      apiKey: this.config.apiKey,
      name: error.name,
      message: error.message || "Unknown Error",
      stack: error.stack,
      location: errorLocation,
      environment: this.config.environment!,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "Node.js",
      context,
    };
    console.log(payload);
    console.log("error location:", errorLocation);
    this._send(payload);
  }

  /**
   * Non-blocking HTTP POST request sending error data to the collection server.
   */

 protected _send(payload: ErrorPayload): void {
    if (!this.config) {
      console.error("[Observer SDK] Config is Required.");
      return;
    }
    
    if (this.isSending) {
      return; // Drop packet if already transmitting
    }

    this.isSending = true;
    console.log("sending request :", payload.message);

    fetch(this.config.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      keepalive: true,
      body: JSON.stringify(payload),
    })
      .catch((err) => {
        console.error("[ErrorTracker SDK Failed to send error payload]:", err);
      })
      .finally(() => {
        // Reset the flag ONLY after the network request completes (success or failure)
        this.isSending = false;
      });
  }
}
