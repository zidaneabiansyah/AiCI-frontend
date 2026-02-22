/**
 * Request Deduplication & Cache Management
 * 
 * Prevents duplicate requests for the same endpoint
 * Improves performance by reusing in-flight requests
 */

interface PendingRequest {
    promise: Promise<any>;
    timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();
const DEDUP_TIMEOUT = 1000; // 1 second window for deduplication

/**
 * Create a cache key for deduplication
 */
function getCacheKey(endpoint: string, options?: RequestInit): string {
    const method = (options?.method || 'GET').toUpperCase();
    const body = options?.body ? (typeof options.body === 'string' ? options.body : '') : '';
    return `${method}:${endpoint}:${body}`;
}

/**
 * Get deduplicated request or create new one
 */
function getDedupedRequest(
    cacheKey: string,
    fetcher: () => Promise<any>
): Promise<any> {
    const existing = pendingRequests.get(cacheKey);
    
    // Return existing request if still fresh
    if (existing && Date.now() - existing.timestamp < DEDUP_TIMEOUT) {
        return existing.promise;
    }
    
    // Create new request
    const promise = fetcher().finally(() => {
        // Clean up after timeout
        setTimeout(() => {
            pendingRequests.delete(cacheKey);
        }, DEDUP_TIMEOUT);
    });
    
    pendingRequests.set(cacheKey, {
        promise,
        timestamp: Date.now(),
    });
    
    return promise;
}

/**
 * Add cache headers to response
 */
function addCacheHeaders(response: Response, endpoint: string): void {
    // Public endpoints can be cached longer
    const isPublic = endpoint.includes('/content/') || 
                    endpoint.includes('/programs') ||
                    endpoint.includes('/facilities') ||
                    endpoint.includes('/galleries') ||
                    endpoint.includes('/articles');
    
    if (isPublic) {
        response.headers.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    } else {
        response.headers.set('Cache-Control', 'private, max-age=60'); // 1 minute
    }
}

export { getDedupedRequest, getCacheKey, addCacheHeaders };
