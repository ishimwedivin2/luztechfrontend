import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Shield, Truck, RefreshCw, ChevronLeft, ChevronRight, Star, Check, Minus, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import styles from './ProductDetail.module.css';

const ProductDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [isInWishlist, setIsInWishlist] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await api.get(`/products/${id}`);
                if (response.success) {
                    setProduct(response.data);
                }
            } catch (error) {
                console.error('Error fetching product', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();

        const checkWishlist = async () => {
            if (!user) return;
            try {
                const res = await api.get(`/wishlist/check/${id}`);
                if (res.success) setIsInWishlist(res.data);
            } catch (e) { console.error(e); }
        };
        checkWishlist();
    }, [id, user]);

    const toggleWishlist = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        try {
            if (isInWishlist) {
                await api.delete(`/wishlist/${id}`);
                setIsInWishlist(false);
            } else {
                await api.post(`/wishlist/${id}`);
                setIsInWishlist(true);
            }
        } catch (e) { console.error(e); }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await api.post(`/reviews/product/${id}`, reviewForm);
            if (res.success) {
                // Refresh product data to see new review
                const prodRes = await api.get(`/products/${id}`);
                if (prodRes.success) setProduct(prodRes.data);
                setReviewForm({ rating: 5, comment: '' });
                alert('Review submitted successfully!');
            }
        } catch (error) {
            alert('Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
    };

    const renderStars = (rating) => {
        const stars = [];
        const numRating = parseFloat(rating) || 0;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={18}
                    fill={i <= numRating ? '#f59e0b' : 'none'}
                    color={i <= numRating ? '#f59e0b' : '#d1d5db'}
                />
            );
        }
        return stars;
    };

    if (loading) return (
        <div className={`${styles.detailPage} container`}>
            <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading product details...</p>
            </div>
        </div>
    );

    if (!product) return (
        <div className={`${styles.detailPage} container`}>
            <div className={styles.errorState}>
                <h2>Product not found</h2>
                <p>The product you are looking for does not exist or has been removed.</p>
                <button onClick={() => navigate('/store')} className="btn-primary">Back to Store</button>
            </div>
        </div>
    );

    return (
        <div className={`${styles.detailPage} container`}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
                <span onClick={() => navigate('/')}>Home</span>
                <ChevronRight size={14} />
                <span onClick={() => navigate('/store')}>Store</span>
                <ChevronRight size={14} />
                {product.categoryName && (
                    <>
                        <span onClick={() => navigate(`/store?category=${product.categoryName}`)}>{product.categoryName}</span>
                        <ChevronRight size={14} />
                    </>
                )}
                <span className={styles.activeBreadcrumb}>{product.name}</span>
            </div>

            <div className={styles.productLayout}>
                {/* Image Gallery */}
                <div className={styles.gallery}>
                    <div className={styles.mainImage}>
                        {product.images?.[activeImage] ? (
                            <img src={`http://localhost:8080${product.images[activeImage].url ? product.images[activeImage].url : product.images[activeImage]}`} alt={product.name} />
                        ) : (
                            <div className={styles.placeholderImage}>
                                <ShoppingCart size={64} />
                            </div>
                        )}
                        {product.discount && (
                            <span className={styles.discountBadge}>-{product.discount.percentage}% OFF</span>
                        )}
                    </div>
                    {product.images?.length > 1 && (
                        <div className={styles.thumbnails}>
                            {product.images.map((img, idx) => (
                                <div
                                    key={idx}
                                    className={`${styles.thumbnail} ${activeImage === idx ? styles.activeThumb : ''}`}
                                    onClick={() => setActiveImage(idx)}
                                >
                                    <img src={`http://localhost:8080${img.url ? img.url : img}`} alt="" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className={styles.info}>
                    <div className={styles.infoHead}>
                        <p className={styles.categoryTag}>{product.categoryName ? product.categoryName.toUpperCase() : 'GENERAL'}</p>
                        <h1>{product.name}</h1>
                        <p className={styles.sku}>SKU: {product.sku}</p>
                    </div>

                    {/* Rating */}
                    <div className={styles.ratingSection}>
                        <div className={styles.stars}>{renderStars(product.averageRating)}</div>
                        <span className={styles.ratingText}>
                            {product.averageRating || '0'} ({product.reviews?.length || 0} reviews)
                        </span>
                    </div>

                    {/* Price */}
                    <div className={styles.priceSection}>
                        <span className={styles.price}>${product.price?.toFixed(2)}</span>
                        {product.discount && (
                            <span className={styles.oldPrice}>
                                ${(product.price / (1 - product.discount.percentage / 100)).toFixed(2)}
                            </span>
                        )}
                        <span className={styles.taxInfo}>Including VAT</span>
                    </div>

                    {/* Stock Status */}
                    <div className={styles.stockBadge}>
                        <Check size={16} />
                        <span>{product.status === 'ACTIVE' ? 'In Stock — Ready to Ship' : 'Currently Unavailable'}</span>
                    </div>

                    {/* Description Preview */}
                    <p className={styles.descriptionPreview}>{product.description}</p>

                    {/* Add to Cart */}
                    <div className={styles.actions}>
                        <div className={styles.quantitySelector}>
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className={styles.qtyBtn}>
                                <Minus size={16} />
                            </button>
                            <span className={styles.qtyValue}>{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className={styles.qtyBtn}>
                                <Plus size={16} />
                            </button>
                        </div>
                        <button
                            className={`btn-primary ${styles.addToCartBtn} ${addedToCart ? styles.addedBtn : ''}`}
                            onClick={handleAddToCart}
                            disabled={product.status !== 'ACTIVE'}
                        >
                            {addedToCart ? (
                                <><Check size={20} /> Added to Cart!</>
                            ) : (
                                <><ShoppingCart size={20} /> Add to Cart</>
                            )}
                        </button>
                        <button 
                            className={`${styles.wishlistBtn} ${isInWishlist ? styles.wishlistBtnActive : ''}`}
                            onClick={toggleWishlist}
                            title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
                        >
                            <Heart size={22} fill={isInWishlist ? "#ef4444" : "none"} />
                        </button>
                    </div>

                    {/* Guarantees */}
                    <div className={styles.guarantees}>
                        <div className={styles.guarantee}>
                            <Truck size={20} />
                            <div>
                                <strong>Fast Shipping</strong>
                                <span>Worldwide delivery</span>
                            </div>
                        </div>
                        <div className={styles.guarantee}>
                            <Shield size={20} />
                            <div>
                                <strong>2 Year Warranty</strong>
                                <span>Full manufacturer coverage</span>
                            </div>
                        </div>
                        <div className={styles.guarantee}>
                            <RefreshCw size={20} />
                            <div>
                                <strong>30-Day Returns</strong>
                                <span>Hassle-free policy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <section className={styles.tabsSection}>
                <div className={styles.tabHeaders}>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'description' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('description')}
                    >
                        Description
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'specs' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('specs')}
                    >
                        Specifications
                    </button>
                    <button
                        className={`${styles.tabBtn} ${activeTab === 'reviews' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Reviews ({product.reviews?.length || 0})
                    </button>
                </div>

                <div className={styles.tabContent}>
                    {activeTab === 'description' && (
                        <div className={styles.descriptionTab}>
                            <p>{product.description || 'No description available for this product.'}</p>
                        </div>
                    )}
                    {activeTab === 'specs' && (
                        <div className={styles.specsTab}>
                            <div className={styles.specsGrid}>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>Category</span>
                                    <span className={styles.specValue}>{product.categoryName || 'General'}</span>
                                </div>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>SKU</span>
                                    <span className={styles.specValue}>{product.sku}</span>
                                </div>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>Status</span>
                                    <span className={styles.specValue}>{product.status}</span>
                                </div>
                                <div className={styles.specItem}>
                                    <span className={styles.specLabel}>Rating</span>
                                    <span className={styles.specValue}>{product.averageRating || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'reviews' && (
                        <div className={styles.reviewsTab}>
                            {user && (
                                <div className={styles.addReviewForm}>
                                    <h3>Write a Review</h3>
                                    <form onSubmit={handleReviewSubmit}>
                                        <div className={styles.ratingInput}>
                                            <label>Your Rating:</label>
                                            <div className={styles.starRating}>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={24}
                                                        fill={star <= reviewForm.rating ? '#f59e0b' : 'none'}
                                                        color={star <= reviewForm.rating ? '#f59e0b' : '#d1d5db'}
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className={styles.formGroup}>
                                            <textarea
                                                placeholder="Share your experience with this product..."
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                required
                                                rows="4"
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn-primary" disabled={submittingReview}>
                                            {submittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </form>
                                </div>
                            )}

                            <div className={styles.reviewsList}>
                                {product.reviews?.length > 0 ? (
                                    product.reviews.map((review, idx) => (
                                        <div key={idx} className={styles.reviewItem}>
                                            <div className={styles.reviewHeader}>
                                                <div className={styles.reviewerInfo}>
                                                    <div className={styles.reviewerAvatar}>
                                                        {review.user?.firstName?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <strong>{review.user?.firstName} {review.user?.lastName}</strong>
                                                        {review.verifiedPurchase && <span className={styles.verifiedBadge}>Verified Purchase</span>}
                                                    </div>
                                                </div>
                                                <div className={styles.reviewStars}>{renderStars(review.rating)}</div>
                                            </div>
                                            <p className={styles.reviewComment}>{review.comment}</p>
                                            <span className={styles.reviewDate}>
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles.noReviews}>No reviews yet. Be the first to review this product!</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ProductDetailPage;
