// this is a modified version of the packages/module/patternfly-docs/content/extensions/chatbot/examples/demos/EmbeddedChatbot.tsx
// component from the PatternFly Chatbot demo
import PFHorizontalLogoColor from "@src/assets/PF-HorizontalLogo-Color.svg";
import PFHorizontalLogoReverse from "@src/assets/PF-HorizontalLogo-Reverse.svg";
import Chatbot, {ChatbotDisplayMode,} from "@patternfly/chatbot/dist/dynamic/Chatbot";
import ChatbotConversationHistoryNav, {
  Conversation,
} from "@patternfly/chatbot/dist/dynamic/ChatbotConversationHistoryNav";
import ChatbotHeader, {
  ChatbotHeaderMain,
  ChatbotHeaderMenu,
  ChatbotHeaderTitle,
} from "@patternfly/chatbot/dist/dynamic/ChatbotHeader";
import {Brand, Bullseye} from "@patternfly/react-core";
import React, {useMemo} from "react";
import {useCreateConversationMutation, useListConversationsQuery,} from "@src/queries/conversations.ts";
import {createFileRoute, Outlet, useNavigate} from "@tanstack/react-router";

export const Route = createFileRoute("/conversations")({
  component: Conversations,
});

function Conversations() {
  const navigate = useNavigate();
  const createConversationMutation = useCreateConversationMutation();

  const [conversationFilter, setConversationFilter] = React.useState("");
  const listConversationsQuery = useListConversationsQuery(conversationFilter);

  const conversations = useMemo(() => {
    if (
      listConversationsQuery.isLoading ||
      listConversationsQuery.data == null
    ) {
      return [];
    }

    // TODO: do we need to handle the empty case?
    // if (Object.keys(filteredConversations).length === 0) {
    //   filteredConversations = [{id: '13', noIcon: true, text: 'No results found'}];
    // }

    const results = {} as { [key: string]: Conversation[] };
    listConversationsQuery.data.items.forEach((conversation) => {
      const updated_at = new Date(conversation.updated_at);
      const key = updated_at.toLocaleString("default", {month: "long"});
      if (results[key] == null) {
        results[key] = [];
      }
      results[key].push({
        id: conversation.id,
        text: conversation.summary,
        onSelect: async () => {
          await navigate({
            to: `/conversations/${conversation.id}`,
          });
        },
      });
    });

    console.log("memo conversations", results);
    return results;
  }, [listConversationsQuery, navigate]);

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
      <Brand
        className="show-light"
        src={PFHorizontalLogoColor}
        alt="PatternFly"
      />
      <Brand
        className="show-dark"
        src={PFHorizontalLogoReverse}
        alt="PatternFly"
      />
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
        onSelectActiveItem={(_e, conversationId) => {
          console.log(`Selected conversation with id ${conversationId}`);
          navigate({
            to: `/conversations/${conversationId}`,
          });
        }}
        conversations={conversations}
        onNewChat={async () => {
          setIsDrawerOpen(!isDrawerOpen);
          const conversation = await createConversationMutation.mutateAsync();
          await navigate({
            to: `/conversations/${conversation.id}`,
          });
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
            <Outlet/>
          </>
        }
      ></ChatbotConversationHistoryNav>
    </Chatbot>
  );
}
