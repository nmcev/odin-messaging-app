import React, { useContext, useEffect, useState } from 'react';
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


interface Message {
  content: string;
  sender: string;
  receiver: string;
  sendAt: string;
}

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
    


    // socket connection
  useEffect(() => {
    const newSocket = io(API_URL);

    newSocket.on('connect', () => {
      setSocket(newSocket);
      console.log(newSocket.connected);

    });
    newSocket.emit('register', authContext.currentUser.user._id);

    // check connection status
    
    newSocket.on('receiveMessage', (receivedMessage: Message) => {
      setUsers((prevUsers) => {
        const updatedUsers = prevUsers.map((user) => {
          if (user._id === receivedMessage.sender) {
            return {
              ...user,
              lastMessage: receivedMessage.content,
              lastMessageSendAt: receivedMessage.sendAt,
            };
          }
          return user;
        });

        updatedUsers.sort((a, b) => {
          return new Date(b.lastMessageSendAt).getTime() - new Date(a.lastMessageSendAt).getTime();
        });
        
        return updatedUsers;
      }
      );



      setMessages((prevMessages: Record<string, Message[]>) => ({
        ...prevMessages,
        [receivedMessage.sender.toString()]: [
          ...(prevMessages[receivedMessage.sender.toString()] || []),
          receivedMessage,
        ],
      }));
    });

        //receive global message
        newSocket.on('receiveGlobalMessage', (receivedMessage: GlobalMessage) => {

          setGlobalMessages((prevMessages) => {
            return [...prevMessages, receivedMessage];
          }); 
        
          console.log(receivedMessage);
    
        });
    return () => {
      newSocket.disconnect();
    };
  }, [authContext.currentUser.user._id, setMessages]);

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
          console.log(data);
          setGlobalMessages(data);
        }
      } catch (error) {
        console.error(error);
      }

    };

    fetchGlobalMessages();
  }, [authContext.token, setGlobalMessages]);


// fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_URL}/api/chats/${currentUser?.user._id}`);

        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser, results]);



  const handleGlobalChat = () => {
    setOpenGlobalChat(true);
    setChattingWith(null);
  }

  const chatContainerStyle: React.CSSProperties = {
    height: 'calc(100vh - 6rem)',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  };
  
  return (
    <div className='grid md:grid-cols-8 w-screen grid-cols-1'>
      {/* Chats section */}
      <section className='flex flex-col min-h-screen md:col-span-2 col-span-1 bg-gray-200 dark:bg-[#181A1B] relative border-r-[1px] border-gray-500' style={chatContainerStyle}>
  <SearchBar setResults={setResults} />
  <SearchResult results={results} />

  <div className='flex flex-col gap-4 flex-grow'>
    {/* Global chat */}
    {results.length === 0 && (
      <>
        <div className='border-b-[1px] border-gray-300 w-96 ml-10'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200 poppins-bold'>Global Chat</h2>
        </div>
        <section className="flex flex-col gap-8 pl-10 mt-4">
          <div className='flex items-center cursor-pointer hover:bg-[#1919194b] rounded-md gap-4 p-2 mx-3' onClick={handleGlobalChat}>
            <div className='w-12 h-12 flex-shrink-0'>
              <img className='rounded-full w-full h-full object-cover' src={globalIcon} alt='global chat icon' />
            </div>
            <h2 className='text-xl font-bold'>TalkMate Chat</h2>
          </div>
        </section>
      </>
    )}

    {/* Display users */}
    {users.length > 0 && !results.length && (
      <>
        <div className='border-b-[1px] border-gray-300 w-96 ml-10 mt-5'>
          <h2 className='text-xl font-bold text-gray-800 dark:text-gray-200 poppins-bold'>Chats</h2>
        </div>
        <UsersList users={users} setOpenGlobalChat={setOpenGlobalChat} />
      </>
    )}
  </div>


  <FooterProfile currentUser={currentUser} />
</section>


      {/* chat section */}
      <section className='md:col-span-6 dark:bg-[#181A1B] relative'>
      <ChatHeader />

        {/* display messages */}
        {chattingWith && !openGlobalChat && <MessagesDisplay />}

        {/* Message and image input */}
        {chattingWith && !openGlobalChat && (
          <SendMessageComponent message={message} setMessage={setMessage} setUsers={setUsers} socket={socket} />
        )}

        {/* global chat */}
        {openGlobalChat && (
          <>
            <SendMessageGlobal globalMessage={globalMessage} setGlobalMessage={setGlobalMessage} socket={socket} />
            <DisplayGlobalMessages />
          </>
        )}
      </section>
    </div>
  );
};
