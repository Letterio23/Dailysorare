import { SorareGraphQLResponse } from '../types';
import { logger } from './logger';
import { SORARE_API_KEY } from '../constants';

// The new target for our API calls is the local proxy endpoint.
const PROXY_API_URL = '/api/graphql';

export async function fetchGraphQL<T, V>(
    query: string,
    variables?: V
): Promise<SorareGraphQLResponse<T>> {

    const queryName = query.match(/query (\w+)/)?.[1] || 'GraphQL Query';
    logger.log(`Executing ${queryName}`, { variables });

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'APIKEY': SORARE_API_KEY,
            'X-Sorare-ApiVersion': 'v1'
        },
        body: JSON.stringify({
            query: query,
            variables: variables || {},
        }),
    };

    try {
        logger.log(`[${queryName}] Initiating network request to proxy...`);
        const response = await fetch(PROXY_API_URL, options);
        logger.log(`[${queryName}] Received response from proxy with status: ${response.status}`);
        
        const responseText = await response.text();
        
        if (!response.ok) {
            logger.error(`HTTP Error ${response.status} for ${queryName}`, {
                status: response.status,
                statusText: response.statusText,
                response: responseText,
                requestHeaders: options.headers
            });
            return { errors: [{ message: `HTTP Error ${response.status}: The proxy or Sorare API rejected the request.` }] };
        }
        
        try {
            const json: SorareGraphQLResponse<T> = JSON.parse(responseText);
            if (json.errors) {
                logger.warn(`GraphQL API returned errors for ${queryName}`, json.errors);
            } else {
                logger.log(`[${queryName}] Request successful.`);
            }
            return json;
        } catch (e) {
            logger.error(`Failed to parse JSON response from ${queryName}`, { responseText });
            return { errors: [{ message: 'Failed to parse JSON response from Sorare API via proxy.' }] };
        }

    } catch (e) {
        const error = e as Error;
        logger.error(`Network request failed for ${queryName} (e.g., CORS, network issue)`, {
            message: error.message,
            stack: error.stack,
            requestHeaders: options.headers
        });
        return { errors: [{ message: `Network error: ${error.message}. Ensure the proxy is configured correctly.` }] };
    }
}