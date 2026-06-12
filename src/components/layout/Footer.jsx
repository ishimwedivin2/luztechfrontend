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
                            Rwanda's leading provider of enterprise IT solutions and networking infrastructure.
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
                            <li><Link to="/support">Support</Link></li>
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

                    {/* Map Location */}
                    <div className={styles.mapCol}>
                        <h4>Our Location</h4>
                        <div className={styles.mapWrapper}>
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5028448981273!2d30.0867!3d-1.9441!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42600000001%3A0x6b74e12e437d0276!2sKigali%20Heights!5e0!3m2!1sen!2srw!4v1712241600000!5m2!1sen!2srw" 
                                width="100%" 
                                height="70" 
                                style={{ border: 0, borderRadius: '6px' }} 
                                allowFullScreen="" 
                                loading="lazy"
                                title="Luz Technology Location"
                            ></iframe>
                        </div>
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
