// this is a modified version of the packages/module/patternfly-docs/content/extensions/chatbot/examples/demos/EmbeddedChatbot.tsx
// component from the PatternFly Chatbot demo
import patternflyAvatar from '@app/assets/patternfly_avatar.jpg';

import PFHorizontalLogoColor from '@app/assets/PF-HorizontalLogo-Color.svg';
import PFHorizontalLogoReverse from '@app/assets/PF-HorizontalLogo-Reverse.svg';
import userAvatar from '@app/assets/user_avatar.svg';

import Chatbot, {ChatbotDisplayMode} from '@patternfly/chatbot/dist/dynamic/Chatbot';
import ChatbotContent from '@patternfly/chatbot/dist/dynamic/ChatbotContent';
import ChatbotConversationHistoryNav, {
  Conversation,
} from '@patternfly/chatbot/dist/dynamic/ChatbotConversationHistoryNav';
import ChatbotFooter, {ChatbotFootnote} from '@patternfly/chatbot/dist/dynamic/ChatbotFooter';
import ChatbotHeader, {
  ChatbotHeaderMain,
  ChatbotHeaderMenu,
  ChatbotHeaderTitle,
} from '@patternfly/chatbot/dist/dynamic/ChatbotHeader';
import ChatbotWelcomePrompt from '@patternfly/chatbot/dist/dynamic/ChatbotWelcomePrompt';
import Message, {MessageProps} from '@patternfly/chatbot/dist/dynamic/Message';
import MessageBar from '@patternfly/chatbot/dist/dynamic/MessageBar';
import MessageBox from '@patternfly/chatbot/dist/dynamic/MessageBox';

import {Brand, Bullseye} from '@patternfly/react-core';
import React, {Dispatch, SetStateAction, useMemo} from 'react';
import {
  useCreateConversationMutation,
  useGetConversationQuery,
  useListConversationsQuery,
  useUpdateConversationMutation
} from "@app/queries/conversations.ts";

import {Conversation as ApiConversation,} from "@app/client";

const footnoteProps = {
  label: 'Lightspeed uses AI. Check for mistakes.',
  popover: {
    title: 'Verify accuracy',
    description: `While Lightspeed strives for accuracy, there's always a possibility of errors. It's a good practice to verify critical information from reliable sources, especially if it's crucial for decision-making or actions.`,
    bannerImage: {
      src: 'https://cdn.dribbble.com/userupload/10651749/file/original-8a07b8e39d9e8bf002358c66fce1223e.gif',
      alt: 'Example image for footnote popover',
    },
    cta: {
      label: 'Got it',
      onClick: () => {
        alert('Do something!');
      },
    },
    link: {
      label: 'Learn more',
      url: 'https://www.redhat.com/',
    },
  },
};

const markdown = `A paragraph with *emphasis* and **strong importance**.

> A block quote with ~strikethrough~ and a URL: https://reactjs.org.

Here is an inline code - \`() => void\`

Here is some YAML code:

~~~yaml
apiVersion: helm.openshift.io/v1beta1/
kind: HelmChartRepository
metadata:
  name: azure-sample-repo0oooo00ooo
spec:
  connectionConfig:
  url: https://raw.githubusercontent.com/Azure-Samples/helm-charts/master/docs
~~~

Here is some JavaScript code:

~~~js
import React from 'react';

const MessageLoading = () => (
  <div className="pf-chatbot__message-loading">
    <span className="pf-chatbot__message-loading-dots">
      <span className="pf-v6-screen-reader">Loading message</span>
    </span>
  </div>
);

export default MessageLoading;

~~~
`;

// It's important to set a date and timestamp prop since the Message components re-render.
// The timestamps re-render with them.
const date = new Date();

const initialMessages: MessageProps[] = [
  {
    id: '1',
    role: 'user',
    content: 'Hello, can you give me an example of what you can do?',
    name: 'User',
    avatar: userAvatar,
    timestamp: date.toLocaleString(),
    avatarProps: {isBordered: true},
  },
  {
    id: '2',
    role: 'bot',
    content: markdown,
    name: 'Bot',
    avatar: patternflyAvatar,
    timestamp: date.toLocaleString(),
    actions: {
      // eslint-disable-next-line no-console
      positive: {onClick: () => console.log('Good response')},
      // eslint-disable-next-line no-console
      negative: {onClick: () => console.log('Bad response')},
      // eslint-disable-next-line no-console
      copy: {onClick: () => console.log('Copy')},
      // eslint-disable-next-line no-console
      share: {onClick: () => console.log('Share')},
      // eslint-disable-next-line no-console
      listen: {onClick: () => console.log('Listen')},
    },
  },
];

const welcomePrompts = [
  {
    title: 'Get CVE information',
    message: 'Am I vulnerable to CVE-2021-12345?',
  },
  {
    title: 'Is a product affected by any CVEs?',
    message: 'Is Red Hat Enterprise Linux 7 affected by any CVEs?',
  },
];

export const Assistant: React.FunctionComponent = () => {

  const [conversationId, setConversationId] = React.useState("");
  const [conversationFilter, setConversationFilter] = React.useState("");
  const listConversationsQuery = useListConversationsQuery(conversationFilter);

  const conversations = useMemo(
    () => {
      if (listConversationsQuery.isLoading || listConversationsQuery.data == null) {
        return [];
      }

      // TODO: do we need to handle the empty case?
      // if (Object.keys(filteredConversations).length === 0) {
      //   filteredConversations = [{id: '13', noIcon: true, text: 'No results found'}];
      // }

      const results = {} as { [key: string]: Conversation[] };
      listConversationsQuery.data.items.forEach((conversation) => {

        const updated_at = new Date(conversation.updated_at)
        const key = updated_at.toLocaleString('default', {month: 'long'});
        if (results[key] == null) {
          results[key] = [];
        }
        results[key].push({
          id: conversation.id,
          text: conversation.summary,
        });
      })

      return results
    }, [listConversationsQuery.data, listConversationsQuery.isLoading]
  );


  // We don't support choosing a model yet, disable for now:
  // const [selectedModel, setSelectedModel] = React.useState('Granite 7B');

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const historyRef = React.useRef<HTMLButtonElement>(null);

  const displayMode = ChatbotDisplayMode.fullscreen;

  // const onSelectModel = (
  //   _event: React.MouseEvent<Element, MouseEvent> | undefined,
  //   value: string | number | undefined,
  // ) => {
  //   setSelectedModel(value as string);
  // };

  const horizontalLogo = (
    <Bullseye>
      <Brand className="show-light" src={PFHorizontalLogoColor} alt="PatternFly"/>
      <Brand className="show-dark" src={PFHorizontalLogoReverse} alt="PatternFly"/>
    </Bullseye>
  );

  return (
    <Chatbot displayMode={displayMode}>
      <ChatbotConversationHistoryNav
        displayMode={displayMode}
        onDrawerToggle={() => {
          setIsDrawerOpen(!isDrawerOpen);
          listConversationsQuery.refetch();
        }}
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        activeItemId="1"
        // eslint-disable-next-line no-console
        onSelectActiveItem={(_e, selectedItem) => console.log(`Selected history item with id ${selectedItem}`)}
        conversations={conversations}
        onNewChat={() => {
          setIsDrawerOpen(!isDrawerOpen);
          setConversationId("");
        }}
        handleTextInputChange={setConversationFilter}
        drawerContent={
          <>
            <ChatbotHeader>

              <ChatbotHeaderMain>
                <ChatbotHeaderMenu
                  ref={historyRef}
                  aria-expanded={isDrawerOpen}
                  onMenuToggle={() => setIsDrawerOpen(!isDrawerOpen)}
                />
                <ChatbotHeaderTitle>{horizontalLogo}</ChatbotHeaderTitle>
              </ChatbotHeaderMain>


              {/* // We don't support choosing a model yet, disable for now:
              <ChatbotHeaderActions>
                <ChatbotHeaderSelectorDropdown value={selectedModel} onSelect={onSelectModel}>
                  <DropdownList>
                    <DropdownItem value="Granite 7B" key="granite">
                      Granite 7B
                    </DropdownItem>
                    <DropdownItem value="Llama 3.0" key="llama">
                      Llama 3.0
                    </DropdownItem>
                    <DropdownItem value="Mistral 3B" key="mistral">
                      Mistral 3B
                    </DropdownItem>
                  </DropdownList>
                </ChatbotHeaderSelectorDropdown>
              </ChatbotHeaderActions>
              */}
            </ChatbotHeader>

            <AssistantMessageBox conversationId={conversationId} setConversationId={setConversationId}/>
          </>
        }
      ></ChatbotConversationHistoryNav>
    </Chatbot>
  );
};
export const AssistantMessageBox = (props: {
  conversationId: string,
  setConversationId: Dispatch<SetStateAction<string>>
}) => {
  if (props.conversationId) {
    return <AssistantUpdateMessageBox conversationId={props.conversationId}/>
  }
  return <AssistantNewMessageBox setConversationId={props.setConversationId}/>
}

export const AssistantUpdateMessageBox = (props: {
  conversationId: string,
}) => {

  const conversationQuery = useGetConversationQuery(props.conversationId);

  // const messages = (conversationQuery.data?.state.messages) || [];
  const messages: MessageProps[] = useMemo(
    () => {
      if (conversationQuery.isLoading || conversationQuery.data == null) {
        return [];
      }
      const results = [] as MessageProps[];
      conversationQuery.data.state.messages.forEach((message) => {
        results.push({
          role: message.message_type == 'human' ? 'user' : 'bot',
          content: message.content,
          name: message.message_type == 'human' ? 'user' : 'bot',
          avatar: message.message_type == 'human' ? userAvatar : patternflyAvatar,
          // timestamp: date.toLocaleString(),
          // avatarProps: {isBordered: true},
        });
      })

      return results
    }, [conversationQuery.data, conversationQuery.isLoading]
  );

  // const [messages, setMessages] = React.useState<MessageProps[]>(initialMessages);
  const [announcement, setAnnouncement] = React.useState<string>();
  const scrollToBottomRef = React.useRef<HTMLDivElement>(null);

  // Auto-scrolls to the latest message
  React.useEffect(() => {
    // don't scroll the first load - in this demo, we know we start with two messages
    if (messages.length > 2) {
      scrollToBottomRef.current?.scrollIntoView({behavior: 'smooth'});
    }
  }, [messages]);


  const [, setNewMessages] = React.useState<Array<string>>([]);
  const updateConversationMutation = useUpdateConversationMutation(props.conversationId);

  const handleSend = (message: string) => {
    setAnnouncement(`Message from User: ${message}. Message from Bot is loading.`);
    setNewMessages((prev) => {
      const newMessages = [...prev, message]

      // clone the conversationQuery.data object
      const update = JSON.parse(JSON.stringify(conversationQuery.data)) as ApiConversation;
      // for each item in newMessages
      newMessages.forEach((message) => {
        update.seq += 1;
        update.state.messages.push({
          message_type: 'human',
          content: message,
        });
      });

      (async () => {
        const conversation = await updateConversationMutation.mutateAsync(update);
        const messages = conversation.state.messages;
        setNewMessages([]);
        setAnnouncement(`Message from Bot: ${messages[messages.length-1].content}`);
      })();

      return newMessages
    });
  }

  return (
    <>
      <ChatbotContent>
        {/* Update the announcement prop on MessageBox whenever a new message is sent
                 so that users of assistive devices receive sufficient context  */}

        <MessageBox announcement={announcement}>
          <ChatbotWelcomePrompt
            title="Hello, Chatbot User"
            description="How may I help you today?"
            prompts={welcomePrompts}
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
        <MessageBar onSendMessage={handleSend} hasMicrophoneButton/>
        <ChatbotFootnote {...footnoteProps} />
      </ChatbotFooter>

    </>

  );
}
export const AssistantNewMessageBox = (props: {
  setConversationId: Dispatch<SetStateAction<string>>
}) => {

  const createConversationMutation = useCreateConversationMutation();

  const handleSend = async (message: string) => {
    const conversation = await createConversationMutation.mutateAsync({
      messages: [{
        message_type: 'human',
        content: message,
      }]
    });
    props.setConversationId(conversation.id);
  }

  return (
    <>
      <ChatbotContent>
        {/* Update the announcement prop on MessageBox whenever a new message is sent
                 so that users of assistive devices receive sufficient context  */}

        <MessageBox>
          <ChatbotWelcomePrompt
            title="Hello, Chatbot User"
            description="How may I help you today?"
            prompts={welcomePrompts}
          />
        </MessageBox>

      </ChatbotContent>
      <ChatbotFooter>
        <MessageBar onSendMessage={handleSend} hasMicrophoneButton/>
        <ChatbotFootnote {...footnoteProps} />
      </ChatbotFooter>
    </>
  );
}