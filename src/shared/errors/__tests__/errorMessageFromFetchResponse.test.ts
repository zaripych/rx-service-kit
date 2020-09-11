import { errorMessageFromFetchResponse } from '../errorMessageFromFetchResponse';

type Response = Parameters<typeof errorMessageFromFetchResponse>[0];

describe('errorMessageFromFetchResponse', () => {
  describe('given success', () => {
    const headers = new Map<string, string>();
    const response: Response = {
      ok: true,
      headers,
      json: jest.fn(() => Promise.resolve({})),
      status: 200,
      statusText: 'Ok',
    };

    it('should work', async () => {
      expect(
        await errorMessageFromFetchResponse(response)
      ).toMatchInlineSnapshot(`"Ok"`);
    });
  });

  describe('given 404 failure, not content', () => {
    const headers = new Map<string, string>();
    const response: Response = {
      ok: false,
      headers,
      json: jest.fn(() => Promise.resolve({})),
      status: 404,
      statusText: 'Not Found',
    };

    it('should work', async () => {
      expect(
        await errorMessageFromFetchResponse(response)
      ).toMatchInlineSnapshot(`"HTTP 404: Not Found"`);
    });
  });

  describe('given 404 failure, with content, with error message', () => {
    const headers = new Map<string, string>();
    headers.set('content-type', 'application/json');
    const response: Response = {
      ok: false,
      headers,
      json: jest.fn(() =>
        Promise.resolve({
          message: 'The object with id 1 cannot be found',
        })
      ),
      status: 404,
      statusText: 'Not Found',
    };

    it('should work', async () => {
      expect(
        await errorMessageFromFetchResponse(response)
      ).toMatchInlineSnapshot(
        `"HTTP 404: Not Found, The object with id 1 cannot be found"`
      );
    });
  });

  describe('given bad messages', () => {
    const headers = new Map<string, string>();
    headers.set('content-type', 'application/json');
    const response: Response = {
      ok: false,
      headers,
      json: jest.fn(() => Promise.resolve(1)),
      // @ts-expect-error
      status: undefined,
      // @ts-expect-error
      statusText: undefined,
    };

    it('should work', async () => {
      expect(
        await errorMessageFromFetchResponse(response)
      ).toMatchInlineSnapshot(`"Request failed"`);
    });
  });

  describe('given 404 failure, with bad content', () => {
    const headers = new Map<string, string>();
    headers.set('content-type', 'application/json');
    const response: Response = {
      ok: false,
      headers,
      json: jest.fn(() => Promise.resolve('23')),
      status: 404,
      // @ts-expect-error
      statusText: undefined,
    };

    it('should work', async () => {
      expect(
        await errorMessageFromFetchResponse(response)
      ).toMatchInlineSnapshot(`"HTTP 404"`);
    });
  });

  describe('given 404 failure, with throwing json function', () => {
    const headers = new Map<string, string>();
    headers.set('content-type', 'application/json');
    const response: Response = {
      ok: false,
      headers,
      json: jest.fn(() => Promise.reject(new Error())),
      status: 404,
      statusText: 'Not found',
    };

    it('should work', async () => {
      expect(
        await errorMessageFromFetchResponse(response)
      ).toMatchInlineSnapshot(`"HTTP 404: Not found"`);
    });
  });

  describe('given 404 failure, with null json', () => {
    const headers = new Map<string, string>();
    headers.set('content-type', 'application/json');
    const response: Response = {
      ok: false,
      headers,
      json: jest.fn(() => Promise.resolve(null)),
      status: 404,
      statusText: 'Not found',
    };

    it('should work', async () => {
      expect(
        await errorMessageFromFetchResponse(response)
      ).toMatchInlineSnapshot(`"HTTP 404: Not found"`);
    });
  });
});
