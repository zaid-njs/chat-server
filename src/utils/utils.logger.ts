import { Injectable, NestMiddleware } from '@nestjs/common';
import * as color from 'cli-color';
import { NextFunction, Request, Response } from 'express';
const log = console.log;

import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService, // private readonly EmailService: EmailService,
  ) {}

  use(request: Request, response: Response, next: NextFunction): void {
    // calculate diff
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      if (this.configService.get('NODE_ENV') === 'dev')
        log(
          `${color.green(method)} ${color.yellow(
            originalUrl,
          )} ${statusCode} ${color.yellow(contentLength)} - ${color.bgCyan(
            userAgent.split(' ')[0],
          )} ${ip}`,
        );
    });

    next();
  }
}
