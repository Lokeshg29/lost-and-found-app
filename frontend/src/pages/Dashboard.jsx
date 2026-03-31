import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ItemCard from '../components/ItemCard';
import axios from 'axios';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const loadItems = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/items');
      setItems(res.data);
    } catch (err) {
      console.error('Failed to load items', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filtered = items.filter(item => {
    const matchesFilter = filter === 'ALL' || item.status === filter;
    const matchesSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.description?.toLowerCase().includes(search.toLowerCase()) ||
      item.location?.toLowerCase().includes(search.toLowerCase()) ||
      item.category?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const lost = items.filter(i => i.status === 'LOST').length;
  const found = items.filter(i => i.status === 'FOUND').length;
  const returned = items.filter(i => i.status === 'RETURNED').length;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>

      {/* Welcome banner */}
      {user && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(74,222,128,0.1), rgba(34,211,238,0.08))',
          border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: '14px',
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div>
            <h2 style={{ fontFamily: 'Sora', fontSize: '20px', marginBottom: '4px' }}>
              Welcome back, {user.name} 👋
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
              Help your university community recover lost items
            </p>
          </div>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '11px 24px' }}
            onClick={() => navigate('/add-item')}
          >
            + Report Item
          </button>
        </div>
      )}

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {[
          { label: 'Total Items', value: items.length, icon: '📦', color: 'var(--text)' },
          { label: 'Lost', value: lost, icon: '🔴', color: '#f87171' },
          { label: 'Found', value: found, icon: '🟢', color: '#4ade80' },
          { label: 'Returned', value: returned, icon: '✅', color: '#22d3ee' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
            <div style={{ fontSize: '24px', marginBottom: '6px' }}>{s.icon}</div>
            <div style={{
              fontSize: '32px',
              fontFamily: 'Sora',
              fontWeight: 700,
              color: s.color,
              lineHeight: 1,
              marginBottom: '4px',
            }}>
              {s.value}
            </div>
            <div style={{ color: 'var(--muted)', fontSize: '12px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="🔍  Search by title, location, category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ fontSize: '14px' }}
        />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'ALL', label: 'All Items' },
          { key: 'LOST', label: '🔴 Lost' },
          { key: 'FOUND', label: '🟢 Found' },
          { key: 'RETURNED', label: '✅ Returned' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              background: filter === f.key ? 'var(--accent)' : 'var(--surface2)',
              color: filter === f.key ? '#0d0f14' : 'var(--muted)',
              border: filter === f.key ? 'none' : '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {f.label}
          </button>
        ))}

        {/* My posts filter */}
        {user && (
          <button
            onClick={() => setFilter('MINE')}
            style={{
              padding: '8px 18px',
              borderRadius: '999px',
              fontSize: '13px',
              fontWeight: 600,
              background: filter === 'MINE' ? '#a78bfa' : 'var(--surface2)',
              color: filter === 'MINE' ? '#0d0f14' : 'var(--muted)',
              border: filter === 'MINE' ? 'none' : '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginLeft: 'auto',
            }}
          >
            👤 My Posts
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '16px' }}>
          Showing {filter === 'MINE'
            ? items.filter(i => i.postedBy?.id === user?.id).length
            : filtered.length} item{filtered.length !== 1 ? 's' : ''}
          {search && ` for "${search}"`}
        </p>
      )}

      {/* Items grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>⏳</div>
          <p style={{ color: 'var(--muted)' }}>Loading items...</p>
        </div>
      ) : (filter === 'MINE'
          ? items.filter(i => i.postedBy?.id === user?.id)
          : filtered
        ).length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 0',
          background: 'var(--surface)',
          borderRadius: '14px',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontFamily: 'Sora', marginBottom: '8px' }}>No items found</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px' }}>
            {search ? `No results for "${search}"` : 'Be the first to report an item!'}
          </p>
          <button
            className="btn-primary"
            style={{ width: 'auto', padding: '11px 24px', margin: '0 auto', display: 'block' }}
            onClick={() => navigate('/add-item')}
          >
            + Report Item
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {(filter === 'MINE'
            ? items.filter(i => i.postedBy?.id === user?.id)
            : filtered
          ).map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onUpdate={loadItems}
            />
          ))}
        </div>
      )}
    </div>
  );
}