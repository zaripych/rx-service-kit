import WebSocket from 'ws';
import { Observable, empty, of } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import * as Joi from '@hapi/joi';
import { isString, tryParse } from './helpers';
import { Logger, defaultLogger } from '../logging';

const defaultSchema = Joi.object({
  type: Joi.string().required(),
}).unknown(true);

function defaultActionSchemaByType(_type: string): Joi.ObjectSchema | null {
  return defaultSchema;
}

export const actionStreamFromSocket = <
  T extends { type: string; payload: unknown }
>(
  data: Observable<WebSocket.Data>,
  actionSchemaByType = defaultActionSchemaByType,
  logger: Logger = defaultLogger
) => {
  return data.pipe(
    filter(isString),
    mergeMap(nonParsed => {
      const value = tryParse<T>(nonParsed, logger);
      if (value === null) {
        return empty();
      }

      if (typeof value !== 'object' || !('type' in value)) {
        logger.error('💥  No type property in incoming message');
        return empty();
      }

      const schema = actionSchemaByType(value.type);
      if (!schema) {
        logger.error('💥  No schema found for type', value.type);
        return empty();
      }

      const result = Joi.validate(value, schema);
      if (result.error as Error | null) {
        logger.error('💥  Invalid message of type', value.type, result.error);
        return empty();
      }

      return of(result.value);
    })
  );
};
