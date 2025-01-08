import {useMutation, useQuery} from "@tanstack/react-query";
import {AxiosError} from "axios";
import {client} from "@app/axios-config/apiInit";
import {
  ChatState,
  Conversation,
  createConversation,
  CreateConversationResponse,
  getConversation,
  listConversations,
  updateConversation
} from "@app/client";
import {dataOf} from "./dataOf.ts";
import {encodeFilters, HubFilter} from "@app/queries/filters.ts";

export const ConversationsQueryKey = "conversations";

export const useCreateConversationMutation = (
  onError?: (err: AxiosError, req: ChatState) => void,
  onSuccess?: (resp: CreateConversationResponse, req: ChatState) => void
) => {
  return useMutation({
    mutationKey: [ConversationsQueryKey],
    mutationFn: async (req: ChatState) => {
      const response = await createConversation({client, body: req});
      return response.data as CreateConversationResponse;
    },
    onSuccess,
    onError,
  });
};

export const useUpdateConversationMutation = (
  id: string,
  onError?: (err: AxiosError, req: Conversation) => void,
  onSuccess?: (resp: CreateConversationResponse, req: Conversation) => void
) => {
  return useMutation({
    mutationKey: [ConversationsQueryKey, id],
    mutationFn: async (req: Conversation) => {
      const response = await updateConversation({client, path: {id: id}, body: req});
      return response.data as CreateConversationResponse;
    },
    onSuccess,
    onError,
  });
};

export const useListConversationsQuery = (conversationFilter: string) => {
  return useQuery({
    queryKey: [ConversationsQueryKey],
    queryFn: () => {
      let filters = [] as HubFilter[];
      if (conversationFilter !== "") {
        filters = [{
          field: "state",
          operator: "~",
          value: conversationFilter,
        }];
      }
      return dataOf(listConversations({client, query: { q: encodeFilters(filters) },}));
    },
    refetchInterval: false,
  });
};

export const useGetConversationQuery = (id: string) => {
  return useQuery({
    queryKey: [ConversationsQueryKey, id],
    queryFn: () => {
      return dataOf(getConversation({client, path: {id}}));
    },
    refetchInterval: false,
  });
};
