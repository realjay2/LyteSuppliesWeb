// GPT.js - React component for ChatGPT using OpenAI API

import React, { useState } from 'react';
import axios from 'axios';

const GPT = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'system', content: 'You are a helpful assistant.' },
  ]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post('/api/chat', { messages: newMessages });
      const assistantMessage = response.data.choices[0].message;

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error('Error communicating with OpenAI:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Error: Failed to get response.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 16, fontFamily: 'Arial' }}>
      <h2>ChatGPT AI System</h2>
      <div style={{ border: '1px solid #ccc', padding: 16, borderRadius: 8, height: 400, overflowY: 'scroll' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 12, color: msg.role === 'user' ? 'blue' : 'green' }}>
            <strong>{msg.role === 'user' ? 'You' : 'Assistant'}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <textarea
        rows="3"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything..."
        style={{ width: '100%', marginTop: 12, fontSize: 16, padding: 8, borderRadius: 4 }}
      />
      <button onClick={sendMessage} disabled={loading} style={{ marginTop: 8, padding: '8px 16px' }}>
        {loading ? 'Loading...' : 'Send'}
      </button>
    </div>
  );
};

export default GPT;
