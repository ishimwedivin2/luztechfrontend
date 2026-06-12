import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ArrowRight, Cpu, Globe, Shield, Terminal, 
    HardDrive, Zap, Server, Clock, Award, 
    Users, CheckCircle, Truck, X, Send 
} from 'lucide-react';
import api from '../services/api';
import { resolveImageUrl } from '../utils/imageUrl';
import styles from './HomePage.module.css';

import img1 from '../assets/1stsection/1.png';
import img2 from '../assets/1stsection/2.jpg';
import img3 from '../assets/1stsection/3.png';

const heroImages = [img1, img2, img3];

const slideshowContent = [
    {
        title: <>SUMMER IS <span className={styles.highlight}>COMING</span></>,
        subtitle: "Enterprise Servers, Networking Rack Infrastructure, Firewalls, and Data Center Solutions for IT Professionals.",
        buttonText: "Shop Summer Gear",
        link: "/store"
    },
    {
        title: <>A <span className={styles.highlight}>KIT</span> FITTING YOUR SKILLS</>,
        subtitle: "Enterprise Servers, Networking Rack Infrastructure, Firewalls, and Data Center Solutions for IT Professionals.",
        buttonText: "Shop Now",
        link: "/store"
    },
    {
        title: <>CHOOSE YOUR <span className={styles.highlight}>ADVENTURE</span></>,
        subtitle: "Enterprise Servers, Networking Rack Infrastructure, Firewalls, and Data Center Solutions for IT Professionals.",
        buttonText: "Shop Now",
        link: "/store"
    }
];

const partnerBrands = [
    { name: 'Cisco', description: 'Enterprise Networking', color: '#1BA0D8' },
    { name: 'Fortinet', description: 'Next-Gen Security', color: '#EE3124' },
    { name: 'Dell Technologies', description: 'Server & Storage', color: '#006BAD' },
    { name: 'HPE', description: 'Hybrid Cloud Solutions', color: '#00B388' },
    { name: 'Huawei', description: 'Telecom & Datacenter', color: '#FF0000' },
    { name: 'Juniper Networks', description: 'AI-Native Networking', color: '#2574A9' }
];

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
        id: 'f-4',
        name: 'Cisco CCNA 200-301 Bootcamp',
        category: 'academy',
        price: 799.00,
        description: 'Complete certification training with official virtual laboratory labs and exam prep.',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80',
        specs: ['60 Hours Live Labs', 'Expert Instructor Led', 'Exam Voucher Included']
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
    },
    {
        id: 'f-8',
        name: 'CompTIA Security+ SY0-701 Training',
        category: 'academy',
        price: 499.00,
        description: 'Core cybersecurity skills bootcamp covering network security principles, tools, and mitigations.',
        image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80',
        specs: ['Self-Paced Labs', 'Practice Exams', 'Lifetime Community Access']
    }
];

const HomePage = () => {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    
    // Configurator state
    const [configNodes, setConfigNodes] = useState(4);
    const [configBandwidth, setConfigBandwidth] = useState('10G');
    const [configSecurity, setConfigSecurity] = useState('advanced');
    const [configSla, setConfigSla] = useState('24x7');
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    
    // Quote form state
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactCompany, setContactCompany] = useState('');
    const [formSubmitted, setFormSubmitted] = useState(false);
    
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

    // Configurator Calculations
    const calculateMetrics = () => {
        const multiplier = configBandwidth === '1G' ? 1 : configBandwidth === '10G' ? 10 : 40;
        const throughput = Math.min(configNodes * multiplier * 0.95, configBandwidth === '1G' ? 10 : configBandwidth === '10G' ? 100 : 400);
        
        let secPower = 50;
        if (configSecurity === 'advanced') secPower = 120;
        if (configSecurity === 'next-gen') secPower = 280;
        const powerConsumption = (configNodes * 380) + secPower;
        
        const baseHardware = configNodes * 850;
        const bwCost = configBandwidth === '1G' ? 200 : configBandwidth === '10G' ? 750 : 2500;
        const secCost = configSecurity === 'basic' ? 150 : configSecurity === 'advanced' ? 450 : 1200;
        const slaCost = configSla === '8x5' ? 100 : configSla === '24x7' ? 490 : 980;
        const priceEstimate = baseHardware + bwCost + (secCost * 12) + (slaCost * 12);
        
        return {
            throughput: throughput.toFixed(1),
            power: powerConsumption.toLocaleString(),
            price: priceEstimate.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })
        };
    };

    const metrics = calculateMetrics();

    // Get combined list of products filtered by tab
    const getFilteredItems = () => {
        const apiProductsMapped = featuredProducts.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category || 'networking',
            price: p.price,
            description: p.description || 'Enterprise grade IT hardware solution.',
            image: resolveImageUrl(p.images?.[0]),
            specs: ['Genuine Vendor Stock', 'Luztech Inspected']
        }));

        // Avoid listing duplicates by name if backend has similar items
        const combined = [...apiProductsMapped];
        fallbackProducts.forEach(fbItem => {
            if (!combined.some(item => item.name.toLowerCase() === fbItem.name.toLowerCase())) {
                combined.push(fbItem);
            }
        });

        if (activeTab === 'all') {
            return combined.slice(0, 8);
        }
        return combined.filter(item => item.category === activeTab);
    };

    const filteredItems = getFilteredItems();

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setFormSubmitted(true);
        setTimeout(() => {
            setIsQuoteOpen(false);
            setFormSubmitted(false);
            setContactName('');
            setContactEmail('');
            setContactCompany('');
        }, 2500);
    };

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
                    <h1 className={styles.heroTitle}>
                        {activeSlide.title}
                    </h1>
                    <p className={styles.heroSubtitle}>
                        {activeSlide.subtitle}
                    </p>
                    <div className={styles.heroActions}>
                        <button onClick={() => navigate(activeSlide.link)} className={`btn-primary ${styles.heroCta}`}>
                            {activeSlide.buttonText} <ArrowRight size={20} />
                        </button>
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

            {/* NEW: Brand Partners Showcase */}
            <section className={styles.partnersSection}>
                <div className="container">
                    <div className={styles.partnersHeader}>
                        <h4>Official Gold Partner & Authorized Distributor</h4>
                    </div>
                    <div className={styles.partnersGrid}>
                        {partnerBrands.map((brand, i) => (
                            <div key={i} className={styles.partnerCard} style={{ '--hover-color': brand.color }}>
                                <span className={styles.partnerIcon}>
                                    {brand.name === 'Cisco' && <Globe size={24} />}
                                    {brand.name === 'Fortinet' && <Shield size={24} />}
                                    {brand.name === 'Dell Technologies' && <Cpu size={24} />}
                                    {brand.name === 'HPE' && <HardDrive size={24} />}
                                    {brand.name === 'Huawei' && <Zap size={24} />}
                                    {brand.name === 'Juniper Networks' && <Server size={24} />}
                                </span>
                                <div className={styles.partnerInfo}>
                                    <h5>{brand.name}</h5>
                                    <p>{brand.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* NEW: Interactive Solution Configurator */}
            <section className={`${styles.configuratorSection} container`}>
                <div className={styles.configuratorRow}>
                    <div className={styles.configuratorFormCol}>
                        <div className={styles.configuratorTitleBlock}>
                            <span className={styles.tag}>Interactive Calculator</span>
                            <h2>Configure Your Datacenter Setup</h2>
                            <p>Select your nodes, speed, and support level to get an instant engineering estimate.</p>
                        </div>

                        <div className={styles.sliderGroup}>
                            <div className={styles.controlHeader}>
                                <label>Server Compute Nodes</label>
                                <span className={styles.controlValue}>{configNodes} Nodes</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="32" 
                                value={configNodes}
                                onChange={(e) => setConfigNodes(parseInt(e.target.value))}
                                className={styles.premiumSlider}
                            />
                            <div className={styles.sliderScale}>
                                <span>1 Node</span>
                                <span>16 Nodes</span>
                                <span>32 Nodes</span>
                            </div>
                        </div>

                        <div className={styles.optionsRow}>
                            <div className={styles.selectGroup}>
                                <label>Uplink Bandwidth</label>
                                <div className={styles.customSelectWrapper}>
                                    <select 
                                        value={configBandwidth} 
                                        onChange={(e) => setConfigBandwidth(e.target.value)}
                                        className={styles.premiumSelect}
                                    >
                                        <option value="1G">1 Gbps Uplink</option>
                                        <option value="10G">10 Gbps SFP+</option>
                                        <option value="40G">40/100 Gbps QSFP</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.selectGroup}>
                                <label>Cybersecurity Tier</label>
                                <div className={styles.customSelectWrapper}>
                                    <select 
                                        value={configSecurity} 
                                        onChange={(e) => setConfigSecurity(e.target.value)}
                                        className={styles.premiumSelect}
                                    >
                                        <option value="basic">Standard SPI Firewall</option>
                                        <option value="advanced">Next-Gen IPS Threat Guard</option>
                                        <option value="next-gen">Zero-Trust Cloud Sandbox</option>
                                    </select>
                                </div>
                            </div>

                            <div className={styles.selectGroup}>
                                <label>Support SLA Response</label>
                                <div className={styles.customSelectWrapper}>
                                    <select 
                                        value={configSla} 
                                        onChange={(e) => setConfigSla(e.target.value)}
                                        className={styles.premiumSelect}
                                    >
                                        <option value="8x5">Next Biz Day Support (8x5)</option>
                                        <option value="24x7">24x7 Mission Critical (4h)</option>
                                        <option value="mission-critical">15-Min Dedicated Escalation</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.configuratorDisplayCol}>
                        <div className={styles.metricsCard}>
                            <h4 className={styles.metricsTitle}>Estimated Engineering Output</h4>
                            
                            <div className={styles.metricItem}>
                                <div className={styles.metricIcon}><Zap size={20} /></div>
                                <div className={styles.metricData}>
                                    <span className={styles.metricLabel}>Max Config Throughput</span>
                                    <span className={styles.metricNum}>{metrics.throughput} Gbps</span>
                                </div>
                            </div>

                            <div className={styles.metricItem}>
                                <div className={styles.metricIcon}><Cpu size={20} /></div>
                                <div className={styles.metricData}>
                                    <span className={styles.metricLabel}>Estimated Power Consumption</span>
                                    <span className={styles.metricNum}>{metrics.power} Watts</span>
                                </div>
                            </div>

                            <div className={styles.divider} />

                            <div className={styles.priceEstimateBlock}>
                                <span className={styles.estimateLabel}>Estimated Annual Contract</span>
                                <span className={styles.estimatePrice}>${metrics.price}</span>
                                <span className={styles.estimateSub}>Includes server components, licensing & support</span>
                            </div>

                            <button onClick={() => setIsQuoteOpen(true)} className={styles.estimateButton}>
                                Request Custom Engineering Architecture <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW/REDESIGNED: Tabbed Showcase Grid */}
            <section className={`${styles.storeSection} container`}>
                <div className={styles.storeHeader}>
                    <div>
                        <span className={styles.tag}>Enterprise Hardware & Courses</span>
                        <h2>Explore Solutions</h2>
                    </div>
                    <div className={styles.tabsContainer}>
                        {['all', 'networking', 'servers', 'security', 'academy'].map(tab => (
                            <button
                                key={tab}
                                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={styles.productGrid}>
                    {filteredItems.map(item => (
                        <div key={item.id} className={styles.productCard} onClick={() => navigate(item.category === 'academy' ? `/academy` : `/product/${item.id}`)}>
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
            </section>

            {/* NEW: Academy & Certifications Roadmap */}
            <section className={styles.academyRoadmapSection}>
                <div className="container">
                    <div className={styles.roadmapHeader}>
                        <span className={styles.tag}>Career Training & Academy</span>
                        <h2>Interactive Certification Pathway</h2>
                        <p>We train IT professionals to architect, protect, and scale networks using vendor-certified courses.</p>
                    </div>

                    <div className={styles.roadmapTimeline}>
                        <div className={styles.timelineTrack} />
                        
                        <div className={styles.timelineNode}>
                            <div className={styles.nodeCircle}>1</div>
                            <div className={styles.nodeCard}>
                                <span className={styles.nodeTag}>Associate Level</span>
                                <h4>Cisco CCNA 200-301</h4>
                                <p>Learn structural fundamentals, network access, IP connectivity, and security basics.</p>
                                <div className={styles.nodeMeta}>
                                    <span><Clock size={14} /> 6 Weeks</span>
                                    <span><Award size={14} /> Official Exam Cert</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.timelineNode}>
                            <div className={styles.nodeCircle}>2</div>
                            <div className={styles.nodeCard}>
                                <span className={styles.nodeTag}>Professional Level</span>
                                <h4>Cisco CCNP Enterprise</h4>
                                <p>Master advanced routing, enterprise campus virtualization, SD-WAN, and automation scripting.</p>
                                <div className={styles.nodeMeta}>
                                    <span><Clock size={14} /> 10 Weeks</span>
                                    <span><Award size={14} /> CCNP Core + Specialist</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.timelineNode}>
                            <div className={styles.nodeCircle}>3</div>
                            <div className={styles.nodeCard}>
                                <span className={styles.nodeTag}>Expert Security</span>
                                <h4>Fortinet NSE Security Specialist</h4>
                                <p>Architect firewalls, SD-WAN guards, secure access points, and cloud security frameworks.</p>
                                <div className={styles.nodeMeta}>
                                    <span><Clock size={14} /> 8 Weeks</span>
                                    <span><Award size={14} /> Fortinet Certified Specialist</span>
                                </div>
                            </div>
                        </div>

                        <div className={styles.timelineNode}>
                            <div className={styles.nodeCircle}>4</div>
                            <div className={styles.nodeCard}>
                                <span className={styles.nodeTag}>Expert Systems</span>
                                <h4>Zero-Trust Architect & CISSP</h4>
                                <p>Learn high-level security management, identity services, cryptography, and network defense strategies.</p>
                                <div className={styles.nodeMeta}>
                                    <span><Clock size={14} /> 12 Weeks</span>
                                    <span><Award size={14} /> CISSP Prep Certification</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Why Choose Us Trust Grid */}
            <section className={styles.whySection}>
                <div className="container">
                    <div className={styles.whyHeader}>
                        <span className={styles.tag}>Premium Service Guarantee</span>
                        <h2>Why Luz Technology?</h2>
                        <p>We are not just a hardware vendor. We provide production-tested engineering reliability.</p>
                    </div>

                    <div className={styles.whyGrid}>
                        <div className={styles.whyCard}>
                            <div className={styles.whyIconContainer}><Clock size={28} /></div>
                            <h4>24/7/365 Critical Support</h4>
                            <p>SLA-backed priority helpdesk with direct certified system engineers ready to deploy remote and on-site support in under 15 minutes.</p>
                        </div>
                        <div className={styles.whyCard}>
                            <div className={styles.whyIconContainer}><Users size={28} /></div>
                            <h4>Certified Network Engineers</h4>
                            <p>Every engineer on our planning team holds active CCIE, HCIE, or CISSP security credentials, ensuring your systems are designed perfectly.</p>
                        </div>
                        <div className={styles.whyCard}>
                            <div className={styles.whyIconContainer}><CheckCircle size={28} /></div>
                            <h4>Gold Brand Partnership</h4>
                            <p>We work directly with Cisco, Huawei, Dell, HPE, and Fortinet, securing official hardware licenses, vendor firmware, and original warranties.</p>
                        </div>
                        <div className={styles.whyCard}>
                            <div className={styles.whyIconContainer}><Truck size={28} /></div>
                            <h4>Staged Rack Deployment</h4>
                            <p>Racks are pre-wired, configured, OS installed, and stress-tested in our testing labs before being packed and deployed directly to your facility.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* NEW: Quote Request Modal */}
            {isQuoteOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <button className={styles.modalClose} onClick={() => setIsQuoteOpen(false)}>
                            <X size={20} />
                        </button>
                        
                        {!formSubmitted ? (
                            <form onSubmit={handleFormSubmit} className={styles.modalForm}>
                                <h3>Request Custom Engineering Architecture</h3>
                                <p>Get a custom design and detailed price estimate for your configured setup ({configNodes} compute nodes with {configBandwidth} speed).</p>
                                
                                <div className={styles.formInputGroup}>
                                    <label>Full Name</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. Jean Damascene" 
                                        value={contactName}
                                        onChange={(e) => setContactName(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formInputGroup}>
                                    <label>Corporate Email</label>
                                    <input 
                                        type="email" 
                                        required 
                                        placeholder="name@company.com" 
                                        value={contactEmail}
                                        onChange={(e) => setContactEmail(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formInputGroup}>
                                    <label>Company / Organization</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Luztech Corporation" 
                                        value={contactCompany}
                                        onChange={(e) => setContactCompany(e.target.value)}
                                    />
                                </div>

                                <div className={styles.formInputGroup}>
                                    <label>Additional Requirements</label>
                                    <textarea 
                                        rows="3" 
                                        placeholder="e.g. Specific storage expansion or virtualization requirements..."
                                    />
                                </div>

                                <button type="submit" className={styles.formSubmitBtn}>
                                    Submit Request <Send size={16} />
                                </button>
                            </form>
                        ) : (
                            <div className={styles.formSuccess}>
                                <CheckCircle size={56} className={styles.successIcon} />
                                <h3>Request Received Successfully</h3>
                                <p>Thank you, <strong>{contactName}</strong>. Our certified networks team from <strong>{contactCompany}</strong> will reach out to you within 2 business hours with a custom topology map and pricing proposal.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default HomePage;
