/**
 * Tests for src/lib/axiosInstance.js — request and response interceptors.
 *
 * The axios mock is defined entirely inside the factory (no outer variables)
 * to avoid TDZ issues caused by jest.mock hoisting. Captured interceptors
 * are exposed via global so tests can access them after module load.
 */

// ─── Mock ─────────────────────────────────────────────────────────────────────

jest.mock('axios', () => {
  const instance = {
    interceptors: {
      request: {
        use: (fn) => { global.__reqInterceptor = fn; },
      },
      response: {
        use: (onFulfilled, onRejected) => {
          global.__resSuccess = onFulfilled;
          global.__resError = onRejected;
        },
      },
    },
  };
  return {
    __esModule: true,
    default: { create: () => instance },
    create: () => instance,
  };
});

jest.mock('@/lib/config', () => ({
  __esModule: true,
  default: { API_BASE_URL: 'https://api.dev.dcarbon.solutions' },
}));

// ─── Import triggers interceptor registration ─────────────────────────────────

import '../../src/lib/axiosInstance';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const reqInterceptor = () => global.__reqInterceptor;
const resSuccess = () => global.__resSuccess;
const resError = () => global.__resError;

const withWindow = (pathname = '/dashboard') => {
  global.window = { location: { pathname, href: '' } };
};

const withLocalStorage = (token = null) => {
  global.localStorage = {
    getItem: jest.fn().mockReturnValue(token),
    removeItem: jest.fn(),
  };
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('axiosInstance — request interceptor', () => {
  afterEach(() => {
    delete global.window;
    delete global.localStorage;
  });

  it('registers a request interceptor', () => {
    expect(typeof reqInterceptor()).toBe('function');
  });

  it('attaches Bearer token from localStorage when window and token exist', () => {
    withWindow();
    withLocalStorage('my-auth-token');

    const config = { headers: {} };
    reqInterceptor()(config);

    expect(config.headers.Authorization).toBe('Bearer my-auth-token');
  });

  it('does not attach Authorization when token is null', () => {
    withWindow();
    withLocalStorage(null);

    const config = { headers: {} };
    reqInterceptor()(config);

    expect(config.headers.Authorization).toBeUndefined();
  });

  it('does not attach Authorization when window is undefined (SSR)', () => {
    // window is NOT set
    const config = { headers: {} };
    reqInterceptor()(config);
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('returns the config object', () => {
    withWindow();
    withLocalStorage('tok');
    const config = { headers: {} };
    const result = reqInterceptor()(config);
    expect(result).toBe(config);
  });
});

describe('axiosInstance — response interceptor', () => {
  afterEach(() => {
    delete global.window;
    delete global.localStorage;
  });

  it('registers a response interceptor', () => {
    expect(typeof resSuccess()).toBe('function');
    expect(typeof resError()).toBe('function');
  });

  it('passes through successful responses', () => {
    const response = { status: 200, data: { ok: true } };
    const result = resSuccess()(response);
    expect(result).toBe(response);
  });

  it('rejects non-401 errors without touching localStorage', async () => {
    withWindow();
    withLocalStorage('some-token');
    const removeSpy = global.localStorage.removeItem;

    const error = { response: { status: 500 } };
    await expect(resError()(error)).rejects.toEqual(error);
    expect(removeSpy).not.toHaveBeenCalled();
  });

  it('rejects network errors (no response object)', async () => {
    const error = { message: 'Network Error' };
    await expect(resError()(error)).rejects.toEqual(error);
  });

  it('clears authToken from localStorage on 401', async () => {
    withWindow('/dashboard');
    withLocalStorage('my-token');
    const removeSpy = global.localStorage.removeItem;

    const error = { response: { status: 401 } };
    try { await resError()(error); } catch { /* expected */ }

    expect(removeSpy).toHaveBeenCalledWith('authToken');
  });

  it('clears userId from localStorage on 401', async () => {
    withWindow('/dashboard');
    withLocalStorage('tok');
    const removeSpy = global.localStorage.removeItem;

    const error = { response: { status: 401 } };
    try { await resError()(error); } catch { /* expected */ }

    expect(removeSpy).toHaveBeenCalledWith('userId');
  });

  it('redirects to /login?reason=session_expired on 401', async () => {
    const locationMock = { pathname: '/dashboard', href: '' };
    global.window = { location: locationMock };
    withLocalStorage('tok');

    const error = { response: { status: 401 } };
    try { await resError()(error); } catch { /* expected */ }

    expect(locationMock.href).toBe('/login?reason=session_expired');
  });

  it('does NOT redirect when already on /login page', async () => {
    const locationMock = { pathname: '/login', href: '' };
    global.window = { location: locationMock };
    withLocalStorage('tok');

    const error = { response: { status: 401 } };
    try { await resError()(error); } catch { /* expected */ }

    expect(locationMock.href).toBe('');
  });

  it('always rejects the error even after handling 401', async () => {
    withWindow('/dashboard');
    withLocalStorage('tok');

    const error = { response: { status: 401 } };
    await expect(resError()(error)).rejects.toEqual(error);
  });
});
