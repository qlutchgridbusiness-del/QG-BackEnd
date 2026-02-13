import { Injectable, Logger } from '@nestjs/common';
import { appendClientLog } from './client-logs.storage';

@Injectable()
export class ClientLogsService {
  private readonly logger = new Logger('ClientLogs');

  capture(payload: any) {
    const message = payload?.message || 'Unknown client error';
    const meta = {
      url: payload?.url,
      userAgent: payload?.userAgent,
      timestamp: payload?.timestamp,
      extra: payload?.extra,
    };
    appendClientLog({
      message,
      stack: payload?.stack,
      ...meta,
    });

    if (payload?.stack) {
      this.logger.error(message, payload.stack, meta as any);
      return;
    }

    this.logger.error(message, JSON.stringify(meta));
  }
}
