import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useCreateConversationMutation } from "@src/queries/conversations.ts";
import { useEffect } from "react";
import { AppPlaceholder } from "@src/components/AppPlaceholder.tsx";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate({ from: "/" });

  // start a conversation, and redirect to it's route
  const createConversationMutation = useCreateConversationMutation();
  useEffect(() => {
    (async () => {
      const conversation = await createConversationMutation.mutateAsync();
      await navigate({
        to: `/conversations/${conversation.id}`,
      });
    })();
  });

  return <AppPlaceholder />;
}
