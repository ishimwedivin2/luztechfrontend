import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingCart, ChevronRight, ArrowRight, Shield, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { resolveImageUrl } from '../../utils/imageUrl';
import styles from './Cart.module.css';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const subtotal = getCartTotal();
    const shipping = subtotal > 500 ? 0 : 25.00;
    const tax = subtotal * 0.18; // 18% VAT
    const total = subtotal + shipping + tax;

    if (cartItems.length === 0) {
        return (
            <div className={`${styles.cartPage} container`}>
                <div className={styles.emptyCart}>
                    <ShoppingCart size={64} className={styles.emptyIcon} />
                    <h2>Your Cart is Empty</h2>
                    <p>Looks like you haven't added anything to your cart yet.</p>
                    <button onClick={() => navigate('/store')} className="btn-primary">
                        Continue Shopping <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`${styles.cartPage} container`}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
                <span onClick={() => navigate('/')}>Home</span>
                <ChevronRight size={14} />
                <span className={styles.activeBreadcrumb}>Shopping Cart</span>
            </div>

            <h1 className={styles.pageTitle}>Shopping Cart <span>({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})</span></h1>

            <div className={styles.cartLayout}>
                {/* Cart Items */}
                <div className={styles.cartItems}>
                    <div className={styles.cartHeader}>
                        <span>Product</span>
                        <span>Price</span>
                        <span>Quantity</span>
                        <span>Total</span>
                        <span></span>
                    </div>

                    {cartItems.map(item => (
                        <div key={item.id} className={styles.cartItem}>
                            <div className={styles.itemProduct}>
                                <div className={styles.itemImage} onClick={() => navigate(`/product/${item.id}`)}>
                                    {item.image ? (
                                        <img src={resolveImageUrl(item.image)} alt={item.name} />
                                    ) : (
                                        <div className={styles.imagePlaceholder}><ShoppingCart size={24} /></div>
                                    )}
                                </div>
                                <div className={styles.itemDetails}>
                                    <Link to={`/product/${item.id}`} className={styles.itemName}>{item.name}</Link>
                                    <span className={styles.itemCategory}>{item.category}</span>
                                    <span className={styles.itemSku}>SKU: {item.sku}</span>
                                </div>
                            </div>

                            <div className={styles.itemPrice}>
                                ${item.price?.toFixed(2)}
                            </div>

                            <div className={styles.itemQuantity}>
                                <div className={styles.quantitySelector}>
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                                        <Minus size={14} />
                                    </button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className={styles.itemTotal}>
                                ${(item.price * item.quantity).toFixed(2)}
                            </div>

                            <button className={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}

                    <div className={styles.cartActions}>
                        <button onClick={() => navigate('/store')} className={styles.continueShopping}>
                            ← Continue Shopping
                        </button>
                        <button onClick={clearCart} className={styles.clearCartBtn}>
                            Clear Cart
                        </button>
                    </div>
                </div>

                {/* Order Summary */}
                <div className={styles.orderSummary}>
                    <h3>Order Summary</h3>

                    <div className={styles.summaryRows}>
                        <div className={styles.summaryRow}>
                            <span>Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Shipping</span>
                            <span>{shipping === 0 ? <span className={styles.freeShipping}>FREE</span> : `$${shipping.toFixed(2)}`}</span>
                        </div>
                        <div className={styles.summaryRow}>
                            <span>Tax (18% VAT)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                    </div>

                    {subtotal < 500 && (
                        <div className={styles.freeShippingNotice}>
                            <Truck size={16} />
                            <span>Add <strong>${(500 - subtotal).toFixed(2)}</strong> more for free shipping!</span>
                        </div>
                    )}

                    <div className={styles.totalRow}>
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                    </div>

                    <button className={`btn-primary ${styles.checkoutBtn}`} onClick={() => navigate('/checkout')}>
                        Proceed to Checkout <ArrowRight size={18} />
                    </button>

                    <div className={styles.secureNotice}>
                        <Shield size={16} />
                        <span>Secure Checkout — SSL Encrypted</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
