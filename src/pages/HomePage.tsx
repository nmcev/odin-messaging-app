import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import SearchBar from '../components/SearchBar';
import { SearchResult } from '../components/SearchResult';
import { AuthContext } from '../context/AuthContext';
import { FooterProfile } from '../components/FooterProfile';
import { UsersList } from '../components/UsersList';
import { UserContext } from '../context/UserContext';
import { SendMessageComponent } from '../components/SendMessageComponent';
import { ChatHeader } from '../components/ChatHeader';
import { MessagesDisplay } from '../components/MessagesDisplay';
import  globalIcon from '../assets/global.svg';
import { io, Socket } from 'socket.io-client';
import { SendMessageGlobal } from '../components/SendMessageGlobal';
import { DisplayGlobalMessages } from '../components/DisplayGlobalMessages';
import { UserStatus } from '../components/UserStatus';
import usersIcon from '../assets/users.svg';
import chatsIcon from '/chat.svg';
import { Message } from '../types/Message';
import { toExpiredPlaceholder } from '../utils/message';

interface GlobalMessage {
  content: string;
  sender: Sender;
  sendAt: string;
}

interface Sender {
  _id: string;
  profilePic: string;
  username: string;
}


interface User {
  _id: string;
  username: string;
  profilePic: string;
  lastMessage: string;
  lastMessageSendAt: string;
  unreadCount?: number;
}

interface MessagesReadEvent {
  reader: string;  // who opened the conversation
  partner: string; // whose messages got read
  readAt: string;
}

const API_URL: string = import.meta.env.VITE_API_URL;

export const HomePage: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [globalMessage, setGlobalMessage] = useState<string>('');
  const [results, setResults] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const authContext = useContext(AuthContext)!;
  const { currentUser } = authContext;
  const { chattingWith, setMessages, setGlobalMessages, setChattingWith } = useContext(UserContext)!;
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const [openGlobalChat, setOpenGlobalChat] = useState<boolean>(false);
  const [ onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [ offlineUsers, setOfflineUsers] = useState<User[]>([]);
  const [ isUsersOpen,  setIsUsersOpen] = useState<boolean>(false);
  const [isChatsOpen, setIsChatsOpen] = useState<boolean>(true);
  // bumping this remounts the search bar, which clears the box and cancels any pending search
  const [searchKey, setSearchKey] = useState(0);

  const myId = currentUser?.user._id;
  const authToken = authContext.token;

  // fetch the chat list (people this user has talked to, newest first)
  const fetchUsers = useCallback(async () => {
    if (!myId) return;
    try {
      const response = await fetch(`${API_URL}/api/chats/${myId}`, {
        headers: {
          Authorization: `${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    }
  }, [myId, authToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // the socket handlers are created once, so they read the latest list/fetcher through refs
  const usersRef = useRef<User[]>(users);
  usersRef.current = users;
  const fetchUsersRef = useRef(fetchUsers);
  fetchUsersRef.current = fetchUsers;

  // the conversation currently on screen (null for the list or the global chat)
  const activeChatId = !openGlobalChat && chattingWith ? chattingWith._id : null;
  const activeChatIdRef = useRef<string | null>(activeChatId);
  activeChatIdRef.current = activeChatId;

  // only counts as read when the chat is open AND the tab is actually visible
  const isReading = (partnerId: string) =>
    activeChatIdRef.current === partnerId && document.visibilityState === 'visible';

  const setUnread = (partnerId: string, update: (count: number) => number) =>
    setUsers((prev) =>
      prev.map((u) => (u._id === partnerId ? { ...u, unreadCount: update(u.unreadCount ?? 0) } : u))
    );

    // socket connection
    useEffect(() => {
      const newSocket = io(API_URL, { auth: { token: authContext.token } });
    
        setSocket(newSocket);
    
        newSocket.on('onlineUsers', (users: User[]) => {
          setOnlineUsers(users);
        });
    
        newSocket.on('offlineUsers', (users: User[]) => {
          setOfflineUsers(users);
        });
    
        newSocket.on('receiveMessage', (receivedMessage: Message) => {
          // first message from someone new: we don't have their profile yet, so reload the list
          if (!usersRef.current.some((user) => user._id === receivedMessage.sender)) {
            fetchUsersRef.current();
          }

          const reading = isReading(receivedMessage.sender);
          if (reading) {
            newSocket.emit('markRead', { partner: receivedMessage.sender });
          }

          setUsers((prevUsers) => {
            const updatedUsers = prevUsers.map((user) => {
              if (user._id === receivedMessage.sender) {
                return {
                  ...user,
                  lastMessage: receivedMessage.content,
                  lastMessageSendAt: receivedMessage.sendAt,
                  unreadCount: reading ? 0 : (user.unreadCount ?? 0) + 1,
                };
              }
              return user;
            });

            updatedUsers.sort((a, b) => {
              return new Date(b.lastMessageSendAt).getTime() - new Date(a.lastMessageSendAt).getTime();
            });
            
            return updatedUsers;
          });
    
          setMessages((prevMessages: Record<string, Message[]>) => ({
            ...prevMessages,
            [receivedMessage.sender.toString()]: [
              ...(prevMessages[receivedMessage.sender.toString()] || []),
              receivedMessage,
            ],
          }));
        });
      
      newSocket.on('messageExpired', (d: { messageId: string; between: string[] }) => {
       const myId = authContext.currentUser.user._id.toString();
        const otherId = d.between.find((id) => id !== myId);
       if (!otherId) return;

       // the server deleted it, so reload the list to drop it from the "last message" preview
       fetchUsersRef.current();

    setMessages((prevMessages: Record<string, Message[]>) =>
       prevMessages[otherId]
         ? {
           ...prevMessages,
            [otherId]: prevMessages[otherId].map((m) =>
           m._id === d.messageId ? toExpiredPlaceholder(m) : m
        ),
          }
         : prevMessages
        );
      });
    
        newSocket.on('messagesRead', (d: MessagesReadEvent) => {
          const me = authContext.currentUser.user._id.toString();

          if (d.reader === me) {
            // I read this chat in another tab or device: clear the dot here too
            setUnread(d.partner, () => 0);
            return;
          }

          // the other person opened our chat: mark my confirmed messages sent up to then as read
          const readTime = new Date(d.readAt).getTime();
          setMessages((prev) => {
            const list = prev[d.reader];
            if (!list) return prev;
            return {
              ...prev,
              [d.reader]: list.map((m) =>
                m.sender === me && m._id && !m.readAt && new Date(m.sendAt).getTime() <= readTime
                  ? { ...m, readAt: d.readAt }
                  : m
              ),
            };
          });
        });

        newSocket.on('receiveGlobalMessage', (receivedMessage: GlobalMessage) => {
          setGlobalMessages((prevMessages) => {
            return [...prevMessages, receivedMessage];
          });
        });
    
        newSocket.on('disconnect', () => {
          console.log('Socket disconnected');
        });
    
        return () => {
          newSocket.off('onlineUsers');
          newSocket.off('offlineUsers');
          newSocket.off('receiveMessage');
          newSocket.off('messageExpired');
          newSocket.off('messagesRead');
          newSocket.off('receiveGlobalMessage');
          newSocket.off('disconnect');
          newSocket.disconnect();
        };
    }, [authContext.currentUser.user._id, authContext.token, setGlobalMessages, setMessages]);
    

  // opening a chat (or coming back to the tab while one is open) marks it read
  useEffect(() => {
    if (!socket || !activeChatId) return;

    const markRead = () => {
      if (document.visibilityState !== 'visible') return;
      socket.emit('markRead', { partner: activeChatId });
      setUsers((prev) =>
        prev.map((u) => (u._id === activeChatId && u.unreadCount ? { ...u, unreadCount: 0 } : u))
      );
    };

    markRead();
    document.addEventListener('visibilitychange', markRead);
    return () => document.removeEventListener('visibilitychange', markRead);
  }, [socket, activeChatId]);

// fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`${API_URL}/api/messages/${chattingWith?._id}`, {
          headers: {
            Authorization: `${authContext.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMessages((prevMessages) => ({
            ...prevMessages,
            [chattingWith?._id.toString() || '']: data,
          }));
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (chattingWith) {
      fetchMessages();
    }
  }, [authContext.token, chattingWith, setMessages]);


  // fetch global messages
  useEffect(() => {
    const fetchGlobalMessages = async () => {

      try {
        const response = await fetch(`${API_URL}/api/global-messages`, {
          headers: {
            Authorization: `${authContext.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGlobalMessages(data);
        }
      } catch (error) {
        console.error(error);
      }

    };

    fetchGlobalMessages();
  }, [authContext.token, setGlobalMessages]);



  // clicking the global chat while it's open closes it
  const handleGlobalChat = () => {
    if (openGlobalChat) {
      handleBack();
      return;
    }
    setOpenGlobalChat(true);
    setChattingWith(null);
  }

  // the server sends everyone; you shouldn't appear in your own Users lists
  const otherOnlineUsers = onlineUsers.filter((u) => u._id !== myId);
  const isPartnerOnline = Boolean(chattingWith) && onlineUsers.some((u) => u._id === chattingWith?._id);
  const otherOfflineUsers = offlineUsers.filter((u) => u._id !== myId);

  // used by the Chats list and the Users lists: opens a chat, or closes it if it's the open one
  const handleToggleChat = (user: User) => {
    if (activeChatId === user._id) {
      handleBack();
      return;
    }
    setOpenGlobalChat(false);
    setChattingWith(user);
  };

  // opening someone from search must also leave the global chat,
  // otherwise their name shows in the header while you type into the public room
  const handleSelectSearchResult = (user: User) => {
    setOpenGlobalChat(false);
    setChattingWith(user);
    setResults([]);
    setSearchKey((k) => k + 1);
  };

  // on phones only one pane is visible: the list, or the open conversation
  const isConversationOpen = Boolean(chattingWith) || openGlobalChat;

  // Opening a conversation adds one history entry, so the phone's back
  // button/gesture closes the chat instead of leaving the app.
  useEffect(() => {
    if (isConversationOpen && !window.history.state?.chatOpen) {
      // keep React Router's own state fields so its history index stays valid
      window.history.pushState({ ...window.history.state, chatOpen: true }, '');
    }
  }, [isConversationOpen]);

  useEffect(() => {
    const onPopState = () => {
      if (!window.history.state?.chatOpen) {
        setOpenGlobalChat(false);
        setChattingWith(null);
      }
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [setChattingWith]);

  const handleBack = () => {
    if (window.history.state?.chatOpen) {
      // pop our entry; the popstate listener closes the chat
      window.history.back();
    } else {
      setOpenGlobalChat(false);
      setChattingWith(null);
    }
  };

  const navButtonClass = (active: boolean) =>
    `flex flex-col items-center gap-1 p-2 rounded-xl bg-transparent transition-colors ${
      active ? 'bg-black/10 dark:bg-white/10' : 'opacity-60 hover:opacity-100'
    }`;

  return (
    <div className='flex w-full h-dvh overflow-hidden max-md:flex-col'>

      {/* Nav: left rail on desktop, bottom tab bar on phones */}
      <aside
        className={`bg-gray-300 dark:bg-[#181A1B] border-neutral-500 shrink-0
          md:w-20 md:pt-8 md:border-r-[1px]
          max-md:order-last max-md:border-t-[1px] max-md:pb-[env(safe-area-inset-bottom)]
          ${isConversationOpen ? 'max-md:hidden' : ''}`}
      >
        <nav className='flex md:flex-col items-center justify-around md:justify-start md:gap-6 py-1 md:py-0'>
          <button
            type='button'
            aria-label='Chats'
            className={navButtonClass(isChatsOpen)}
            onClick={() => {
              setIsUsersOpen(false);
              setIsChatsOpen(true);
            }}
          >
            <img src={chatsIcon} alt='' className='w-7 h-7' />
            <span className='text-[11px] md:hidden'>Chats</span>
          </button>
          <button
            type='button'
            aria-label='Users'
            className={navButtonClass(isUsersOpen)}
            onClick={() => {
              setIsUsersOpen(true);
              setIsChatsOpen(false);
            }}
          >
            <img src={usersIcon} alt='' className='w-7 h-7' />
            <span className='text-[11px] md:hidden'>Users</span>
          </button>
        </nav>
      </aside>

      {/* Chats list section */}
      <section
        className={`flex flex-col min-h-0 bg-gray-200 dark:bg-[#181A1B] border-gray-500
          max-md:flex-1 md:w-80 lg:w-96 md:shrink-0 md:border-r-[1px]
          ${isConversationOpen ? 'max-md:hidden' : ''}`}
      >
        <div className='shrink-0 pt-[env(safe-area-inset-top)]'>
          <SearchBar key={searchKey} setResults={setResults} />
        </div>

        <div className='flex-1 min-h-0 overflow-y-auto pb-4'>
          <SearchResult results={results} onSelect={handleSelectSearchResult} />

          {isChatsOpen ? (
            <>
              {results.length === 0 && (
                <>
                  <div className='border-b-[1px] border-gray-300 dark:border-gray-600 mx-4 mt-2'>
                    <h2 className='text-lg font-bold text-gray-800 dark:text-gray-200 poppins-bold'>Global Chat</h2>
                  </div>
                  <div className='flex flex-col px-2 mt-2'>
                    <div
                      className={`flex items-center cursor-pointer hover:bg-[#1919194b] active:bg-[#1919194b] rounded-md gap-3 p-2 ${openGlobalChat ? 'bg-black/10 dark:bg-white/10' : ''}`}
                      aria-current={openGlobalChat ? 'true' : undefined}
                      title={openGlobalChat ? 'Click to close this chat' : undefined}
                      onClick={handleGlobalChat}
                    >
                      <div className='w-12 h-12 flex-shrink-0'>
                        <img className='rounded-full w-full h-full object-cover' src={globalIcon} alt='global chat icon' />
                      </div>
                      <h2 className='text-lg font-bold truncate'>TalkMate Chat</h2>
                    </div>
                  </div>
                </>
              )}

              {/* Display users */}
              {users.length > 0 && !results.length ? (
                <>
                  <div className='border-b-[1px] border-gray-300 dark:border-gray-600 mx-4 mt-5'>
                    <h2 className='text-lg font-bold text-gray-800 dark:text-gray-200 poppins-bold'>Chats</h2>
                  </div>
                  <UsersList users={users} activeChatId={activeChatId} onToggleChat={handleToggleChat} />
                </>
              ) : (
                !results.length && (
                  <p className='text-gray-500 text-center px-6 mt-10'>
                    Start a conversation by searching for a user or clicking on the global chat.
                  </p>
                )
              )}
            </>
          ) : (
            <UserStatus onlineUsers={otherOnlineUsers} offlineUsers={otherOfflineUsers} activeChatId={activeChatId} onToggleChat={handleToggleChat} results={results} />
          )}
        </div>

        <FooterProfile currentUser={currentUser} />
      </section>

      {/* Conversation section */}
      <section
        className={`flex-1 min-w-0 min-h-0 flex flex-col dark:bg-[#181A1B]
          ${isConversationOpen ? '' : 'max-md:hidden'}`}
      >
        <ChatHeader isGlobal={openGlobalChat} onBack={handleBack} isPartnerOnline={isPartnerOnline} />

        {chattingWith && !openGlobalChat && (
          <>
            <MessagesDisplay />
            <SendMessageComponent message={message} setMessage={setMessage} setUsers={setUsers} socket={socket} />
          </>
        )}

        {openGlobalChat && (
          <>
            <DisplayGlobalMessages />
            <SendMessageGlobal globalMessage={globalMessage} setGlobalMessage={setGlobalMessage} socket={socket} />
          </>
        )}

        {!isConversationOpen && (
          <div className='flex-1 flex items-center justify-center'>
            <p className='text-xl font-bold text-gray-500 dark:text-gray-400'>Select a chat to start messaging</p>
          </div>
        )}
      </section>
    </div>
  );
};
