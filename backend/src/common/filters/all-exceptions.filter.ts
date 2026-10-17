import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import type { Request, Response } from 'express';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;

        let error = 'Internal Server Error';
        let message = "Đã có lỗi xảy ra, vui lòng thử lại!";
        let details: string[] | undefined;

        if (exception instanceof HttpException) {
            statusCode = exception.getStatus();
            const body = exception.getResponse();

            if (typeof body === 'string') message = body;
            else {
                const b = body as { message?: string | string[]; error?: string };
                error = b.error ?? exception.name;
                if (Array.isArray(b.message)) {
                    message = 'Dữ liệu không hợp lệ';
                    details = b.message;
                } else if (b.message) {
                    message = b.message;
                }
            }
        } else {
            this.logger.error(exception);
        }

        res.status(statusCode).json({
            statusCode,
            error,
            message,
            details,
            path: req.url,
            timestamp: new Date().toISOString()
        })
    }
}