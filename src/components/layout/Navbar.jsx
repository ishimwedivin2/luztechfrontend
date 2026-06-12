import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, LogOut, ChevronDown, Heart, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import NotificationCenter from './NotificationCenter';
import logoImg from '../../assets/image.jpg';
import styles from './Navbar.module.css';

const Navbar = () => {
    const { user, logout, isAdmin, isEmployee } = useAuth();
    const { getCartCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/store?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <header className={styles.header}>
            {/* TIER 1: Top Bar */}
            <div className={styles.topBar}>
                <div className={`${styles.container} ${styles.topBarContent}`}>
                    <div className={styles.topLeft}>
                        <span>B2B, Gov, Enterprise & More</span>
                        <a href="mailto:support@luztechnology.com" className={styles.topLink}>support@luztechnology.com</a>
                        <Link to="/about" className={styles.topLink}>About Us</Link>
                    </div>
                    <div className={styles.topRight}>
                        <span>The IT Professional's Source</span>
                        <a href="tel:+250781691713" className={styles.phoneLink}>
                            <Phone size={14} /> +250 781 691 713
                        </a>
                    </div>
                </div>
            </div>

            {/* TIER 2: Main Header (Logo, Search, Icons) */}
            <div className={styles.mainHeader}>
                <div className={`${styles.container} ${styles.mainHeaderContent}`}>
                    {/* Logo Section */}
                    <div className={styles.logoSection}>
                        <Link to="/" className={styles.logo}>
                            <img src={logoImg} alt="Luz Technology" className={styles.logoImage} />
                        </Link>
                        <div className={styles.expertContact}>
                            <User size={18} className={styles.expertIcon} />
                            <div>
                                <span className={styles.expertTitle}>Ask Our Experts</span>
                                <span className={styles.expertPhone}>250781691713</span>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <form className={styles.searchContainer} onSubmit={handleSearch}>
                        <div className={styles.searchWrapper}>
                            <input
                                type="text"
                                placeholder="Search for products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                            <button type="submit" className={styles.searchButton}>
                                search
                            </button>
                        </div>
                    </form>

                    {/* Action Icons */}
                    <div className={styles.actionIcons}>
                        <Link to="/cart" className={styles.iconBtn}>
                            <div className={styles.cartIconWrapper}>
                                <ShoppingCart size={24} />
                                <span className={styles.cartBadge}>{getCartCount()}</span>
                            </div>
                            <span>My Cart</span>
                        </Link>

                        <Link to="/wishlist" className={styles.iconBtn}>
                            <Heart size={24} />
                            <span>Wishlist</span>
                        </Link>

                        <NotificationCenter />

                        <div className={styles.userProfile}>
                            {user ? (
                                <div className={styles.dropdown}>
                                    <button className={styles.profileBtn}>
                                        <User size={24} className={styles.profileIcon} />
                                        <div className={styles.profileText}>
                                            <span className={styles.profileLabel}>Hello, {user.firstName}</span>
                                            <span className={styles.profileValue}>Account & Orders</span>
                                        </div>
                                    </button>
                                    <div className={styles.dropdownContent}>
                                        <div className={styles.dropdownHeader}>Hello, {user.firstName}</div>
                                        <Link to="/profile">My Account</Link>
                                        <Link to="/orders">My Orders</Link>
                                        <Link to="/support/tickets">Support Tickets</Link>
                                        {(isAdmin() || isEmployee()) && (
                                            <Link to="/admin" className={styles.adminLink}>Dashboard</Link>
                                        )}
                                        <button onClick={logout} className={styles.logoutBtn}>
                                            <LogOut size={16} /> Log Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link to="/login" className={styles.profileBtn}>
                                    <User size={24} className={styles.profileIcon} />
                                    <div className={styles.profileText}>
                                        <span className={styles.profileLabel}>Hello, Log In</span>
                                        <span className={styles.profileValue}>Account & Orders</span>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className={styles.mobileToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>
            </div>

            {/* TIER 3: Navigation Bar
            <nav className={styles.navBar}>
                <div className={`${styles.container} ${styles.navContent}`}>
                    <Link to="/" className={styles.navItem}>Home</Link>

                    <div className={styles.navDropdown}>
                        <button className={styles.navItem} onClick={() => setIsCategoryOpen(!isCategoryOpen)}>
                            All Products <ChevronDown size={14} />
                        </button>
                        {isCategoryOpen && (
                            <div className={styles.megaMenu}>
                                <Link to="/store?category=networking">Networking</Link>
                                <Link to="/store?category=servers">Servers & Storage</Link>
                                <Link to="/store?category=computers">Computers</Link>
                                <Link to="/store?category=components">Components</Link>
                            </div>
                        )}
                    </div>

                    <Link to="/store?category=networking" className={styles.navItem}>Networking <ChevronDown size={14} /></Link>
                    <Link to="/store?category=servers" className={styles.navItem}>Servers <ChevronDown size={14} /></Link>
                    <Link to="/store?category=computers" className={styles.navItem}>Computer <ChevronDown size={14} /></Link>
                    <Link to="/store?category=software" className={styles.navItem}>Software <ChevronDown size={14} /></Link>
                    <Link to="/store?category=accessories" className={styles.navItem}>Accessories <ChevronDown size={14} /></Link>

                    <div className={styles.navDivider}></div>

                    <Link to="/support" className={styles.navItem}>Support</Link>
                </div>
            </nav>
            */}

            {/* Mobile Nav Overlay */}
            {isMenuOpen && (
                <div className={styles.mobileNav}>
                    <form className={styles.mobileSearch} onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit"><Search size={20} /></button>
                    </form>
                    <div className={styles.mobileLinks}>
                        <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/store" onClick={() => setIsMenuOpen(false)}>All Products</Link>
                        <Link to="/support" onClick={() => setIsMenuOpen(false)}>Support</Link>
                        {user ? (
                            <>
                                <Link to="/orders" onClick={() => setIsMenuOpen(false)}>My Orders</Link>
                                <button onClick={logout}>Log Out</button>
                            </>
                        ) : (
                            <Link to="/login" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
