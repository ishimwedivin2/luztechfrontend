import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu, Globe, Shield, Terminal } from 'lucide-react';
import api from '../services/api';
import styles from './HomePage.module.css';

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                if (response.success) {
                    setFeaturedProducts(response.data.slice(0, 4));
                }
            } catch (error) {
                console.error('Error fetching products', error);
            }
        };
        fetchProducts();
    }, []);

    return (
        <div className={styles.home}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={`${styles.heroContent} container`}>
                    <h1 className={styles.heroTitle}>
                        "A <span className={styles.highlight}>KIT</span> FITTING YOUR SKILLS"
                    </h1>
                    <p className={styles.heroSubtitle}>
                        Enterprise Servers, Networking Rack Infrastructure, Firewalls, and Data Center Solutions for IT Professionals.
                    </p>
                    <div className={styles.heroActions}>
                        <button onClick={() => navigate('/store')} className="btn-primary" style={{ padding: '0.75rem 2.5rem', fontSize: '1.1rem' }}>
                            Shop Now <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Categories / Services Grid */}
            <section className="container">
                <div className={styles.servicesGrid}>
                    <div className={styles.serviceCard}>
                        <div className={styles.iconBox}><Globe size={32} /></div>
                        <h3>Networking</h3>
                        <p>Enterprise Cisco and Huawei solutions for modern connectivity.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <div className={styles.iconBox}><Shield size={32} /></div>
                        <h3>Security</h3>
                        <p>Advanced cybersecurity infrastructure and auditing services.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <div className={styles.iconBox}><Cpu size={32} /></div>
                        <h3>Hardware</h3>
                        <p>Premium server and workstation hardware for high-performance computing.</p>
                    </div>
                    <div className={styles.serviceCard}>
                        <div className={styles.iconBox}><Terminal size={32} /></div>
                        <h3>Academy</h3>
                        <p>Professional training and certifications for IT career growth.</p>
                    </div>
                </div>
            </section>

            {/* Recent Products */}
            <section className={`${styles.productsSection} container`}>
                <div className={styles.sectionHeader}>
                    <h2 className="section-title">New Arrivals</h2>
                    <button onClick={() => navigate('/store')} className={styles.viewMore}>View All Store</button>
                </div>

                <div className={styles.productGrid}>
                    {featuredProducts.length > 0 ? (
                        featuredProducts.map(product => (
                            <div key={product.id} className={styles.productCard} onClick={() => navigate(`/product/${product.id}`)}>
                                <div className={styles.productImage}>
                                    {product.images?.[0] ? (
                                            <img src={`http://localhost:8080${product.images[0].url ? product.images[0].url : product.images[0]}`} alt={product.name} />
                                        ) : (
                                            <div className={styles.imagePlaceholder}>No Image</div>
                                        )}
                                </div>
                                <div className={styles.productInfo}>
                                    <h3>{product.name}</h3>
                                    <p className={styles.price}>${product.price.toFixed(2)}</p>
                                    <button className={styles.addToCartSmall}>Details</button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>Browse our catalog for the latest technology solutions.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;
