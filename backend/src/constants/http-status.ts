/**
 * NeighborLend me use hone wale HTTP status codes.
 * Magic numbers (400, 401, 500...) repeat karne ke bajaye
 * controllers me in constants ko use karo.
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
} as const;

export const ERROR_MESSAGES = {
  BAD_REQUEST: "Request data is missing or invalid",
  UNAUTHORIZED: "Please login first",
  FORBIDDEN: "You do not have permission for this action",
  NOT_FOUND: "Requested resource was not found",
  CONFLICT: "This data already exists or conflicts with another record",
  INTERNAL_SERVER_ERROR: "Something went wrong on the server",
} as const;
