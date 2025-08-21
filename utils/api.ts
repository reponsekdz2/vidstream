const cache = new Map<string, any>();

export const fetchWithCache = async (url: string, options?: RequestInit) => {
  const cacheKey = `${options?.method || 'GET'}:${url}`;

  if (options?.method && options.method !== 'GET') {
      // Don't cache non-GET requests, just fetch
      const response = await fetch(url, options);
      if (!response.ok) {
          throw new Error(`Network response was not ok for url: ${url}`);
      }
      return response.json();
  }

  if (cache.has(cacheKey)) {
    return Promise.resolve(cache.get(cacheKey));
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`Network response was not ok for url: ${url}`);
  }
  const data = await response.json();
  cache.set(cacheKey, data);
  return data;
};

export const clearCache = (keyPart: string) => {
    for (const key of cache.keys()) {
        if (key.includes(keyPart)) {
            cache.delete(key);
        }
    }
};