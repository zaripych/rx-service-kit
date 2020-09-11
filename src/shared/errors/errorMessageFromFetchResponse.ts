import { catchAsync } from './catchAsync';

const OK = 'Ok';
const CONTENT_TYPE = 'content-type';
const APPLICATION_JSON = 'application/json';

interface IResponse {
  ok: boolean;
  status: number;
  statusText: string;
  headers: {
    get(value: string): string | undefined | null;
  };
  json(): Promise<unknown>;
}

function simpleMessageResponse(response: IResponse) {
  return response.status === 0 || typeof response.status !== 'number'
    ? 'Request failed'
    : [
        `HTTP ${response.status}`,
        typeof response.statusText === 'string' && response.statusText,
      ]
        .filter(Boolean)
        .join(': ');
}

function errorMessageFromJson(errorInfo?: { [key: string]: unknown } | null) {
  return typeof errorInfo === 'object' &&
    errorInfo &&
    'message' in errorInfo &&
    typeof errorInfo.message === 'string' &&
    errorInfo.message
    ? errorInfo.message
    : '';
}

export async function errorMessageFromFetchResponse(response: IResponse) {
  if (response.ok) {
    return OK;
  }

  const message = simpleMessageResponse(response);

  const contentType = response.headers.get(CONTENT_TYPE);

  if (contentType && contentType.includes(APPLICATION_JSON)) {
    const jsonCall = await catchAsync(
      async () =>
        (await response.json()) as {
          [key: string]: unknown;
        }
    );

    const errMessage = errorMessageFromJson(jsonCall.result);

    return [message, errMessage].filter(Boolean).join(', ');
  }

  return message;
}
