// src/docs.ts
import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";

export const swaggerApp = new Hono();

const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Test ICN Todos API",
    version: "1.0.0",
    description:
      "Auth (JWT access + refresh cookie) and Todos endpoints for the Test ICN project.",
  },
  servers: [{ url: "/", description: "Current server" }],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            oneOf: [
              { type: "string" },
              {
                type: "array",
                items: { $ref: "#/components/schemas/ValidationIssue" },
              },
            ],
          },
        },
        required: ["error"],
      },
      ValidationIssue: {
        type: "object",
        properties: {
          path: { type: "string" },
          message: { type: "string" },
          code: { type: "string" },
        },
        required: ["path", "message", "code"],
      },
      RegisterRequest: {
        type: "object",
        properties: {
          username: { type: "string", minLength: 3 },
          password: { type: "string", minLength: 6 },
        },
        required: ["username", "password"],
      },
      RegisterResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "User registered successfully" },
        },
        required: ["message"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          username: { type: "string" },
          password: { type: "string" },
        },
        required: ["username", "password"],
      },
      LoginResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          tokenType: { type: "string", example: "Bearer" },
          expiresAt: {
            type: "integer",
            example: 1694703000,
            description: "Unix seconds",
          },
        },
        required: ["accessToken", "tokenType", "expiresAt"],
      },
      RefreshResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string" },
          tokenType: { type: "string", example: "Bearer" },
          expiresAt: { type: "integer" },
        },
        required: ["accessToken", "tokenType", "expiresAt"],
      },
      LogoutResponse: {
        type: "object",
        properties: {
          message: { type: "string", example: "Logged out successfully" },
        },
        required: ["message"],
      },
      Todo: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          text: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          deletedAt: { type: "string", nullable: true, format: "date-time" },
        },
        required: ["id", "userId", "text"],
      },
      TodoListQuery: {
        type: "object",
        properties: {
          page: { type: "integer", minimum: 1, default: 1 },
          limit: { type: "integer", minimum: 1, maximum: 100, default: 10 },
          includeDeleted: { type: "boolean", default: false },
          q: { type: "string" },
        },
      },
      TodoListResponse: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          data: { type: "array", items: { $ref: "#/components/schemas/Todo" } },
        },
        required: ["page", "limit", "data"],
      },
      TodoCreateRequest: {
        type: "object",
        properties: { text: { type: "string" } },
        required: ["text"],
      },
      TodoUpdateRequest: {
        type: "object",
        properties: {
          text: { type: "string" },
          deletedAt: { type: "string", nullable: true, format: "date-time" },
        },
      },
    },
  },
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterResponse" },
              },
            },
          },
          "409": {
            description: "Duplicate username",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Internal error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and obtain access token; sets refresh cookie",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            headers: {
              "Set-Cookie": {
                schema: { type: "string" },
                description: "HttpOnly refreshToken cookie",
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "401": {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Internal error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary:
          "Exchange refresh cookie for new access token (rotates refresh token)",
        responses: {
          "200": {
            description: "New access token",
            headers: {
              "Set-Cookie": {
                schema: { type: "string" },
                description: "New HttpOnly refreshToken cookie",
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RefreshResponse" },
              },
            },
          },
          "401": {
            description: "Missing/invalid refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Internal error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke refresh token and clear cookie",
        responses: {
          "200": {
            description: "Logged out",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LogoutResponse" },
              },
            },
          },
          "400": {
            description: "Missing refresh token",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "500": {
            description: "Internal error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/todos": {
      get: {
        tags: ["Todos"],
        summary: "List todos",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "query",
            name: "page",
            schema: { type: "integer", default: 1 },
          },
          {
            in: "query",
            name: "limit",
            schema: { type: "integer", default: 10 },
          },
          {
            in: "query",
            name: "includeDeleted",
            schema: { type: "boolean", default: false },
          },
          { in: "query", name: "q", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TodoListResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Todos"],
        summary: "Create todo",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TodoCreateRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Todo" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "400": {
            description: "Validation error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },

    "/todos/{id}": {
      put: {
        tags: ["Todos"],
        summary: "Update todo",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/TodoUpdateRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Todo" },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Todos"],
        summary: "Delete todo",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { success: { type: "boolean" } },
                  required: ["success"],
                },
              },
            },
          },
          "404": {
            description: "Not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
};

swaggerApp.get("/doc", (c) => c.json(openApiSpec));
swaggerApp.get("/", swaggerUI({ url: "/swagger/doc" }));
