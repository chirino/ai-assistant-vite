import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { client } from "@src/axios-config/apiInit";
import {
  Conversation,
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
  onError?: (err: AxiosError, req: Conversation) => void,
  onSuccess?: (resp: CreateConversationResponse, req: Conversation) => void,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: [ConversationsQueryKey, id],
    mutationFn: async (req: Conversation) => {
      const response = await updateConversation({
        client,
        path: { id: id },
        body: req,
      });
      return response.data as CreateConversationResponse;
    },

    onSuccess,

    // When mutate is called:
    onMutate: async (newConversation: Conversation) => {
      // Cancel any outgoing refetch
      // (so they don't overwrite our optimistic update)
      const queryKey = [ConversationsQueryKey, id];
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousQueryData = queryClient.getQueryData(queryKey) as
        | Conversation
        | undefined;

      // Optimistically update to the new value
      if (previousQueryData) {
        queryClient.setQueryData(queryKey, newConversation);
      }

      return { previousQueryData: previousQueryData };
    },

    // If the mutation fails,
    // use the context returned from onMutate to roll back
    onError: (err, newConversation, context) => {
      if (context?.previousQueryData) {
        queryClient.setQueryData<Conversation>(
          [ConversationsQueryKey, id],
          context?.previousQueryData,
        );
      }
      if (onError) {
        onError(err as AxiosError, newConversation);
      }
    },

    // Always refetch after error or success:
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [ConversationsQueryKey, id] });
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
