// src/components/Chat.tsx
import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import axios from 'axios';
import './Chat.css'; // We'll create/update this next
import r2d2Avatar from '../assets/r2d2-avatar.jpg';

interface ChatMessage {
  sender: 'user' | 'tutor';
  text: string;
}

const Chat: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatLogEndRef = useRef<HTMLDivElement>(null); // Ref for scrolling

  // Effect to scroll to bottom when chatLog updates
  useEffect(() => {
    chatLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return; // Prevent empty messages or sending while loading

    const userMessage: ChatMessage = { sender: 'user', text: trimmedMessage };
    setChatLog((prevLog) => [...prevLog, userMessage]);
    setMessage(''); // Clear input immediately
    setIsLoading(true); // Start loading indicator

    try {
      // --- Simulate R2-D2 "thinking" time (optional, remove if backend is fast) ---
      await new Promise(resolve => setTimeout(resolve, 500));
      // --------------------------------------------------------------------------

      const response = await axios.post<{ reply: string }>(
        'https://astrotutor-591b88a8e9b1.herokuapp.com/api/tutor',
        { message: trimmedMessage }
      );
      const tutorMessage: ChatMessage = { sender: 'tutor', text: response.data.reply };
      setChatLog((prevLog) => [...prevLog, tutorMessage]);
      // Optionally, play a beep/boop sound here!
      // const audio = new Audio('/path/to/r2d2-beep.mp3');
      // audio.play();

    } catch (error) {
      console.error('Error contacting AstroTutor:', error);
      setChatLog((prevLog) => [
        ...prevLog,
        { sender: 'tutor', text: '*BEEP BOOP* Error processing request... static interference detected.' }
      ]);
    } finally {
      setIsLoading(false); // Stop loading indicator
    }
  };

  return (
    <div className="retro-chat-container">
      <header className="retro-chat-header">
        {/* Main R2-D2 Avatar in Header */}
        <img src={r2d2Avatar} alt="AstroTutor R2-D2" className="header-avatar" />
        <h1>SAY HELLO TO YOUR ASTROTUTOR R2D2!</h1>
        {/* Optional: Add some decorative retro elements here */}
        {/* <div className="header-scanline"></div> */}
      </header>

      <div className="retro-chat-log" aria-live="polite">
        {chatLog.map((entry, index) => (
          <div key={index} className={`chat-entry ${entry.sender}`}>
            {entry.sender === 'tutor' && (
              // Inline avatar for Tutor messages
              <img
                src={r2d2Avatar} 
                alt="R2"
                className="inline-avatar tutor-avatar"
              />
            )}
            <div className="message-bubble">
              <p className="message-text">{entry.text}</p>
            </div>
             {entry.sender === 'user' && (
               // Optional: Placeholder for a user avatar if needed later
               <div className="inline-avatar user-avatar-placeholder"></div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="chat-entry tutor loading-indicator">
             <img
                src="/r2d2-avatar.png"
                alt="R2"
                className="inline-avatar tutor-avatar"
              />
            <div className="message-bubble">
              <p className="message-text"><i>*beep boop bip... processing...*</i></p>
            </div>
          </div>
        )}

        {/* Element to scroll to */}
        <div ref={chatLogEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="retro-chat-form">
        <input
          type="text"
          value={message}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
          placeholder="Transmit inquiry to R2 unit..."
          className="retro-chat-input"
          aria-label="Your message"
          disabled={isLoading} // Disable input while loading
        />
        {/* Use a more retro character or word for the button */}
        <button type="submit" className="retro-chat-button" disabled={isLoading}>
           {/* Or use SEND, TX, ▶ */}
        </button>
      </form>
    </div>
  );
};

export default Chat;