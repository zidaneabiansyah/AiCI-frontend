/**
 * Batch Request Helper for Frontend
 * 
 * Allows fetching multiple resources in a single API call
 * Reduces waterfall requests and improves page load performance
 * 
 * Usage:
 * const results = await batchFetch([
 *   { method: 'GET', url: '/api/v1/programs' },
 *   { method: 'GET', url: '/api/v1/articles' },
 *   { method: 'GET', url: '/api/v1/facilities' }
 * ]);
 */

export interface BatchRequest {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    body?: Record<string, any>;
}

export interface BatchResponse<T = any> {
    index: number;
    status: number;
    data?: T;
    error?: string;
}

/**
 * Send batch request to API
 * @param requests Array of requests to batch
 * @returns Array of responses in same order as requests
 */
export async function batchFetch<T = any>(
    requests: BatchRequest[]
): Promise<BatchResponse<T>[]> {
    if (requests.length === 0) {
        throw new Error('Batch requests array cannot be empty');
    }

    if (requests.length > 10) {
        throw new Error('Maximum 10 requests per batch allowed');
    }

    try {
        const response = await fetch('/api/v1/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ requests }),
        });

        if (!response.ok) {
            throw new Error(`Batch request failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Batch fetch error:', error);
        throw error;
    }
}

/**
 * Fetch multiple resources in parallel using batch API
 * More efficient than making individual requests
 * 
 * @param endpoints Array of API endpoints to fetch
 * @returns Object with endpoint keys and response data values
 * 
 * Example:
 * const { programs, articles, facilities } = await batchFetchParallel(
 *   '/api/v1/programs',
 *   '/api/v1/articles',
 *   '/api/v1/facilities'
 * );
 */
export async function batchFetchParallel(
    ...endpoints: string[]
): Promise<Record<string, any>> {
    const requests = endpoints.map((url) => ({
        method: 'GET' as const,
        url,
    }));

    const results = await batchFetch(requests);

    const data: Record<string, any> = {};
    results.forEach((result, index) => {
        const endpoint = endpoints[index];
        const key = endpoint.split('/').pop() || `endpoint_${index}`;

        if (result.status === 200 && result.data) {
            data[key] = result.data;
        } else {
            console.error(`Batch request failed for ${endpoint}:`, result.error || `Status ${result.status}`);
        }
    });

    return data;
}
