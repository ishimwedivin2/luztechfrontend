import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu, Globe, Server, HardDrive } from 'lucide-react';
import api from '../services/api';
import { resolveImageUrl } from '../utils/imageUrl';
import styles from './HomePage.module.css';

import img1 from '../assets/1stsection/1.png';
import img2 from '../assets/1stsection/2.jpg';
import img3 from '../assets/1stsection/3.png';

const heroImages = [img1, img2, img3];

const slideshowContent = [
    {
        title: <>ENTERPRISE <span className={styles.highlight}>INFRASTRUCTURE</span></>,
        subtitle: "Explore our premium selection of enterprise-grade rack servers, networking switches, and storage systems.",
        buttonText: "Browse Hardware",
        link: "/store"
    },
    {
        title: <>HIGH-PERFORMANCE <span className={styles.highlight}>COMPUTING</span></>,
        subtitle: "Select from the latest professional workstations, high-end components, and computing accessories.",
        buttonText: "Shop Computers",
        link: "/store?category=computers"
    },
    {
        title: <>ENTERPRISE <span className={styles.highlight}>SOFTWARE</span></>,
        subtitle: "Access official software licenses, operating systems, and developer tools for your business.",
        buttonText: "Shop Software",
        link: "/store?category=software"
    }
];

const heroStats = [
    { value: 1000, suffix: '+', label: 'Products in Catalog' },
    { value: 50, suffix: '+', label: 'Top Brands' },
    { value: 100, suffix: '%', label: 'Genuine Hardware' },
    { display: '24/7', label: 'Customer Support' }
];

const AnimatedHeroStat = ({ value, suffix = '', label, display }) => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (display) return undefined;

        const element = ref.current;
        if (!element) return undefined;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting || hasAnimated.current) return;
                hasAnimated.current = true;

                const duration = 1800;
                const start = performance.now();

                const tick = (now) => {
                    const progress = Math.min((now - start) / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3);
                    setCount(Math.round(eased * value));
                    if (progress < 1) requestAnimationFrame(tick);
                };

                requestAnimationFrame(tick);
            },
            { threshold: 0.4 }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [value, display]);

    return (
        <div ref={ref} className={styles.heroStat}>
            <span className={styles.heroStatValue}>
                {display ?? `${count}${suffix}`}
            </span>
            <span className={styles.heroStatLabel}>{label}</span>
        </div>
    );
};

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await api.get('/products');
                if (response.success) {
                    setFeaturedProducts(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching products', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const getFeaturedItems = () => {
        return featuredProducts.slice(0, 8).map(p => ({
            id: p.id,
            name: p.name,
            category: p.categoryName || p.category || 'networking',
            price: p.price,
            description: p.description || 'Enterprise grade IT hardware solution.',
            image: resolveImageUrl(p.images?.[0]),
            specs: p.specs || ['Genuine Vendor Stock', 'Luztech Inspected']
        }));
    };

    const featuredItems = getFeaturedItems();
    const activeSlide = slideshowContent[currentImageIndex] || slideshowContent[0];

    return (
        <div className={styles.home}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroSlider}>
                    {heroImages.map((img, index) => (
                        <div
                             key={index}
                             className={`${styles.slide} ${index === currentImageIndex ? styles.slideActive : ''}`}
                             style={{ backgroundImage: `url(${img})` }}
                        />
                    ))}
                    <div className={styles.heroOverlay} />
                </div>
                <div className={`${styles.heroContent} container`}>
                    <span className={styles.heroEyebrow}>Your One-Stop Tech & E-Commerce Destination</span>
                    <div key={currentImageIndex} className={styles.heroTextBlock}>
                        <h1 className={styles.heroTitle}>
                            {activeSlide.title}
                        </h1>
                        <p className={styles.heroSubtitle}>
                            {activeSlide.subtitle}
                        </p>
                    </div>
                    <div className={styles.heroActions}>
                        <button onClick={() => navigate(activeSlide.link)} className={`btn-primary ${styles.heroCta}`}>
                            {activeSlide.buttonText} <ArrowRight size={20} />
                        </button>
                    </div>
                    <div className={styles.heroStats}>
                        {heroStats.map((stat) => (
                            <AnimatedHeroStat key={stat.label} {...stat} />
                        ))}
                    </div>
                    <div className={styles.slideIndicators} role="tablist" aria-label="Hero slideshow">
                        {heroImages.map((_, index) => (
                            <button
                                key={index}
                                role="tab"
                                aria-selected={index === currentImageIndex}
                                aria-label={`Slide ${index + 1}`}
                                className={`${styles.slideDot} ${index === currentImageIndex ? styles.slideDotActive : ''}`}
                                onClick={() => setCurrentImageIndex(index)}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories / Services Grid */}
            <section className={`container ${styles.servicesSection}`}>
                <div className={styles.servicesHeader}>
                    <span className={styles.servicesTag}>OUR DEPARTMENTS</span>
                    <h2 className={styles.servicesTitle}>Explore Enterprise Solutions</h2>
                </div>
                <div className={styles.servicesGrid}>
                    <div className={styles.serviceCard} onClick={() => navigate('/store?category=networking')}>
                        <div className={styles.iconBox}><Globe size={32} /></div>
                        <h3>Networking</h3>
                        <p>Enterprise networking switches, routers, and connectivity solutions.</p>
                        <div className={styles.cardAction}>
                            <span>Shop Department</span>
                            <ArrowRight size={16} />
                        </div>
                    </div>
                    <div className={styles.serviceCard} onClick={() => navigate('/store?category=servers')}>
                        <div className={styles.iconBox}><Server size={32} /></div>
                        <h3>Servers & Storage</h3>
                        <p>Scalable rack servers, network storage, and accessories.</p>
                        <div className={styles.cardAction}>
                            <span>Shop Department</span>
                            <ArrowRight size={16} />
                        </div>
                    </div>
                    <div className={styles.serviceCard} onClick={() => navigate('/store?category=computers')}>
                        <div className={styles.iconBox}><Cpu size={32} /></div>
                        <h3>Computers & Hardware</h3>
                        <p>High-performance desktops, laptops, and computer components.</p>
                        <div className={styles.cardAction}>
                            <span>Shop Department</span>
                            <ArrowRight size={16} />
                        </div>
                    </div>
                    <div className={styles.serviceCard} onClick={() => navigate('/store?category=software')}>
                        <div className={styles.iconBox}><HardDrive size={32} /></div>
                        <h3>Software & Licenses</h3>
                        <p>Operating systems, developer suites, and office tools.</p>
                        <div className={styles.cardAction}>
                            <span>Shop Department</span>
                            <ArrowRight size={16} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Grid */}
            <section className={`${styles.storeSection} container`}>
                <div className={styles.storeHeader}>
                    <div>
                        <span className={styles.tag}>Latest Additions</span>
                        <h2>Featured Products</h2>
                    </div>
                </div>

                <div className={styles.productGrid}>
                    {loading ? (
                        <div className={styles.loadingPlaceholder}>
                            <p>Loading featured products...</p>
                        </div>
                    ) : featuredItems.length > 0 ? (
                        featuredItems.map(item => (
                            <div key={item.id} className={styles.productCard} onClick={() => navigate(`/product/${item.id}`)}>
                                <div className={styles.productImage}>
                                    {item.image ? (
                                        <img src={item.image} alt={item.name} />
                                    ) : (
                                        <div className={styles.imagePlaceholder}>
                                            <HardDrive size={40} className={styles.placeholderIcon} />
                                            <span>No Image</span>
                                        </div>
                                    )}
                                    <span className={styles.categoryBadge}>{item.category}</span>
                                </div>
                                <div className={styles.productInfo}>
                                    <h3>{item.name}</h3>
                                    <p className={styles.productDesc}>{item.description}</p>
                                    <div className={styles.productSpecs}>
                                        {item.specs?.map((spec, index) => (
                                            <span key={index} className={styles.specTag}>{spec}</span>
                                        ))}
                                    </div>
                                    <div className={styles.cardFooter}>
                                        <p className={styles.price}>${item.price.toFixed(2)}</p>
                                        <button className={styles.detailsBtn}>View Details</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className={styles.emptyPlaceholder}>
                            <p>No featured products available at the moment.</p>
                        </div>
                    )}
                </div>

                <div className={styles.viewMoreContainer}>
                    <button onClick={() => navigate('/store')} className={`btn-primary ${styles.viewMoreBtn}`}>
                        View All Products <ArrowRight size={20} />
                    </button>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
