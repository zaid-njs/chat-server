import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { red } from 'cli-color';
import { Response } from 'express';
import { HttpErrorHandlingFn, MongoErrorHandlingFn } from './utils.helper';
@Catch()
export class AnyExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let error: { status: string; message: { error: string[] } } = null;
    let httpStatusCode: number = null;

    if (exception instanceof HttpException) {
      console.log(red('HttpException'));
      const errors = exception.getResponse();
      const rs = HttpErrorHandlingFn(errors);
      error = rs.error;
      httpStatusCode = rs.httpStatusCode;
    } else if (
      ['MongoServerError', 'ValidationError', 'CastError'].includes(
        exception?.constructor?.name,
      )
    ) {
      console.log(red('MongooseError'));
      const rs = MongoErrorHandlingFn(exception);
      error = rs.error;
      httpStatusCode = rs.httpStatusCode;
    } else {
      error = { status: 'error', message: { error: [exception.message] } };
      httpStatusCode = 500;
    }

    response
      .status(httpStatusCode)
      .json({ ...error, statusCode: httpStatusCode });
  }
}
