/** Standard Conduit API error response format */
export interface ErrorResponse {
    errors: Record<string, string[]>;
}
