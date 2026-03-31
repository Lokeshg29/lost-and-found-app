import { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const BASE = 'http://localhost:8080/api';

export default function Messages() {
  const { receiverId } = useParams();
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const receiverName = location.state?.receiverName || 'User';
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const navigate = useNavigate();

  // Guard — if no valid receiverId, go back
  useEffect(() => {
    if (!receiverId || receiverId === 'undefined') {
      navigate(-1);
      return;
    }
    if (!user) { navigate('/login'); return; }

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [receiverId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!receiverId || receiverId === 'undefined' || !user?.id) return;
    try {
      const res = await axios.get(
        `${BASE}/messages/conversation/${user.id}/${receiverId}`
      );
      setMessages(res.data);
      setError('');
    } catch (err) {
      setError('Could not load messages. Check backend is running.');
    }
  };

  const send = async () => {
    if (!text.trim() || !receiverId || receiverId === 'undefined') return;
    try {
      await axios.post(`${BASE}/messages/send`, {
        senderId: user.id,
        receiverId: Number(receiverId),
        content: text.trim(),
      });
      setText('');
      loadMessages();
    } catch (err) {
      setError('Send failed: ' + (err.response?.data || err.message));
    }
  };

  const timeStr = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: '680px', margin: '32px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)}
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: '8px', padding: '8px 14px', color: 'var(--text)',
            cursor: 'pointer', fontSize: '14px' }}>
          ← Back
        </button>
        <div>
          <h2 style={{ fontFamily: 'Sora', fontSize: '20px', margin: 0 }}>
            💬 {receiverName}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '12px', margin: 0 }}>Direct message</p>
        </div>
      </div>

      {error && (
        <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
          color: '#f87171', fontSize: '13px' }}>
          ⚠️ {error}
        </div>
      )}

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: '420px', overflowY: 'auto', padding: '20px',
          display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--muted)', marginTop: '120px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>👋</div>
              <p style={{ fontSize: '14px' }}>No messages yet. Say hello!</p>
            </div>
          )}

          {messages.map(m => {
            const isMine = m.sender?.id === user?.id;
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column',
                alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '3px',
                  paddingLeft: isMine ? 0 : '4px', paddingRight: isMine ? '4px' : 0 }}>
                  {isMine ? 'You' : (m.sender?.name || 'User')}
                </span>
                <div style={{
                  background: isMine ? 'var(--accent)' : 'var(--surface2)',
                  color: isMine ? '#0d0f14' : 'var(--text)',
                  padding: '10px 14px',
                  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  maxWidth: '72%', fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word',
                }}>
                  {m.content}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '3px' }}>
                  {timeStr(m.sentAt)}
                </span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <div style={{ display: 'flex', gap: '10px', padding: '16px',
          borderTop: '1px solid var(--border)', background: 'var(--surface2)' }}>
          <input value={text} onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Type a message... (Enter to send)"
            style={{ flex: 1, margin: 0 }} />
          <button onClick={send} className="btn-primary"
            style={{ width: 'auto', padding: '10px 22px' }}
            disabled={!text.trim()}>
            Send ➤
          </button>
        </div>
      </div>
    </div>
  );
}