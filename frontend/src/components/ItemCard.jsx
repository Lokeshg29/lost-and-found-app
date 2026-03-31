import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ItemCard({ item, onUpdate }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isOwner = user?.id === item.postedBy?.id;

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  const markReturned = async () => {
    await axios.patch(`http://localhost:8080/api/items/${item.id}/returned`);
    onUpdate?.();
  };

  const deleteItem = async () => {
    if (window.confirm('Delete this item?')) {
      await axios.delete(`http://localhost:8080/api/items/${item.id}`);
      onUpdate?.();
    }
  };

  const statusColors = {
    LOST: { bg: 'rgba(248,113,113,0.15)', color: '#f87171', border: 'rgba(248,113,113,0.3)' },
    FOUND: { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', border: 'rgba(74,222,128,0.3)' },
    RETURNED: { bg: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: 'rgba(34,211,238,0.3)' },
  };
  const sc = statusColors[item.status] || statusColors.LOST;

  return (
    <div className="card" style={{ transition: 'transform 0.2s', display: 'flex', flexDirection: 'column', gap: '12px' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ fontSize: '16px', fontFamily: 'Sora', fontWeight: 600 }}>{item.title}</h3>
        <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700,
          background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
          {item.status}
        </span>
      </div>

      {/* Description */}
      <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: 1.6 }}>
        {item.description || 'No description.'}
      </p>

      {/* Meta */}
      <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--muted)' }}>
        <span>📍 {item.location || 'Unknown'}</span>
        <span>🏷️ {item.category || 'General'}</span>
      </div>

      {/* Poster info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '8px',
        borderTop: '1px solid var(--border)' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px',
          fontWeight: 700, color: '#0d0f14' }}>
          {item.postedBy?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.postedBy?.name || 'Unknown'}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{timeAgo(item.postedAt)}</div>
        </div>

        {/* Contact button — only show if not your own post */}
        {!isOwner && user && (
          <button onClick={() => navigate(`/messages/${item.postedBy?.id}`)}
            style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              background: 'var(--surface2)', color: 'var(--accent2)', border: '1px solid var(--border)',
              cursor: 'pointer' }}>
            💬 Message
          </button>
        )}
      </div>

      {/* Owner actions */}
      {isOwner && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {item.status !== 'RETURNED' && (
            <button onClick={markReturned}
              style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                background: 'rgba(74,222,128,0.1)', color: '#4ade80',
                border: '1px solid rgba(74,222,128,0.3)', cursor: 'pointer' }}>
              ✅ Mark Returned
            </button>
          )}
          <button onClick={deleteItem}
            style={{ padding: '8px 14px', borderRadius: '8px', fontSize: '12px',
              background: 'rgba(248,113,113,0.1)', color: '#f87171',
              border: '1px solid rgba(248,113,113,0.3)', cursor: 'pointer' }}>
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}