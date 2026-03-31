import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

export default function ItemCard({ item, onUpdate }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const isOwner = user?.id === item?.postedBy?.id;

  const timeAgo = (dateStr) => {
    if (!dateStr) return 'recently';
    const diff = Date.now() - new Date(dateStr);
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const markReturned = async () => {
    try {
      await axios.patch(`http://localhost:8080/api/items/${item.id}/returned`);
      onUpdate?.();
    } catch (err) {
      alert('Failed to mark as returned: ' + (err.response?.data || err.message));
    }
  };

  const deleteItem = async () => {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    try {
      await axios.delete(`http://localhost:8080/api/items/${item.id}`);
      onUpdate?.();
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data || err.message));
    }
  };

  const handleMessage = () => {
    const rid = item?.postedBy?.id;
    if (!rid) {
      alert('Cannot find poster info. Try refreshing.');
      return;
    }
    navigate(`/messages/${rid}`, {
      state: { receiverName: item?.postedBy?.name || 'User' }
    });
  };

  const statusConfig = {
    LOST: {
      bg: 'rgba(248,113,113,0.15)',
      color: '#f87171',
      border: 'rgba(248,113,113,0.3)',
      icon: '🔴',
    },
    FOUND: {
      bg: 'rgba(74,222,128,0.15)',
      color: '#4ade80',
      border: 'rgba(74,222,128,0.3)',
      icon: '🟢',
    },
    RETURNED: {
      bg: 'rgba(34,211,238,0.15)',
      color: '#22d3ee',
      border: 'rgba(34,211,238,0.3)',
      icon: '✅',
    },
  };

  const sc = statusConfig[item?.status] || statusConfig.LOST;

  const avatarLetter = item?.postedBy?.name?.[0]?.toUpperCase() || '?';

  return (
    <div
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.5)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
    >
      {/* Top row — title + status badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <h3 style={{
          fontSize: '16px',
          fontFamily: 'Sora',
          fontWeight: 600,
          lineHeight: 1.3,
          flex: 1,
        }}>
          {item?.title || 'Untitled'}
        </h3>
        <span style={{
          padding: '4px 10px',
          borderRadius: '999px',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
          background: sc.bg,
          color: sc.color,
          border: `1px solid ${sc.border}`,
        }}>
          {sc.icon} {item?.status}
        </span>
      </div>

      {/* Description */}
      <p style={{
        color: 'var(--muted)',
        fontSize: '13px',
        lineHeight: 1.6,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {item?.description || 'No description provided.'}
      </p>

      {/* Location + Category */}
      <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--muted)', flexWrap: 'wrap' }}>
        {item?.location && (
          <span>📍 {item.location}</span>
        )}
        {item?.category && (
          <span>🏷️ {item.category}</span>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--border)' }} />

      {/* Poster info row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

        {/* Avatar */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'var(--accent)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          fontWeight: 700,
          color: '#0d0f14',
          flexShrink: 0,
        }}>
          {avatarLetter}
        </div>

        {/* Name + time */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
            {item?.postedBy?.name || 'Unknown user'}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
            {timeAgo(item?.postedAt)}
          </div>
        </div>

        {/* Message button — only show if logged in and NOT your own post */}
        {user && !isOwner && item?.postedBy?.id && (
          <button
            onClick={handleMessage}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'rgba(34,211,238,0.1)',
              color: '#22d3ee',
              border: '1px solid rgba(34,211,238,0.25)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(34,211,238,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(34,211,238,0.1)'}
          >
            💬 Message
          </button>
        )}
      </div>

      {/* Owner actions — only show if this is YOUR post */}
      {isOwner && (
        <div style={{ display: 'flex', gap: '8px' }}>
          {item?.status !== 'RETURNED' && (
            <button
              onClick={markReturned}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                background: 'rgba(74,222,128,0.1)',
                color: '#4ade80',
                border: '1px solid rgba(74,222,128,0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(74,222,128,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(74,222,128,0.1)'}
            >
              ✅ Mark as Returned
            </button>
          )}

          {item?.status === 'RETURNED' && (
            <div style={{
              flex: 1,
              padding: '9px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              background: 'rgba(34,211,238,0.1)',
              color: '#22d3ee',
              border: '1px solid rgba(34,211,238,0.3)',
              textAlign: 'center',
            }}>
              ✅ Item returned to owner
            </div>
          )}

          <button
            onClick={deleteItem}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              background: 'rgba(248,113,113,0.1)',
              color: '#f87171',
              border: '1px solid rgba(248,113,113,0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
            title="Delete this item"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}