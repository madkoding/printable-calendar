import type { IncomingMessage, ServerResponse } from 'node:http'

export interface VercelRequest extends IncomingMessage {
  query: Record<string, string | string[] | undefined>
}

export interface VercelResponse extends ServerResponse {
  status(statusCode: number): VercelResponse
  json(body: unknown): VercelResponse
  send(body: string): VercelResponse
}
