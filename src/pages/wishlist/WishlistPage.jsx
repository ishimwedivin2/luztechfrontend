import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Package } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import styles from './Wishlist.module.css';

const WishlistPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        if (!user) return;
        try {
            const res = await api.get('/wishlist');
            if (res.success) {
                setItems(res.data || []);
            }
        } catch (e) {
            console.error('Error fetching wishlist', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchWishlist();
    }, [user, navigate]);

    const handleRemove = async (productId) => {
        try {
            const res = await api.delete(`/wishlist/${productId}`);
            if (res.success) {
                setItems(items.filter(item => item.product.id !== productId));
            }
        } catch (e) {
            alert('Failed to remove item');
        }
    };

    if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading your wishlist...</div>;

    return (
        <div className={`${styles.wishlistPage} container`}>
            <div className={styles.pageHeader}>
                <h1><Heart size={32} fill="#ef4444" color="#ef4444" /> My Wishlist</h1>
                <p>{items.length} items saved</p>
            </div>

            {items.length === 0 ? (
                <div className={styles.emptyWishlist}>
                    <Heart size={64} opacity={0.2} />
                    <h3>Your wishlist is empty</h3>
                    <p>Save items you like to keep track of them and buy them later.</p>
                    <button className="btn-primary" onClick={() => navigate('/store')}>
                        Go Shopping <ArrowRight size={18} />
                    </button>
                </div>
            ) : (
                <div className={styles.wishlistGrid}>
                    {items.map(item => (
                        <div key={item.id} className={styles.productCard}>
                            <button 
                                className={styles.removeBtn} 
                                onClick={() => handleRemove(item.product.id)}
                                title="Remove from wishlist"
                            >
                                <Trash2 size={16} />
                            </button>
                            
                            <div className={styles.imageWrapper} onClick={() => navigate(`/product/${item.product.id}`)}>
                                {item.product.images?.[0] ? (
                                    <img src={`http://localhost:8080${item.product.images[0].url ? item.product.images[0].url : item.product.images[0]}`} alt={item.product.name} />
                                ) : (
                                    <Package size={48} opacity={0.2} />
                                )}
                            </div>

                            <div className={styles.productInfo}>
                                <span className={styles.category}>{item.product.categoryName || 'Category'}</span>
                                <h3>{item.product.name}</h3>
                                
                                <div className={styles.priceRow}>
                                    <span className={styles.price}>${item.product.price?.toFixed(2)}</span>
                                    <button className={styles.addToCartBtn} onClick={() => navigate(`/product/${item.product.id}`)}>
                                        Details <ShoppingCart size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;
