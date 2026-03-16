import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { LifeBuoy, MessageSquare, PlusCircle, Clock, CheckCircle, Send, AlertTriangle, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Support.module.css';

const SupportPage = () => {
    return (
        <div className={`${styles.supportContainer} container`}>
            <aside className={styles.supportSidebar}>
                <div className={styles.sidebarHeader}>
                    <LifeBuoy size={24} />
                    <h2>Help Center</h2>
                </div>
                <nav className={styles.supportNav}>
                    <Link to="/support" className={styles.navLink}>
                        <MessageSquare size={18} /> My Tickets
                    </Link>
                    <Link to="/support/new" className={styles.navLink}>
                        <PlusCircle size={18} /> New Ticket
                    </Link>
                    <div className={styles.sidebarDivider}></div>
                    <div className={styles.quickContact}>
                        <h4>Need immediate help?</h4>
                        <p>support@luztech.com</p>
                        <p>+250 123 456 789</p>
                    </div>
                </nav>
            </aside>

            <main className={styles.supportMain}>
                <Routes>
                    <Route path="/" element={<TicketList />} />
                    <Route path="/new" element={<CreateTicket />} />
                    <Route path="/ticket/:id" element={<TicketDetail />} />
                </Routes>
            </main>
        </div>
    );
};

const TicketList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const fetchTickets = async () => {
            try {
                const response = await api.get('/support/tickets/my');
                if (response.success) {
                    setTickets(response.data);
                }
            } catch (error) {
                console.error('Error fetching tickets', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [user]);

    return (
        <div className={styles.fadeContent}>
            <div className={styles.pageHeader}>
                <h1>Support Tickets</h1>
                <Link to="/support/new" className="btn-primary">
                    <PlusCircle size={18} /> New Support Ticket
                </Link>
            </div>

            {loading ? (
                <div className={styles.loading}>Loading tickets...</div>
            ) : tickets.length > 0 ? (
                <div className={styles.ticketGrid}>
                    {tickets.map(ticket => (
                        <div key={ticket.id} className={styles.ticketCard} onClick={() => navigate(`/support/ticket/${ticket.id}`)}>
                            <div className={styles.ticketStatus}>
                                {ticket.status === 'CLOSED' ? (
                                    <span className={styles.statusClosed}><CheckCircle size={14} /> Closed</span>
                                ) : (
                                    <span className={styles.statusOpen}><Clock size={14} /> {ticket.status}</span>
                                )}
                                <span className={styles.ticketPriority}>{ticket.priority}</span>
                            </div>
                            <h3>{ticket.title}</h3>
                            <p>{ticket.description.substring(0, 100)}...</p>
                            <div className={styles.ticketFooter}>
                                <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                                <span className={styles.viewMore}>View Thread <Send size={14} /></span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptySupport}>
                    <MessageSquare size={64} opacity={0.2} />
                    <h3>No active support tickets</h3>
                    <p>Our team is here to help you with any technical issues or inquiries.</p>
                </div>
            )}
        </div>
    );
};

const CreateTicket = () => {
    const [formData, setFormData] = useState({ title: '', description: '', priority: 'MEDIUM' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/support/tickets', formData);
            if (response.success) {
                navigate('/support');
            }
        } catch (error) {
            alert('Error creating ticket: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.fadeContent}>
            <div className={styles.pageHeader}>
                <h1>Create New Ticket</h1>
            </div>
            <form className={styles.supportForm} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label>Subject / Title</label>
                    <input
                        type="text"
                        placeholder="What do you need help with?"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Priority</label>
                    <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                        <option value="LOW">Low - General Inquiry</option>
                        <option value="MEDIUM">Medium - Technical Issue</option>
                        <option value="HIGH">High - Urgent Problem</option>
                        <option value="CRITICAL">Critical - System Offline</option>
                    </select>
                </div>
                <div className={styles.formGroup}>
                    <label>Detailed Description</label>
                    <textarea
                        rows="6"
                        placeholder="Please provide as much detail as possible..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                    ></textarea>
                </div>
                <div className={styles.formActions}>
                    <button type="button" onClick={() => navigate('/support')} className={styles.cancelBtn}>Cancel</button>
                    <button type="submit" className="btn-primary" disabled={isLoading}>
                        {isLoading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </div>
            </form>
        </div>
    );
};

const TicketDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [survey, setSurvey] = useState({ rating: 5, feedback: '' });
    const msgEndRef = useRef(null);

    const fetchDetails = async () => {
        try {
            // Note: Updated API calls based on backend routes
            const [ticketRes, msgRes] = await Promise.all([
                api.get(`/support/tickets/${id}`),
                api.get(`/support/tickets/${id}/messages`)
            ]);

            setTicket(ticketRes.data || ticketRes);
            setMessages(msgRes.data || msgRes);
        } catch (error) {
            console.error('Error fetching ticket details', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
        const interval = setInterval(fetchDetails, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [id]);

    useEffect(() => {
        msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const response = await api.post(`/support/tickets/${id}/messages`, { message: newMessage });
            if (response.success) {
                setMessages([...messages, response.data]);
                setNewMessage('');
            }
        } catch (error) {
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const handleSurveySubmit = async () => {
        try {
            await api.post(`/support/tickets/${id}/survey`, survey);
            alert('Thank you for your feedback!');
            setTicket({ ...ticket, surveySubmitted: true });
        } catch (e) { alert('Error submitting survey'); }
    };

    if (loading) return <div className={styles.loading}>Loading conversation...</div>;
    if (!ticket) return <div className={styles.loading}>Ticket not found.</div>;

    const isClosed = ticket.status === 'CLOSED';

    return (
        <div className={styles.fadeContent}>
            <div className={styles.threadContainer}>
                <header className={styles.threadHeader}>
                    <div>
                        <h2>{ticket.title}</h2>
                        <div className={styles.ticketMeta}>
                            <span><Clock size={14} /> ID: {ticket.id?.substring(0, 8)}</span>
                            <span><AlertTriangle size={14} /> {ticket.priority}</span>
                        </div>
                    </div>
                    <div className={styles.threadStatus}>
                        {isClosed ? (
                            <span className={styles.statusClosed}><CheckCircle size={14} /> RESOLVED</span>
                        ) : (
                            <div className="d-flex align-items-center gap-2">
                                <span className={styles.statusOpen}><Clock size={14} /> {ticket.status}</span>
                                <button className="btn-sm btn-outline-danger" onClick={async () => {
                                    if(window.confirm('Mark this ticket as resolved?')) {
                                        await api.patch(`/support/tickets/${id}/close`);
                                        fetchDetails();
                                    }
                                }}>Mark Resolved</button>
                            </div>
                        )}
                    </div>
                </header>

                <div className={styles.msgContainer}>
                    {/* Initial Description */}
                    <div className={`${styles.msgBubble} ${styles.otherMsg}`}>
                        <span className={styles.msgAuthor}>System / Initial Request</span>
                        <p>{ticket.description}</p>
                        <span className={styles.msgTime}>{new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>

                    {messages.map((msg, idx) => (
                        <div key={idx} className={`${styles.msgBubble} ${msg.sender?.id === user?.id ? styles.myMsg : styles.otherMsg}`}>
                            <span className={styles.msgAuthor}>
                                {msg.sender?.id === user?.id ? 'You' : (msg.sender?.roles?.[0]?.replace('ROLE_', '') || 'Support Agent')}
                            </span>
                            <p>{msg.message}</p>
                            <span className={styles.msgTime}>{new Date(msg.createdAt).toLocaleTimeString()}</span>
                        </div>
                    ))}
                    <div ref={msgEndRef} />
                </div>

                <div className={styles.chatInputArea}>
                    {isClosed ? (
                        <div className={styles.closedNotice}>
                            This ticket has been closed. If you still need help, please open a new ticket.
                        </div>
                    ) : (
                        <form className={styles.inputWrapper} onSubmit={handleSendMessage}>
                            <textarea
                                placeholder="Type your message here..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(e)}
                            />
                            <button type="submit" className={styles.sendBtn} disabled={sending || !newMessage.trim()}>
                                <Send size={20} />
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {isClosed && !ticket.surveySubmitted && (
                <div className={`${styles.surveyPrompt} mt-4`}>
                    <h3>How was your experience?</h3>
                    <p>Please rate our support to help us improve.</p>
                    <div className={styles.surveyStars}>
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                size={32}
                                className={styles.star}
                                fill={survey.rating >= star ? "#fbbf24" : "none"}
                                stroke={survey.rating >= star ? "#fbbf24" : "#cbd5e1"}
                                onClick={() => setSurvey({ ...survey, rating: star })}
                            />
                        ))}
                    </div>
                    <textarea
                        className="form-control mb-3"
                        placeholder="Additional feedback (optional)..."
                        value={survey.feedback}
                        onChange={(e) => setSurvey({ ...survey, feedback: e.target.value })}
                        style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                    <button className="btn-primary" onClick={handleSurveySubmit}>Submit Feedback</button>
                </div>
            )}
        </div>
    );
};

export default SupportPage;
