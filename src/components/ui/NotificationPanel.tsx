import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { NotificationItem } from '@/types';
import { dataService } from '@/services/dataService';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  notifications,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    dataService.markAllNotificationsAsRead();
  };

  const handleItemClick = (item: NotificationItem) => {
    dataService.markNotificationAsRead(item.id);
    if (item.link) {
      navigate(item.link);
      onClose();
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'warning':
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-botanical-amber" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-botanical-green" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-forest" />;
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#FBF9F4] border border-border rounded-2xl shadow-warm-lg z-50 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-porcelain/60">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-forest" />
          <h4 className="font-serif text-lg font-semibold text-forest">Notifications</h4>
          <span className="text-xs bg-sage px-2 py-0.5 rounded-full text-forest font-medium">
            {notifications.filter(n => !n.read).length} new
          </span>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="text-xs text-ink-muted hover:text-forest flex items-center gap-1 transition-colors"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-ink-muted text-sm">
            No notifications at this time
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-3.5 hover:bg-porcelain/50 cursor-pointer transition-colors flex gap-3 ${
                !item.read ? 'bg-sage/10' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-ink truncate">{item.title}</p>
                  <span className="text-[10px] text-ink-muted shrink-0">{item.timestamp}</span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{item.message}</p>
              </div>
              {!item.read && (
                <div className="w-1.5 h-1.5 rounded-full bg-botanical-amber shrink-0 mt-1.5" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 text-center border-t border-border bg-porcelain/40">
        <span className="text-[11px] text-ink-muted">Aurelia Academic Communications</span>
      </div>
    </div>
  );
};
