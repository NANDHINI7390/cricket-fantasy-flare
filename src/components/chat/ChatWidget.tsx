import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const ChatWidget = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchData = async (url: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const input = userInput.trim();
    setMessages([...messages, { from: 'user', text: input }]);
    setUserInput('');
    setLoading(true);

    const lowerInput = input.toLowerCase();
    let response;

    try {
      if (lowerInput.includes('today') && lowerInput.includes('match')) {
        const res = await fetchData('/api/current-matches');
        response = {
          from: 'bot',
          cards: res?.matches?.map((match: any) => ({
            title: `${match.team1} vs ${match.team2}`,
            subtitle: `Starts at: ${match.startTime}`,
            matchStatus: match.status || 'Upcoming',
          })) || [],
        };
      } else if (
        lowerInput.includes('stats') ||
        lowerInput.includes('runs') ||
        lowerInput.includes('player')
      ) {
        const playerName = input.replace(/.*\b(player|stats|runs)\b\s*/i, '').trim();
        const res = await fetchData(`/api/player-stats?name=${encodeURIComponent(playerName)}`);
        response = {
          from: 'bot',
          cards: res ? [{
            title: `${res.name}`,
            subtitle: `Runs: ${res.runs}, Fours: ${res.fours}, Sixes: ${res.sixes}, Average: ${res.average}`,
          }] : [],
        };
      } else if (lowerInput.includes('captain')) {
        const res = await fetchData('/api/captain-suggestions');
        if (res && res.captain) {
          response = {
            from: 'bot',
            text: `Based on top player performances, you should choose **${res.captain}** as captain. A strong vice-captain choice is **${res.viceCaptain}**. The top performer today is **${res.topPerformer}**.`,
          };
        } else {
          response = { from: 'bot', text: 'I could not find the best captain suggestion at the moment.' };
        }
      } else {
        response = {
          from: 'bot',
          text: "I didn't get that. Ask me about today's matches, player stats, or captain recommendations!",
        };
      }
    } catch (err) {
      response = {
        from: 'bot',
        text: 'Oops! Something went wrong while fetching data.',
      };
    }

    setMessages(prev => [...prev, response]);
    setLoading(false);
  };

  return (
    <div className="chatbot-container">
      <div className="chat-window">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.from}`}>
            {msg.text && <p dangerouslySetInnerHTML={{ __html: msg.text }} />}
            {msg.cards && (
              <div className="card-list">
                {msg.cards.map((card: any, i: number) => (
                  <div key={i} className="card">
                    <strong>{card.title}</strong>
                    <p>{card.subtitle}</p>
                    {card.matchStatus && <p>Status: {card.matchStatus}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && <div className="message bot">Loading...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={userInput}
          onChange={e => setUserInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask me about matches, players, captains..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatWidget;
