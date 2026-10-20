
import { TrackerConfig, ErrorPayload, ReqContext} from "./types.js";
import { extractErrorLocationFromStackTrace } from "./utils.js";

export class ErrorTracker {
  private config: TrackerConfig;

   constructor(config: TrackerConfig) {
    if(!config){
      throw new Error("[Observer SDK] Config is Required.");
    }
    this.setupGlobalHandlers();
    this.config = config;
  }


  /**
   * Automatically captures unhandled exceptions and promise rejections.
   */
  protected setupGlobalHandlers(): void {
      // Node.js process-level error handlers
      process.on('uncaughtException', (error: Error) => {
        this.captureException(error);
        // Best Practice: Give the SDK a moment to flush the network request, 
      // then gracefully exit since the application state is now corrupted.
      setTimeout(() => {
        process.exit(1);
      }, 1000);
      });

      process.on('unhandledRejection', (reason: unknown) => {
        const error = reason instanceof Error ? reason : new Error(String(reason));
        this.captureException(error);
      });
    
  }

  /**
   * Manually capture an error and forward it to the endpoint.
   */

  public captureException(error: Error, context?:ReqContext): void {

  const errorLocation = extractErrorLocationFromStackTrace(error.stack!);
    const payload: ErrorPayload = {
      apiKey: this.config.apiKey,
      name:error.name,
      message: error.message || 'Unknown Error',
      stack: error.stack,
      location:errorLocation,
      environment: this.config.environment!,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node.js',
      context
    };
    console.log(payload);
    console.log('error location:',errorLocation);
    this._send(payload);
  }

  /**
   * Non-blocking HTTP POST request sending error data to the collection server.
   */
  
  protected _send(payload: ErrorPayload): void {
    // Non-blocking background fetch
    console.log("sending request :", payload.message)
    fetch(this.config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.config.apiKey,
      },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error('[ErrorTracker SDK Failed to send error payload]:', err);
    });
  }
}