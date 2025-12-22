// 全局类型定义，用于 fetch API 相关类型
interface Body {
  readonly body: ReadableStream<Uint8Array> | null;
  readonly bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  json(): Promise<any>;
  text(): Promise<string>;
}

declare global {
  var fetch: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
  interface RequestInit {
    method?: string;
    headers?: HeadersInit;
    body?: BodyInit | null;
    mode?: RequestMode;
    credentials?: RequestCredentials;
    cache?: RequestCache;
    redirect?: RequestRedirect;
    referrer?: string;
    referrerPolicy?: ReferrerPolicy;
    integrity?: string;
    keepalive?: boolean;
    signal?: AbortSignal | null;
  }
  interface Response extends Body {
    readonly headers: Headers;
    readonly ok: boolean;
    readonly redirected: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly type: ResponseType;
    readonly url: string;
    clone(): Response;
  }
  var AbortController: {
    prototype: AbortController;
    new(): AbortController;
  };
  interface AbortController {
    readonly signal: AbortSignal;
    abort(reason?: any): void;
  }
  var setTimeout: (callback: (...args: any[]) => void, ms?: number, ...args: any[]) => NodeJS.Timeout;
  var clearTimeout: (timeoutId: NodeJS.Timeout) => void;
}

export {};