import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ClientLogsService } from './client-logs.service';

@ApiTags('Client Logs')
@Controller('client-logs')
export class ClientLogsController {
  constructor(private readonly logs: ClientLogsService) {}

  @Post()
  @ApiBody({
    schema: {
      example: {
        message: 'TypeError: undefined is not a function',
        stack: 'stack...',
        url: 'https://qlutchgrid.com/user-dashboard',
        userAgent: 'Mozilla/5.0 ...',
        timestamp: '2026-02-13T12:00:00.000Z',
        extra: { source: 'window.onerror' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Log captured' })
  log(@Body() payload: any) {
    this.logs.capture(payload);
    return { success: true };
  }
}
