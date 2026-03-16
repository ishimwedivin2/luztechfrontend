import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ChevronRight, Eye, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Orders.module.css';

const OrdersPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchOrders = async () => {
            try {
                const response = await api.get(`/orders/customer/${user.id}`);
                if (response.success) {
                    setOrders(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching orders', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

    if (!user) { navigate('/login'); return null; }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'DELIVERED': return <CheckCircle size={16} />;
            case 'CANCELLED': return <XCircle size={16} />;
            case 'SHIPPED': return <Truck size={16} />;
            default: return <Clock size={16} />;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'DELIVERED': return styles.statusDelivered;
            case 'CANCELLED': return styles.statusCancelled;
            case 'SHIPPED': return styles.statusShipped;
            default: return styles.statusPending;
        }
    };

    return (
        <div className={`${styles.ordersPage} container`}>
            <div className={styles.breadcrumbs}>
                <span onClick={() => navigate('/')}>Home</span>
                <ChevronRight size={14} />
                <span className={styles.activeBreadcrumb}>My Orders</span>
            </div>

            <h1 className={styles.pageTitle}><Package size={28} /> My Orders</h1>

            {loading ? (
                <div className={styles.loader}><div className={styles.spinner}></div><p>Loading orders...</p></div>
            ) : orders.length > 0 ? (
                <div className={styles.ordersList}>
                    {orders.map(order => (
                        <div key={order.id} className={styles.orderCard}>
                            <div className={styles.orderHeader}>
                                <div>
                                    <span className={styles.orderId}>Order #{order.id?.substring(0, 8)}...</span>
                                    <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <span className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                                    {getStatusIcon(order.status)} {order.status}
                                </span>
                            </div>
                            <div className={styles.orderItems}>
                                {order.orderItems?.map((item, idx) => (
                                    <div key={idx} className={styles.orderItem}>
                                        <span className={styles.itemName}>{item.product?.name || `Product`}</span>
                                        <span className={styles.itemQty}>x{item.quantity}</span>
                                        <span className={styles.itemPrice}>${item.unitPrice?.toFixed(2)}</span>
                                    </div>
                                )) || <p className={styles.noItems}>Order details loading...</p>}
                            </div>
                            <div className={styles.orderFooter}>
                                <span className={styles.orderTotal}>Total: <strong>${order.totalAmount?.toFixed(2) || '—'}</strong></span>
                                <button className={styles.viewBtn} onClick={() => navigate(`/orders/${order.id}`)}>
                                    <Eye size={16} /> View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className={styles.emptyOrders}>
                    <Package size={64} className={styles.emptyIcon} />
                    <h2>No Orders Yet</h2>
                    <p>You haven't placed any orders yet. Start shopping to see your orders here.</p>
                    <button onClick={() => navigate('/store')} className="btn-primary">Browse Store</button>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
