import React, { createContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  _id: string;
  profilePic: string;
  lastMessage: string;
  lastMessageSendAt: string;
}

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
interface UserContextType {
  chattingWith: User | null;
  setChattingWith: (user: User | null) => void;
  messages: Record<string, Message[]>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  fetchUsers: (currentUser: User ) => void;
  globalMessages: GlobalMessage[];
  setGlobalMessages: React.Dispatch<React.SetStateAction<GlobalMessage[]>>;
}

const initialContext: UserContextType = {
  chattingWith: null,
  setChattingWith: () => {},
  messages: {},
  setMessages: () => {},
  users: [],
  setUsers: () => {},
  fetchUsers: () => {},
  globalMessages: [],
  setGlobalMessages: () => {},
};

const API_URL: string = import.meta.env.VITE_API_URL;

export const UserContext = createContext<UserContextType>(initialContext);

interface UserContextProviderProps {
  children: ReactNode;
}

const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
  const [chattingWith, setChattingWith] = useState<User | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [globalMessages, setGlobalMessages] = useState<GlobalMessage[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const fetchUsers = async (currentUser:  User  ) => {
    try {

      const response = await fetch(`${API_URL}/api/chats/${currentUser._id}`);

      if (response.ok) {
        const data: User[] = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const value: UserContextType = {
    chattingWith,
    setChattingWith: (user: User | null) => {
      setChattingWith(user);
      if (user && !messages[user._id]) {
        setMessages((prevMessages) => ({
          ...prevMessages,
          [user._id]: [],
        }));
      }
    },
    messages,
    setMessages,
    users,
    setUsers,
    fetchUsers,
    globalMessages,
    setGlobalMessages,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserContextProvider };
