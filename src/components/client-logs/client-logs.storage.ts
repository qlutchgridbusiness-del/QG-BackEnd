import { appendFileSync, mkdirSync } from 'fs';
import { join } from 'path';

export function appendClientLog(payload: any) {
  try {
    const logsDir = join(process.cwd(), 'logs');
    mkdirSync(logsDir, { recursive: true });
    const filePath = join(logsDir, 'client-errors.log');
    const line = JSON.stringify({
      ...payload,
      timestamp: payload?.timestamp || new Date().toISOString(),
    });
    appendFileSync(filePath, `${line}\n`, 'utf8');
  } catch {
    // swallow file write errors
  }
}
