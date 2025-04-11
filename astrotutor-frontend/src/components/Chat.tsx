// src/components/Chat.tsx
import React, { useState } from 'react';
import axios from 'axios';
import './Chat.css';

interface ChatMessage {
  sender: 'user' | 'tutor';
  text: string;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!message.trim()) return;

    // Append the user's message to chat log
    const userMessage: ChatMessage = { sender: 'user', text: message };
    setChatLog((prevLog) => [...prevLog, userMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/tutor', { message });
      const tutorMessage: ChatMessage = { sender: 'tutor', text: response.data.reply };
      setChatLog((prevLog) => [...prevLog, tutorMessage]);
      // Optionally, you can add sound effects or animations for the tutor response here.
    } catch (error) {
      console.error('Error:', error);
      setChatLog((prevLog) => [
        ...prevLog,
        { sender: 'tutor', text: 'Oops, something went wrong. Please try again later.' }
      ]);
    }
    setMessage('');
  };

  return (
    <div className="chat-container">
      <header className="chat-header">
        <img src="/r2d2-avatar.png" alt="AstroTutor R2-D2" className="avatar" />
        <h1>AstroTutor</h1>
      </header>
      <div className="chat-log">
        {chatLog.map((entry, index) => (
          <div key={index} className={`chat-entry ${entry.sender}`}>
            {entry.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          value={message}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
          placeholder="Ask AstroTutor something about astronomy..."
          className="chat-input"
        />
        <button type="submit" className="chat-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
