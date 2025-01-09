import { createFileRoute } from "@tanstack/react-router";
import {
  useGetConversationQuery,
  useUpdateConversationMutation,
} from "@src/queries/conversations.ts";
import Message, { MessageProps } from "@patternfly/chatbot/dist/esm/Message";
import React, { useMemo } from "react";
import userAvatar from "@src/assets/user_avatar.svg";
import patternflyAvatar from "@src/assets/patternfly_avatar.jpg";
import { Conversation as ApiConversation } from "@src/client";
import ChatbotContent from "@patternfly/chatbot/dist/esm/ChatbotContent";
import MessageBox from "@patternfly/chatbot/dist/esm/MessageBox";
import ChatbotWelcomePrompt from "@patternfly/chatbot/dist/esm/ChatbotWelcomePrompt";
import ChatbotFooter, {
  ChatbotFootnote,
} from "@patternfly/chatbot/dist/esm/ChatbotFooter";
import MessageBar from "@patternfly/chatbot/dist/esm/MessageBar";

export const Route = createFileRoute("/conversations/$conversationId")({
  component: ConversationMessageBox,
});

function ConversationMessageBox() {
  const { conversationId } = Route.useParams();
  const conversationQuery = useGetConversationQuery(conversationId);

  // const messages = (conversationQuery.data?.state.messages) || [];
  const messages: MessageProps[] = useMemo(() => {
    if (conversationQuery.isLoading || conversationQuery.data == null) {
      return [];
    }
    const results = [] as MessageProps[];

    console.log("messages", conversationQuery.data.state.messages);

    conversationQuery.data.state.messages.forEach((message) => {
      if (message.message_type == "human") {
        results.push({
          content: message.content,
          role: "user",
          name: "user",
          avatar: userAvatar,
        });
      } else if (message.message_type == "ai") {
        results.push({
          content: message.content,
          role: "bot",
          name: "bot",
          avatar: patternflyAvatar,
        });
      }
    });

    console.log("results", results);

    return results;
  }, [conversationQuery.data, conversationQuery.isLoading]);

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

  const [, setNewMessages] = React.useState<Array<string>>([]);
  const updateConversationMutation =
    useUpdateConversationMutation(conversationId);

  const handleSend = (message: string) => {
    setAnnouncement(
      `Message from User: ${message}. Message from Bot is loading.`,
    );
    setNewMessages((prev) => {
      const newMessages = [...prev, message];

      // clone the conversationQuery.data object
      const update = JSON.parse(
        JSON.stringify(conversationQuery.data),
      ) as ApiConversation;
      // for each item in newMessages
      newMessages.forEach((message) => {
        update.seq += 1;
        update.state.messages.push({
          message_type: "human",
          content: message,
        });
      });

      (async () => {
        const conversation =
          await updateConversationMutation.mutateAsync(update);
        const messages = conversation.state.messages;
        setNewMessages([]);
        setAnnouncement(
          `Message from Bot: ${messages[messages.length - 1].content}`,
        );
      })();

      return newMessages;
    });
  };

  const footnoteProps = {
    label: "Lightspeed uses AI. Check for mistakes.",
    popover: {
      title: "Verify accuracy",
      description: `While Lightspeed strives for accuracy, there's always a possibility of errors. It's a good practice to verify critical information from reliable sources, especially if it's crucial for decision-making or actions.`,
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
            title="Hello, Chatbot User"
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
                <>
                  <div ref={scrollToBottomRef}></div>
                  <Message key={index} {...message} />
                </>
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
