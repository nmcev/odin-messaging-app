import React, { createContext, useState } from 'react';

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
}

interface UserContextType {
  chattingWith: User | null;
  setChattingWith: (user: User | null) => void;
  messages: Record<string, Message[]>;
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>;

}

const initialContext: UserContextType = {
  chattingWith: null,
  setChattingWith: () => {},
  messages: {},
  setMessages: () => {},

};

export const UserContext = createContext<UserContextType>(initialContext);

interface UserContextProviderProps {
  children: React.ReactNode;
}

const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
  const [chattingWith, setChattingWith] = useState<User | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});

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

  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export { UserContextProvider };
