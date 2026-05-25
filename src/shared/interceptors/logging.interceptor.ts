import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { PublicUser } from 'src/models/user.models';
import { AppLoggerService } from 'src/services/logging/app-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly context = 'HTTP';

  constructor(private readonly appLogger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, body } = request;
    const user = request.user as PublicUser | undefined;
    const startedAt = Date.now();

    const requestMeta: Record<string, unknown> = {
      method,
      url,
    };

    if (user?.id) {
      requestMeta.userId = user.id;
    }

    if (user?.clientId) {
      requestMeta.clientId = user.clientId;
    }

    if (body && Object.keys(body).length > 0) {
      requestMeta.body = this.appLogger.sanitize(body);
    }

    this.appLogger.log(this.context, 'Incoming request', requestMeta);

    return next.handle().pipe(
      tap(() => {
        this.appLogger.log(this.context, 'Request completed', {
          method,
          url,
          statusCode: response.statusCode,
          durationMs: Date.now() - startedAt,
          userId: user?.id,
          clientId: user?.clientId,
        });
      }),
      catchError((error) => {
        const statusCode =
          typeof error?.getStatus === 'function' ? error.getStatus() : 500;

        this.appLogger.error(
          this.context,
          'Request failed',
          error,
          {
            method,
            url,
            statusCode,
            durationMs: Date.now() - startedAt,
            userId: user?.id,
            clientId: user?.clientId,
          },
        );

        return throwError(() => error);
      }),
    );
  }
}
