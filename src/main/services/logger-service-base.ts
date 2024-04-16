import { Logger } from "@ubio/framework";

/**
 * Base class for the `LoggerService`.
 * 
 * By declaring it as the abstract base class for `LoggerService` in the `app.ts` file,
 * it ensures that only the `LoggerService`, rather than other loggers extending the `Logger` class,
 * can be injected. This prevents unintended injections of the `LoggerService` class into other services,
 * such as the Http Service from the `@ubio/framework` package.
 * 
 * @example
 *  mesh.service(LoggerServiceBase, LoggerService);
 *  // Instead of:
 *  mesh.service(Logger, LoggerService); // This will inject the LoggerService for any logger injection using the `Logger` abstract class
 */
export abstract class LoggerServiceBase extends Logger {}