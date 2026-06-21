import { api, guestHeaders } from "@/lib/api-client";
import { env } from "@/config/env";
import {
  AdminMetricsResponseSchema,
  ChatHistoryResponseSchema,
  ConversationsListResponseSchema,
  ConversationTranscriptResponseSchema,
  PostChatResponseSchema,
  type AdminMetricsResponse,
  type ChatHistoryResponse,
  type ConversationsListResponse,
  type ConversationTranscriptResponse,
  type PostChatRequest,
  type PostChatResponse,
} from "@/features/parrot/types";

function adminHeaders() {
  return env.adminPasscode
    ? { headers: { "X-Admin-Passcode": env.adminPasscode } }
    : {};
}

export function getChatHistory(guestId: string): Promise<ChatHistoryResponse> {
  return api.parrot.get(
    ChatHistoryResponseSchema,
    `/history/${guestId}`,
    guestHeaders(guestId)
  );
}

export function postChat(body: PostChatRequest): Promise<PostChatResponse> {
  return api.parrot.post(
    PostChatResponseSchema,
    "/chat",
    body,
    guestHeaders(body.guest_id)
  );
}

export function getAdminMetrics(): Promise<AdminMetricsResponse> {
  return api.parrot.get(
    AdminMetricsResponseSchema,
    "/admin/metrics",
    adminHeaders()
  );
}

export function getConversations(): Promise<ConversationsListResponse> {
  return api.parrot.get(
    ConversationsListResponseSchema,
    "/admin/conversations",
    adminHeaders()
  );
}

export function getConversationTranscript(
  guestId: string
): Promise<ConversationTranscriptResponse> {
  return api.parrot.get(
    ConversationTranscriptResponseSchema,
    `/admin/conversations/${guestId}`,
    adminHeaders()
  );
}
