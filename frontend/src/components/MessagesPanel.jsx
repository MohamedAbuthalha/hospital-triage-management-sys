import { useState, useEffect } from 'react';
import { getMyMessages, markMessagesRead } from '../api/features';
import { useAuth } from '../auth/AuthContext';
import Icon from './Icon';

const MessagesPanel = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id || user?.id) {
      const uid = user._id || user.id;
      getMyMessages(uid)
        .then((res) => { if (res.success) setMessages(res.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
      markMessagesRead().catch(() => {});
    }
  }, [user]);

  if (loading) return <div className="msgs-loading">Loading messages...</div>;

  return (
    <div className="msgs-panel">
      <h3 className="msgs-title">
        <Icon name="messages" size="md" color="secondary" /> Messages
        {messages.length > 0 && <span className="msgs-badge">{messages.length}</span>}
      </h3>
      {messages.length === 0 ? (
        <p className="msgs-empty">No messages yet.</p>
      ) : (
        <ul className="msgs-list">
          {messages.map((m) => (
            <li key={m._id} className="msgs-item">
              <div className="msgs-sender">
                <span className="msgs-role-badge">{m.senderId?.role || 'Admin'}</span>
                <strong>{m.senderId?.name || 'Admin'}</strong>
              </div>
              <p className="msgs-text">{m.message}</p>
              <span className="msgs-time">{new Date(m.createdAt).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
      <style>{`
        .msgs-panel { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,.08); margin-bottom: 24px; }
        .msgs-title { display: flex; align-items: center; gap: 8px; font-size: 1.1rem; font-weight: 700; color: #1e293b; margin: 0 0 16px; }
        .msgs-badge { background: #ef4444; color: #fff; font-size: .7rem; padding: 2px 7px; border-radius: 99px; }
        .msgs-empty { color: #94a3b8; font-size: .9rem; }
        .msgs-loading { color: #94a3b8; padding: 12px; }
        .msgs-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .msgs-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
        .msgs-sender { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
        .msgs-role-badge { background: #dbeafe; color: #1d4ed8; font-size: .7rem; padding: 2px 7px; border-radius: 99px; font-weight: 600; text-transform: capitalize; }
        .msgs-text { color: #334155; font-size: .92rem; margin: 4px 0; }
        .msgs-time { color: #94a3b8; font-size: .78rem; }
      `}</style>
    </div>
  );
};

export default MessagesPanel;
