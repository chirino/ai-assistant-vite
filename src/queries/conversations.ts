import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { client } from "@src/axios-config/apiInit";
import {
  ChatMessage,
  createConversation,
  CreateConversationResponse,
  getConversation,
  listConversations,
  updateConversation,
} from "@src/client";
import { dataOf } from "./dataOf.ts";
import { encodeFilters, HubFilter } from "@src/queries/filters.ts";

export const ConversationsQueryKey = "conversations";

export const useCreateConversationMutation = (
  onError?: (err: AxiosError) => void,
  onSuccess?: (resp: CreateConversationResponse) => void,
) => {
  return useMutation({
    mutationKey: [ConversationsQueryKey],
    mutationFn: async () => {
      const response = await createConversation({ client });
      return response.data as CreateConversationResponse;
    },
    onSuccess,
    onError,
  });
};

export const useUpdateConversationMutation = (
  id: string,
  onError?: (
    err: AxiosError,
    req: { seq: number; messages: Array<ChatMessage> },
  ) => void,
  onSuccess?: (
    resp: CreateConversationResponse,
    req: { seq: number; messages: Array<ChatMessage> },
  ) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (req) => {
      const response = await updateConversation({
        client,
        path: { id: id },
        body: req.messages,
        headers: {
          "if-match": `${req.seq}`,
        },
      });
      return response.data as CreateConversationResponse;
    },
    onSuccess,
    onError,
    onSettled: async (resp, error) => {
      if (error) {
        await queryClient.invalidateQueries({
          queryKey: [ConversationsQueryKey, id],
        });
      }
      await queryClient.setQueryData([ConversationsQueryKey, id], resp);
    },
  });
};

export const useListConversationsQuery = (conversationFilter: string) => {
  return useQuery({
    queryKey: [ConversationsQueryKey],
    queryFn: () => {
      let filters = [] as HubFilter[];
      if (conversationFilter !== "") {
        filters = [
          {
            field: "state",
            operator: "~",
            value: conversationFilter,
          },
        ];
      }
      return dataOf(
        listConversations({ client, query: { q: encodeFilters(filters) } }),
      );
    },
    refetchInterval: false,
  });
};

export const useGetConversationQuery = (id: string) => {
  return useQuery({
    queryKey: [ConversationsQueryKey, id],
    queryFn: () => {
      return dataOf(getConversation({ client, path: { id } }));
    },
    refetchInterval: false,
  });
};
