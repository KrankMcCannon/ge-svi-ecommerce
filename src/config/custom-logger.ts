import { Logger } from '@nestjs/common';

const REGEX_METHOD = /at (n?e?w? ?[^ ]+)/;

export class CustomLogger {
  private static readonly _logger: Logger = new Logger();
  private static _logLevel = 'info'; // default log level

  static setLogLevel(level: string): void {
    this._logLevel = level;
  }

  private static formatMessage(message: string, params: any[]): string {
    return params.reduce((msg, param, index) => {
      return msg.replace(`{${index}}`, param);
    }, message);
  }

  private static getUpCallerName() {
    // take the third method in the stack which will be the one that invoked the method that invoked me
    const callingStack = new Error().stack.split('\n')[3];
    // extract the method info using regex
    return REGEX_METHOD.exec(callingStack)[1];
  }

  static error(message: string, error?: any, ...params: any[]): void {
    const formattedMessage = this.formatMessage(message, params);
    if (error) {
      this._logger.error(
        formattedMessage,
        error.stack || error,
        this.getUpCallerName(),
      );
    } else {
      this._logger.error(formattedMessage, this.getUpCallerName());
    }
  }

  static warn(message: string, ...params: any[]): void {
    const formattedMessage = this.formatMessage(message, params);
    this._logger.warn(formattedMessage, this.getUpCallerName());
  }

  static info(message: string, ...params: any[]): void {
    const formattedMessage = this.formatMessage(message, params);
    this._logger.log(formattedMessage, this.getUpCallerName());
  }

  static debug(message: string, ...params: any[]): void {
    const formattedMessage = this.formatMessage(message, params);
    this._logger.debug(formattedMessage, this.getUpCallerName());
  }

  static verbose(message: string, ...params: any[]): void {
    const formattedMessage = this.formatMessage(message, params);
    this._logger.verbose(formattedMessage, this.getUpCallerName());
  }
}
