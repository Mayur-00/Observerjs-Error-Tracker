import {
  TrackerConfig,
  ErrorPayload,
  IReqContext,
  IErrorContext,
} from "./types.js";
import { extractErrorLocation, getDeviceContext } from "./utils.js";

export class ErrorTracker {
  protected config: TrackerConfig;
  protected isSending: boolean;

  constructor(config: TrackerConfig) {
    if (!config) {
      throw new Error("[Observer SDK] Config is Required.");
    }
    this.config = {
      environment: config.environment ?? "development",
      apiKey: config.apiKey,
      endpoint: config.endpoint,
    };
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

  public captureException(error: Error, context?: IReqContext): void {
    if (!this.config) {
      console.error("[Observer SDK] Config is Required.");
      return;
    }
    const locationObj = extractErrorLocation(error.stack!);
    const deviceContext = getDeviceContext(this.config.environment);
    const errorContext: IErrorContext = {
      errorType: error.name,
      message: error.message,
      stackTrace: error.stack!,
      filePath: locationObj?.file || "",
      errorLineNumber: locationObj?.line || 0,
      errorColomnNumber: locationObj?.column || 0,
    };

    const payload: ErrorPayload = {
      errorContext,
      deviceContext,
      reqContext: context,
      timestamp: new Date().toISOString(),
    };
    console.log(payload);
    console.log("error location:", locationObj?.file);
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
    console.log("sending request :", payload.errorContext.message);

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
