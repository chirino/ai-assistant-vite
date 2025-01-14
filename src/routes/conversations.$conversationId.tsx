import { createFileRoute } from "@tanstack/react-router";
import {
  ConversationsQueryKey,
  useGetConversationQuery,
  useUpdateConversationMutation,
} from "@src/queries/conversations.ts";
import Message, { MessageProps } from "@patternfly/chatbot/dist/esm/Message";
import React, { useMemo } from "react";
import userAvatar from "@src/assets/user_avatar.svg";
import patternflyAvatar from "@src/assets/patternfly_avatar.jpg";
import { ChatMessage } from "@src/client";
import ChatbotContent from "@patternfly/chatbot/dist/esm/ChatbotContent";
import MessageBox from "@patternfly/chatbot/dist/esm/MessageBox";
import ChatbotWelcomePrompt from "@patternfly/chatbot/dist/esm/ChatbotWelcomePrompt";
import ChatbotFooter, {
  ChatbotFootnote,
} from "@patternfly/chatbot/dist/esm/ChatbotFooter";
import MessageBar from "@patternfly/chatbot/dist/esm/MessageBar";
import { useAuth } from "react-oidc-context";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/conversations/$conversationId")({
  component: ConversationMessageBox,
});

function ConversationMessageBox() {
  const { conversationId } = Route.useParams();
  const conversationQuery = useGetConversationQuery(conversationId);

  const auth = useAuth();
  const [userName, userPicture] = useMemo(() => {
    return [
      auth.user?.profile.preferred_username || auth.user?.profile.sub,
      auth.user?.profile.picture,
    ];
  }, [auth]);

  const updateConversationMutation =
    useUpdateConversationMutation(conversationId);

  const queryClient = useQueryClient();
  // const messages = (conversationQuery.data?.state.messages) || [];
  const messages: MessageProps[] = useMemo(() => {
    if (conversationQuery.isLoading || conversationQuery.data == null) {
      return [];
    }
    const results = [] as MessageProps[];
    let botMessageCount = 0;

    const messages = [...conversationQuery.data.messages];

    // optimistic update:
    if (updateConversationMutation.isPending) {
      messages.push(...updateConversationMutation.variables.messages);
    }

    messages.forEach((message) => {
      if (message.message_type == "human") {
        results.push({
          content: message.content,
          role: "user",
          name: userName,
          avatar: userPicture || userAvatar,
          timestamp: message.timestamp,
        });
      } else if (message.message_type == "ai") {
        botMessageCount += 1;
        results.push({
          content: message.content,
          role: "bot",
          name: "Assistant",
          avatar: patternflyAvatar,
          timestamp: message.timestamp,
        });
      }

      // a conversation will not exist in conversations list until the first bot message is sent
      if (botMessageCount == 1) {
        queryClient.invalidateQueries({ queryKey: [ConversationsQueryKey] });
      }
    });

    return results;
  }, [
    conversationQuery.data,
    conversationQuery.isLoading,
    userName,
    userPicture,
    queryClient,
    updateConversationMutation,
  ]);

  // const [messages, setMessages] = React.useState<MessageProps[]>(initialMessages);
  const [announcement, setAnnouncement] = React.useState<string>();
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);

  // Auto-scrolls to the latest message
  React.useEffect(() => {
    // don't scroll the first load - in this demo, we know we start with two messages
    if (messages.length > 2) {
      scrollToBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = (message: string) => {
    setAnnouncement(
      `Message from User: ${message}. Message from Bot is loading.`,
    );

    const update = {
      seq: conversationQuery.data?.seq || 0,
      messages: [] as Array<ChatMessage>,
    };

    if (updateConversationMutation.isPending) {
      update.seq += 1;
      update.messages.push(...updateConversationMutation.variables.messages);
    } else {
      update.seq = conversationQuery.data?.seq || 0;
    }

    console.log("seq", update.seq);
    update.messages.push({
      message_type: "human",
      content: message,
      timestamp: new Date().toISOString(),
    });

    (async () => {
      const conversation = await updateConversationMutation.mutateAsync(update);
      const messages = conversation.messages;
      setAnnouncement(
        `Message from Bot: ${messages[messages.length - 1].content}`,
      );
    })();
  };

  const footnoteProps = {
    label: "This Assistant uses AI. Check for mistakes.",
    popover: {
      title: "Verify accuracy",
      description: `While the Assistant strives for accuracy, there's always a possibility of errors. It's a good practice to verify critical information from reliable sources, especially if it's crucial for decision-making or actions.`,
      bannerImage: {
        src: "https://cdn.dribbble.com/userupload/10651749/file/original-8a07b8e39d9e8bf002358c66fce1223e.gif",
        alt: "Example image for footnote popover",
      },
      cta: {
        label: "Got it",
        onClick: () => {
          alert("Do something!");
        },
      },
      link: {
        label: "Learn more",
        url: "https://www.redhat.com/",
      },
    },
  };

  return (
    <>
      <ChatbotContent>
        {/* Update the announcement prop on MessageBox whenever a new message is sent
                 so that users of assistive devices receive sufficient context  */}

        <MessageBox announcement={announcement}>
          <ChatbotWelcomePrompt
            title={`Hello, ${userName}`}
            description="How may I help you today?"
            // prompts={welcomePrompts}
          />

          {/* This code block enables scrolling to the top of the last message.
              You can instead choose to move the div with scrollToBottomRef on it below
              the map of messages, so that users are forced to scroll to the bottom.
              If you are using streaming, you will want to take a different approach;
              see: https://github.com/patternfly/chatbot/issues/201#issuecomment-2400725173 */}
          {messages.map((message, index) => {
            if (index === messages.length - 1) {
              return (
                <div key={index}>
                  <div ref={scrollToBottomRef}></div>
                  <Message {...message} />
                </div>
              );
            }
            return <Message key={index} {...message} />;
          })}
        </MessageBox>
      </ChatbotContent>
      <ChatbotFooter>
        <MessageBar onSendMessage={handleSend} hasMicrophoneButton />
        <ChatbotFootnote {...footnoteProps} />
      </ChatbotFooter>
    </>
  );
}
