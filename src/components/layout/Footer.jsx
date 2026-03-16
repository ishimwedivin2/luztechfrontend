import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={`${styles.container} container`}>
                <div className={styles.grid}>
                    {/* Brand Info */}
                    <div className={styles.brandCol}>
                        <div className={styles.logo}>
                            <span className={styles.logoText}>LUZ</span>
                            <span className={styles.logoSubtext}>TECHNOLOGY</span>
                        </div>
                        <p className={styles.brandDesc}>
                            Rwanda's leading provider of enterprise IT solutions, networking infrastructure, and professional training through our world-class Academy.
                        </p>
                        <div className={styles.socials}>
                            <a href="#"><Facebook size={20} /></a>
                            <a href="#"><Twitter size={20} /></a>
                            <a href="#"><Linkedin size={20} /></a>
                            <a href="#"><Instagram size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className={styles.linksCol}>
                        <h4>Solutions</h4>
                        <ul>
                            <li><Link to="/store">IT Store</Link></li>
                            <li><Link to="/academy">Technology Academy</Link></li>
                            <li><Link to="/careers">Careers</Link></li>
                            <li><Link to="/support">Support Center</Link></li>
                        </ul>
                    </div>

                    {/* Useful Links */}
                    <div className={styles.linksCol}>
                        <h4>Company</h4>
                        <ul>
                            <li><a href="#">About Us</a></li>
                            <li><a href="#">Our Vision</a></li>
                            <li><a href="#">Privacy Policy</a></li>
                            <li><a href="#">Terms of Service</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className={styles.contactCol}>
                        <h4>Contact Us</h4>
                        <ul>
                            <li>
                                <MapPin size={18} />
                                <span>Kigali Heights, Kigali, Rwanda</span>
                            </li>
                            <li>
                                <Phone size={18} />
                                <span>+250 788 000 000</span>
                            </li>
                            <li>
                                <Mail size={18} />
                                <span>info@luztech.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className={styles.bottomBar}>
                    <p>&copy; {new Date().getFullYear()} Luz Technology. All rights reserved.</p>
                    <div className={styles.paymentMethods}>
                        <span>Secured by SSL</span>
                        <div className={styles.divider}></div>
                        <span>Certified Partner of Cisco & Huawei</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
