import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Package, HelpCircle, Info, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Client } from '@stomp/stompjs';
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
    const stompClientRef = useRef(null);

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
        if (!user) return;

        // Fetch initial set of notifications
        fetchNotifications();

        const client = new Client({
            webSocketFactory: () => new WebSocket('ws://localhost:8080/ws'),
            reconnectDelay: 5000,
            onConnect: () => {
                console.log('Connected to WebSocket');
                
                // Subscribe to user-specific notifications
                client.subscribe('/user/topic/notifications', (message) => {
                    const newNotification = JSON.parse(message.body);
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);
                    
                    // Show a browser notification or toast here if desired
                });
            },
            onStompError: (frame) => {
                console.error('STOMP error', frame);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
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
        else if (item.relatedId) navigate(item.relatedId); // Fallback to raw link
    };

    const getIcon = (type) => {
        switch (type) {
            case 'ORDER': return <Package size={18} color="#3b82f6" />;
            case 'SUPPORT': return <HelpCircle size={18} color="#f59e0b" />;
            case 'SYSTEM': return <Info size={18} color="#6b7280" />;
            default: return <Bell size={18} color="#10b981" />;
        }
    };

    return (
        <div className={styles.notificationCenter} ref={dropdownRef}>
            <button 
                className={`${styles.notificationBtn} ${isOpen ? styles.active : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <div className={styles.bellIconWrapper}>
                    <Bell size={24} />
                    {unreadCount > 0 && <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>}
                </div>
                <span>Notifications</span>
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    {!user ? (
                        <div className={styles.loginPrompt}>
                            <Bell size={40} className={styles.promptIcon} />
                            <h3>Stay Updated</h3>
                            <p>Sign in to view notifications about your orders, support tickets, and account activity.</p>
                            <button className="btn-primary" style={{ width: '100%', padding: '0.6rem 1rem', fontSize: '0.9rem', marginTop: '0.5rem' }} onClick={() => { setIsOpen(false); navigate('/login'); }}>
                                Sign In
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className={styles.header}>
                                <div className={styles.headerTop}>
                                    <h3>Latest Notifications</h3>
                                    <button className={styles.closeBtn} onClick={() => setIsOpen(false)}><X size={18} /></button>
                                </div>
                                <div className={styles.headerBottom}>
                                    <span className={styles.countText}>{unreadCount} unread message{unreadCount !== 1 ? 's' : ''}</span>
                                    {unreadCount > 0 && (
                                        <button className={styles.markAllBtn} onClick={handleMarkAllAsRead}>
                                            Mark all as read
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className={styles.notificationList}>
                                {notifications.length > 0 ? (
                                    notifications.map(item => (
                                        <div 
                                            key={item.id} 
                                            className={`${styles.notificationItem} ${!item.read ? styles.unread : ''}`}
                                            onClick={() => handleNotificationClick(item)}
                                        >
                                            <div className={`${styles.iconWrapper} ${styles[item.type?.toLowerCase() || 'default']}`}>
                                                {getIcon(item.type)}
                                            </div>
                                            <div className={styles.content}>
                                                <div className={styles.titleRow}>
                                                    <span className={styles.title}>{item.title}</span>
                                                    <span className={styles.time}>{formatTime(item.createdAt)}</span>
                                                </div>
                                                <div className={styles.message}>{item.message}</div>
                                                <div className={styles.actionPrompt}>
                                                    View details <ChevronRight size={12} />
                                                </div>
                                            </div>
                                            {!item.read && <div className={styles.unreadDot} />}
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}><Bell size={48} /></div>
                                        <p>You're all caught up!</p>
                                        <span>When you receive notifications, they'll appear here.</span>
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className={styles.footer}>
                                    <button onClick={() => { navigate('/profile?tab=notifications'); setIsOpen(false); }}>
                                        View all notifications
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 30) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

export default NotificationCenter;

