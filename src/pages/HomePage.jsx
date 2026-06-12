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

const fallbackProducts = [
    {
        id: 'f-1',
        name: 'Cisco Catalyst 9300 48-Port Switch',
        category: 'networking',
        price: 3299.99,
        description: 'Enterprise stackable layer 3 switch with 48x 1G ports and modular uplinks.',
        image: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=600&q=80',
        specs: ['48 Ethernet Ports', 'Stackwise-480', 'UADP 2.0 ASIC']
    },
    {
        id: 'f-2',
        name: 'Dell PowerEdge R760 Rack Server',
        category: 'servers',
        price: 5499.00,
        description: 'High performance 2U server powered by Dual 4th Gen Intel Xeon processors.',
        image: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=600&q=80',
        specs: ['Dual Intel Xeon', 'Up to 8TB DDR5', 'PERC12 RAID Controller']
    },
    {
        id: 'f-3',
        name: 'Fortinet FortiGate 100F NGFW',
        category: 'security',
        price: 2899.50,
        description: 'Next-generation firewall for mid-sized enterprise networks with advanced threat inspection.',
        image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80',
        specs: ['1 Gbps Threat Protection', 'Built-in SPU NP6/CP9', 'Dual Power Supplies']
    },
    {
        id: 'f-5',
        name: 'Juniper EX4100 24-Port Switch',
        category: 'networking',
        price: 2150.00,
        description: 'Cloud-ready access switch with AI-powered Mist wired assurance for modern campus systems.',
        image: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=600&q=80',
        specs: ['24 PoE+ Ports', 'Virtual Chassis Support', 'Mist AI Integrated']
    },
    {
        id: 'f-6',
        name: 'HPE ProLiant DL380 Gen11 Server',
        category: 'servers',
        price: 4850.00,
        description: 'Adaptable 2U rack server delivering supreme scalability for multi-VM corporate workloads.',
        image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
        specs: ['Single AMD EPYC', 'Up to 3TB RAM', 'HPE iLO 6 Management']
    },
    {
        id: 'f-7',
        name: 'Palo Alto PA-440 Firewalls',
        category: 'security',
        price: 1999.00,
        description: 'ML-powered desktop Next-Gen Firewall delivering advanced security for distributed branches.',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
        specs: ['App-ID & Content-ID', 'WildFire Threat Analysis', 'Fanless Silent Operation']
    }
];

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('/products');
                if (response.success) {
                    setFeaturedProducts(response.data);
                }
            } catch (error) {
                console.error('Error fetching products', error);
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
        const apiProductsMapped = featuredProducts.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category || 'networking',
            price: p.price,
            description: p.description || 'Enterprise grade IT hardware solution.',
            image: resolveImageUrl(p.images?.[0]),
            specs: ['Genuine Vendor Stock', 'Luztech Inspected']
        }));

        const combined = [...apiProductsMapped];
        fallbackProducts.forEach(fbItem => {
            if (!combined.some(item => item.name.toLowerCase() === fbItem.name.toLowerCase())) {
                combined.push(fbItem);
            }
        });

        return combined.slice(0, 8);
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
                <div className={styles.servicesGrid}>
                    <div className={styles.serviceCard} onClick={() => navigate('/store?category=networking')}>
                        <div className={styles.iconBox}><Globe size={32} /></div>
                        <h3>Networking</h3>
                        <p>Enterprise networking switches, routers, and connectivity solutions.</p>
                    </div>
                    <div className={styles.serviceCard} onClick={() => navigate('/store?category=servers')}>
                        <div className={styles.iconBox}><Server size={32} /></div>
                        <h3>Servers & Storage</h3>
                        <p>Scalable rack servers, network storage, and accessories.</p>
                    </div>
                    <div className={styles.serviceCard} onClick={() => navigate('/store?category=computers')}>
                        <div className={styles.iconBox}><Cpu size={32} /></div>
                        <h3>Computers & Hardware</h3>
                        <p>High-performance desktops, laptops, and computer components.</p>
                    </div>
                    <div className={styles.serviceCard} onClick={() => navigate('/store?category=software')}>
                        <div className={styles.iconBox}><HardDrive size={32} /></div>
                        <h3>Software & Licenses</h3>
                        <p>Operating systems, developer suites, and office tools.</p>
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
                    {featuredItems.map(item => (
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
                    ))}
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
