import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkFirst, CacheFirst } from "serwist";

// This declares the value of `injectionPoint` to TypeScript.
// `injectionPoint` is the string that will be replaced by the
// actual precache manifest. By default, this string is set to
// `"self.__SW_MANIFEST"`.
declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // Cache API responses with NetworkFirst strategy
    {
      matcher: ({ url }) => url.pathname.includes('/api/'),
      handler: new NetworkFirst({
        cacheName: "api-cache",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response.status === 200 ? response : null;
            },
          },
        ],
        networkTimeoutSeconds: 10,
      }),
    },
    // Cache images with CacheFirst strategy
    {
      matcher: ({ url }) => /\.(png|jpg|jpeg|svg|gif|webp|avif)$/i.test(url.pathname),
      handler: new CacheFirst({
        cacheName: "image-cache",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response.status === 200 ? response : null;
            },
          },
        ],
      }),
    },
    // Cache Google Fonts
    {
      matcher: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
      handler: new CacheFirst({
        cacheName: "google-fonts",
        plugins: [
          {
            cacheWillUpdate: async ({ response }) => {
              return response.status === 200 ? response : null;
            },
          },
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
