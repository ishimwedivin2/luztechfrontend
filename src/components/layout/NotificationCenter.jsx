import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, HelpCircle, Info, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './NotificationCenter.module.css';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user } = useAuth();
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const [notifRes, countRes] = await Promise.all([
                api.get('/notifications'),
                api.get('/notifications/unread-count')
            ]);
            if (notifRes.success) setNotifications(notifRes.data || []);
            if (countRes.success) setUnreadCount(countRes.data || 0);
        } catch (e) { console.error('Error fetching notifications', e); }
    };

    useEffect(() => {
        fetchNotifications();
        // Set up interval for polling (could also use WebSocket here)
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user]);

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (e) { console.error(e); }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (e) { console.error(e); }
    };

    const handleNotificationClick = (item) => {
        if (!item.read) handleMarkAsRead(item.id);
        setIsOpen(false);

        // Redirect based on type
        if (item.type === 'ORDER') navigate(`/orders/${item.relatedId}`);
        else if (item.type === 'SUPPORT') navigate(`/support/tickets/${item.relatedId}`);
    };

    const getIcon = (type) => {
        switch (type) {
            case 'ORDER': return <Package size={18} color="#3b82f6" />;
            case 'SUPPORT': return <HelpCircle size={18} color="#f59e0b" />;
            case 'SYSTEM': return <Info size={18} color="#6b7280" />;
            default: return <Bell size={18} color="#10b981" />;
        }
    };

    if (!user) return null;

    return (
        <div className={styles.notificationCenter} ref={dropdownRef}>
            <button className={styles.notificationBtn} onClick={() => setIsOpen(!isOpen)}>
                <Bell size={24} />
                {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className={styles.markAllBtn} onClick={handleMarkAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className={styles.notificationList}>
                        {notifications.length > 0 ? (
                            notifications.map(item => (
                                <div 
                                    key={item.id} 
                                    className={`${styles.notificationItem} ${!item.read ? styles.unread : ''}`}
                                    onClick={() => handleNotificationClick(item)}
                                >
                                    <div className={styles.iconWrapper}>
                                        {getIcon(item.type)}
                                    </div>
                                    <div className={styles.content}>
                                        <div className={styles.title}>{item.title}</div>
                                        <div className={styles.message}>{item.message}</div>
                                        <div className={styles.time}>
                                            {formatTime(item.createdAt)}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className={styles.emptyState}>
                                <Bell size={48} opacity={0.2} />
                                <p>No notifications yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
};

export default NotificationCenter;
