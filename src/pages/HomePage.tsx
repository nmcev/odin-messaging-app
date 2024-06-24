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
  const [results, setResults] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const authContext = useContext(AuthContext)!;
  const { currentUser } = authContext;
  const { chattingWith, setMessages } = useContext(UserContext)!;


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
  }, [API_URL, authContext.token, chattingWith, setMessages]);




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




  return (
    <div className='grid md:grid-cols-8 w-screen grid-cols-1'>
      {/* Chats section */}
      <section className='md:col-span-2 col-span-1 bg-gray-200 min-h-screen dark:bg-slate-800 relative'>
        <SearchBar setResults={setResults} />
        <SearchResult results={results} />

      {users.length > 0 && !results.length && <UsersList users={users} />}

        <FooterProfile currentUser={currentUser} />
      </section>

      {/* chat section */}
      <section className='md:col-span-6 dark:bg-[#121e30] relative'>
      <ChatHeader />

        {/* display messages */}
        {chattingWith && (
          <MessagesDisplay />
        )}

        {/* message and image input */}
        {chattingWith && (
          <SendMessageComponent message={message} setMessage={setMessage} setUsers={setUsers} />
        )}
      </section>
    </div>
  );
};
