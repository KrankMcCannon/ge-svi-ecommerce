import { Logger } from '@nestjs/common';

export class CustomLogger {
  private static readonly _logger = new Logger();

  static error(
    message: string,
    error?: any,
    context?: string,
    ...params: any[]
  ): void {
    const formattedMessage = CustomLogger.formatMessage(message, params);
    if (error) {
      this._logger.error(
        formattedMessage,
        error.stack || error.toString(),
        context,
      );
    } else {
      this._logger.error(formattedMessage, context);
    }
  }

  static warn(message: string, context?: string, ...params: any[]): void {
    const formattedMessage = CustomLogger.formatMessage(message, params);
    this._logger.warn(formattedMessage, context);
  }

  static log(message: string, context?: string, ...params: any[]): void {
    const formattedMessage = CustomLogger.formatMessage(message, params);
    this._logger.log(formattedMessage, context);
  }

  static debug(message: string, context?: string, ...params: any[]): void {
    const formattedMessage = CustomLogger.formatMessage(message, params);
    this._logger.debug(formattedMessage, context);
  }

  static verbose(message: string, context?: string, ...params: any[]): void {
    const formattedMessage = CustomLogger.formatMessage(message, params);
    this._logger.verbose(formattedMessage, context);
  }

  private static formatMessage(message: string, params: any[]): string {
    return params.reduce((msg, param, index) => {
      return msg.replace(new RegExp(`\\{${index}\\}`, 'g'), param);
    }, message);
  }
}
