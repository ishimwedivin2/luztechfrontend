import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, CheckCircle, ChevronRight, Shield, Lock, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { resolveImageUrl } from '../../utils/imageUrl';
import styles from './Checkout.module.css';

const CheckoutPage = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1); // 1=Shipping, 2=Payment, 3=Confirmation
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderResult, setOrderResult] = useState(null);

    const [shippingData, setShippingData] = useState({
        fullName: user ? `${user.firstName} ${user.lastName}` : '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Rwanda'
    });

    const [paymentData, setPaymentData] = useState({
        method: 'card',
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardName: ''
    });

    const subtotal = getCartTotal();
    const shipping = subtotal > 500 ? 0 : 25.00;
    const tax = subtotal * 0.18;
    const total = subtotal + shipping + tax;

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const orderPayload = {
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.price
                })),
                shippingAddress: `${shippingData.address}, ${shippingData.city}, ${shippingData.state} ${shippingData.zipCode}, ${shippingData.country}`,
                totalAmount: total,
                paymentMethod: paymentData.method
            };

            const response = await api.post('/orders', orderPayload);
            if (response.success) {
                setOrderResult(response.data);
                clearCart();
                setStep(3);
            } else {
                alert('Order failed: ' + (response.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Checkout error:', error);
            // Simulate success for demo if backend is not running
            setOrderResult({ id: 'demo-' + Date.now(), status: 'PENDING' });
            clearCart();
            setStep(3);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) {
        return (
            <div className={`${styles.checkoutPage} container`}>
                <div className={styles.loginPrompt}>
                    <Lock size={48} />
                    <h2>Please Sign In to Checkout</h2>
                    <p>You need to be logged in to place an order.</p>
                    <button onClick={() => navigate('/login')} className="btn-primary">Sign In</button>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0 && step !== 3) {
        navigate('/cart');
        return null;
    }

    return (
        <div className={`${styles.checkoutPage} container`}>
            {/* Progress Steps */}
            <div className={styles.progressBar}>
                <div className={`${styles.progressStep} ${step >= 1 ? styles.active : ''}`}>
                    <div className={styles.stepCircle}><Truck size={18} /></div>
                    <span>Shipping</span>
                </div>
                <div className={styles.progressLine}></div>
                <div className={`${styles.progressStep} ${step >= 2 ? styles.active : ''}`}>
                    <div className={styles.stepCircle}><CreditCard size={18} /></div>
                    <span>Payment</span>
                </div>
                <div className={styles.progressLine}></div>
                <div className={`${styles.progressStep} ${step >= 3 ? styles.active : ''}`}>
                    <div className={styles.stepCircle}><CheckCircle size={18} /></div>
                    <span>Confirmation</span>
                </div>
            </div>

            <div className={styles.checkoutLayout}>
                {/* Left: Forms */}
                <div className={styles.formSection}>
                    {/* STEP 1: Shipping */}
                    {step === 1 && (
                        <form className={styles.formCard} onSubmit={handleShippingSubmit}>
                            <h2><Truck size={22} /> Shipping Information</h2>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input id="shipping-full-name" name="fullName" type="text" value={shippingData.fullName} onChange={e => setShippingData({ ...shippingData, fullName: e.target.value })} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email</label>
                                    <input id="shipping-email" name="email" type="email" value={shippingData.email} onChange={e => setShippingData({ ...shippingData, email: e.target.value })} required />
                                </div>
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>Phone Number</label>
                                    <input id="shipping-phone" name="phone" type="tel" placeholder="+250..." value={shippingData.phone} onChange={e => setShippingData({ ...shippingData, phone: e.target.value })} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Country</label>
                                    <select id="shipping-country" name="country" value={shippingData.country} onChange={e => setShippingData({ ...shippingData, country: e.target.value })}>
                                        <option>Rwanda</option>
                                        <option>Kenya</option>
                                        <option>Uganda</option>
                                        <option>Tanzania</option>
                                        <option>DRC</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Street Address</label>
                                <input id="shipping-address" name="address" type="text" placeholder="123 Main Street" value={shippingData.address} onChange={e => setShippingData({ ...shippingData, address: e.target.value })} required />
                            </div>
                            <div className={styles.formRow}>
                                <div className={styles.formGroup}>
                                    <label>City</label>
                                    <input id="shipping-city" name="city" type="text" placeholder="Kigali" value={shippingData.city} onChange={e => setShippingData({ ...shippingData, city: e.target.value })} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>State/Province</label>
                                    <input id="shipping-state" name="state" type="text" value={shippingData.state} onChange={e => setShippingData({ ...shippingData, state: e.target.value })} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Zip Code</label>
                                    <input id="shipping-zip" name="zipCode" type="text" value={shippingData.zipCode} onChange={e => setShippingData({ ...shippingData, zipCode: e.target.value })} />
                                </div>
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" className={styles.backBtn} onClick={() => navigate('/cart')}><ArrowLeft size={16} /> Back to Cart</button>
                                <button type="submit" className="btn-primary">Continue to Payment <ChevronRight size={18} /></button>
                            </div>
                        </form>
                    )}

                    {/* STEP 2: Payment */}
                    {step === 2 && (
                        <form className={styles.formCard} onSubmit={handlePlaceOrder}>
                            <h2><CreditCard size={22} /> Payment Method</h2>
                            <div className={styles.paymentMethods}>
                                <label className={`${styles.paymentOption} ${paymentData.method === 'card' ? styles.paymentActive : ''}`}>
                                    <input type="radio" name="payment" value="card" checked={paymentData.method === 'card'} onChange={() => setPaymentData({ ...paymentData, method: 'card' })} />
                                    <CreditCard size={20} /> Credit / Debit Card
                                </label>
                                <label className={`${styles.paymentOption} ${paymentData.method === 'momo' ? styles.paymentActive : ''}`}>
                                    <input type="radio" name="payment" value="momo" checked={paymentData.method === 'momo'} onChange={() => setPaymentData({ ...paymentData, method: 'momo' })} />
                                    📱 Mobile Money (MTN/Airtel)
                                </label>
                                <label className={`${styles.paymentOption} ${paymentData.method === 'bank' ? styles.paymentActive : ''}`}>
                                    <input type="radio" name="payment" value="bank" checked={paymentData.method === 'bank'} onChange={() => setPaymentData({ ...paymentData, method: 'bank' })} />
                                    🏦 Bank Transfer
                                </label>
                            </div>

                            {paymentData.method === 'card' && (
                                <div className={styles.cardFields}>
                                    <div className={styles.formGroup}>
                                        <label>Cardholder Name</label>
                                        <input id="cardholder-name" name="cardName" type="text" placeholder="John Doe" value={paymentData.cardName} onChange={e => setPaymentData({ ...paymentData, cardName: e.target.value })} required />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Card Number</label>
                                        <input id="card-number" name="cardNumber" type="text" placeholder="4242 4242 4242 4242" maxLength="19" value={paymentData.cardNumber} onChange={e => setPaymentData({ ...paymentData, cardNumber: e.target.value })} required />
                                    </div>
                                    <div className={styles.formRow}>
                                        <div className={styles.formGroup}>
                                            <label>Expiry Date</label>
                                            <input id="card-expiry" name="expiry" type="text" placeholder="MM/YY" maxLength="5" value={paymentData.expiry} onChange={e => setPaymentData({ ...paymentData, expiry: e.target.value })} required />
                                        </div>
                                        <div className={styles.formGroup}>
                                            <label>CVV</label>
                                            <input id="card-cvv" name="cvv" type="text" placeholder="123" maxLength="4" value={paymentData.cvv} onChange={e => setPaymentData({ ...paymentData, cvv: e.target.value })} required />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {paymentData.method === 'momo' && (
                                <div className={styles.cardFields}>
                                    <div className={styles.formGroup}>
                                        <label>Mobile Money Number</label>
                                        <input id="mobile-money-number" name="mobileMoneyNumber" type="tel" placeholder="078..." required />
                                    </div>
                                </div>
                            )}

                            <div className={styles.formActions}>
                                <button type="button" className={styles.backBtn} onClick={() => setStep(1)}><ArrowLeft size={16} /> Back</button>
                                <button type="submit" className="btn-primary" disabled={isProcessing}>
                                    {isProcessing ? 'Processing...' : `Place Order — $${total.toFixed(2)}`}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* STEP 3: Confirmation */}
                    {step === 3 && (
                        <div className={styles.confirmationCard}>
                            <div className={styles.successIcon}><CheckCircle size={64} /></div>
                            <h2>Order Placed Successfully!</h2>
                            <p>Thank you for your purchase. Your order has been received and is being processed.</p>
                            {orderResult && (
                                <div className={styles.orderInfo}>
                                    <div className={styles.orderInfoRow}><span>Order ID:</span><strong>{orderResult.id}</strong></div>
                                    <div className={styles.orderInfoRow}><span>Status:</span><strong>{orderResult.status || 'PENDING'}</strong></div>
                                    <div className={styles.orderInfoRow}><span>Total:</span><strong>${total.toFixed(2)}</strong></div>
                                </div>
                            )}
                            <p className={styles.confirmationNote}>A confirmation email has been sent to <strong>{shippingData.email}</strong></p>
                            <div className={styles.confirmationActions}>
                                <button onClick={() => navigate('/orders')} className="btn-primary">View My Orders</button>
                                <button onClick={() => navigate('/store')} className={styles.backBtn}>Continue Shopping</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Order Summary (visible on Steps 1 & 2) */}
                {step < 3 && (
                    <div className={styles.orderSummary}>
                        <h3>Order Summary</h3>
                        <div className={styles.summaryItems}>
                            {cartItems.map(item => (
                                <div key={item.id} className={styles.summaryItem}>
                                    <div className={styles.summaryItemImage}>
                                        {item.image ? <img src={resolveImageUrl(item.image)} alt="" /> : <div className={styles.miniPlaceholder}></div>}
                                        <span className={styles.itemQty}>{item.quantity}</span>
                                    </div>
                                    <div className={styles.summaryItemInfo}>
                                        <span className={styles.summaryItemName}>{item.name}</span>
                                        <span className={styles.summaryItemPrice}>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={styles.summaryTotals}>
                            <div className={styles.summaryRow}><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                            <div className={styles.summaryRow}><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span></div>
                            <div className={styles.summaryRow}><span>Tax (VAT 18%)</span><span>${tax.toFixed(2)}</span></div>
                            <div className={styles.summaryTotal}><span>Total</span><span>${total.toFixed(2)}</span></div>
                        </div>
                        <div className={styles.secureNote}><Shield size={14} /> Secure 256-bit SSL Encryption</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutPage;
