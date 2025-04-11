// frontend/src/components/Chat.js
import React, { useState } from 'react';
import axios from 'axios';
import './Chat.css'; // Import your custom styling

function Chat() {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Append user's message
    const userMessage = { sender: 'user', text: message };
    setChatLog((prevLog) => [...prevLog, userMessage]);

    try {
      const response = await axios.post('http://localhost:5000/api/tutor', { message });
      const tutorMessage = { sender: 'tutor', text: response.data.reply };
      setChatLog((prevLog) => [...prevLog, tutorMessage]);
      // Optionally trigger R2-D2 sound effects here
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
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask AstroTutor something about astronomy..."
          className="chat-input"
        />
        <button type="submit" className="chat-button">Send</button>
      </form>
    </div>
  );
}

export default Chat;
