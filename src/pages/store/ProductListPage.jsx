import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Filter, Search, ChevronRight, SlidersHorizontal, Grid, List, Star, ShoppingCart, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';
import { resolveImageUrl } from '../../utils/imageUrl';
import styles from './Store.module.css';

const ProductListPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [sortBy, setSortBy] = useState('featured');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [wishlistIds, setWishlistIds] = useState([]);
    const [addedId, setAddedId] = useState(null);
    const { user } = useAuth();
    const { addToCart } = useCart();

    // Filter state
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [statusFilter, setStatusFilter] = useState('');

    const location = useLocation();
    const navigate = useNavigate();

    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || '';

    // Fetch categories from backend
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/products');
                if (response.success && response.data) {
                    // Extract unique categories from products (backend returns categoryId/categoryName)
                    const uniqueCategories = [];
                    const seen = new Set();
                    response.data.forEach(p => {
                        if (p.categoryId && !seen.has(p.categoryId)) {
                            seen.add(p.categoryId);
                            uniqueCategories.push({ id: p.categoryId, name: p.categoryName });
                        }
                    });
                    setCategories(uniqueCategories);
                }
            } catch (error) {
                console.error('Error fetching categories', error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                let endpoint = '/products';
                const params = new URLSearchParams();

                if (query) params.append('name', query);
                if (priceRange.min) params.append('minPrice', priceRange.min);
                if (priceRange.max) params.append('maxPrice', priceRange.max);
                if (statusFilter) params.append('status', statusFilter);

                if (params.toString()) {
                    endpoint = `/products/search?${params.toString()}`;
                }

                const response = await api.get(endpoint);
                if (response.success) {
                    setProducts(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching products', error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [query, statusFilter]);

    // Fetch wishlist
    useEffect(() => {
        const fetchWishlist = async () => {
            if (!user) return;
            try {
                const res = await api.get('/wishlist');
                if (res.success) {
                    setWishlistIds(res.data.map(item => item.product.id));
                }
            } catch (e) { console.error(e); }
        };
        fetchWishlist();
    }, [user]);

    const handleAddToCart = (e, product) => {
        e.stopPropagation();
        addToCart(product);
        setAddedId(product.id);
        setTimeout(() => setAddedId(null), 1500);
    };

    const toggleWishlist = async (e, productId) => {
        e.stopPropagation();
        if (!user) {
            navigate('/login');
            return;
        }

        const isAlreadyIn = wishlistIds.includes(productId);
        try {
            if (isAlreadyIn) {
                await api.delete(`/wishlist/${productId}`);
                setWishlistIds(prev => prev.filter(id => id !== productId));
            } else {
                await api.post(`/wishlist/${productId}`);
                setWishlistIds(prev => [...prev, productId]);
            }
        } catch (e) { console.error(e); }
    };

    // Apply client-side filtering and sorting
    useEffect(() => {
        let result = [...products];

        // Filter by selected categories
                if (selectedCategories.length > 0) {
            result = result.filter(p =>
                p.categoryId && selectedCategories.includes(p.categoryId)
            );
        }

        // Filter by category URL parameter
        if (categoryParam) {
            result = result.filter(p =>
                p.categoryName && p.categoryName.toLowerCase().includes(categoryParam.toLowerCase())
            );
        }

        // Filter by price range (client-side for instant feedback)
        if (priceRange.min) {
            result = result.filter(p => p.price >= parseFloat(priceRange.min));
        }
        if (priceRange.max) {
            result = result.filter(p => p.price <= parseFloat(priceRange.max));
        }

        // Sort
        switch (sortBy) {
            case 'price-low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'rating':
                result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
                break;
            default:
                break; // 'featured' - default order from API
        }

        setFilteredProducts(result);
    }, [products, selectedCategories, priceRange, sortBy, categoryParam]);

    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setPriceRange({ min: '', max: '' });
        navigate('/store');
    };

    const renderStars = (rating) => {
        const stars = [];
        const numRating = parseFloat(rating) || 0;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    size={14}
                    className={i <= numRating ? styles.starFilled : styles.starEmpty}
                    fill={i <= numRating ? '#f59e0b' : 'none'}
                />
            );
        }
        return stars;
    };

    return (
        <div className={`${styles.storeContainer} container`}>
            {/* Breadcrumbs */}
            <div className={styles.breadcrumbs}>
                <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
                <ChevronRight size={14} />
                <span onClick={() => navigate('/store')} style={{ cursor: 'pointer' }}>Store</span>
                {categoryParam && <><ChevronRight size={14} /> <span className={styles.activeBreadcrumb}>{categoryParam}</span></>}
                {query && <><ChevronRight size={14} /> <span className={styles.activeBreadcrumb}>Search: "{query}"</span></>}
            </div>

            {/* Mobile Filter Toggle */}
            <button
                className={styles.mobileFilterToggle}
                onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
                <SlidersHorizontal size={18} />
                {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <div className={styles.storeLayout}>
                {/* Sidebar Filters */}
                <aside className={`${styles.sidebar} ${showMobileFilters ? styles.sidebarMobileOpen : ''}`}>
                    <div className={styles.filterSection}>
                        <div className={styles.filterHeader}>
                            <h3><Filter size={18} /> Filters</h3>
                            {(selectedCategories.length > 0 || priceRange.min || priceRange.max) && (
                                <button className={styles.clearBtn} onClick={clearFilters}>Clear All</button>
                            )}
                        </div>

                        {/* Category Filter */}
                        <div className={styles.filterGroup}>
                            <h4>Category</h4>
                            <ul>
                                {categories.length > 0 ? (
                                    categories.map(cat => (
                                        <li key={cat.id}>
                                            <label className={styles.checkboxLabel}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(cat.id)}
                                                    onChange={() => toggleCategory(cat.id)}
                                                    className={styles.checkbox}
                                                />
                                                <span className={styles.checkmark}></span>
                                                {cat.name}
                                            </label>
                                        </li>
                                    ))
                                ) : (
                                    <>
                                        <li><label className={styles.checkboxLabel}><input type="checkbox" className={styles.checkbox} /><span className={styles.checkmark}></span>Networking</label></li>
                                        <li><label className={styles.checkboxLabel}><input type="checkbox" className={styles.checkbox} /><span className={styles.checkmark}></span>Servers & Storage</label></li>
                                        <li><label className={styles.checkboxLabel}><input type="checkbox" className={styles.checkbox} /><span className={styles.checkmark}></span>Computers</label></li>
                                        <li><label className={styles.checkboxLabel}><input type="checkbox" className={styles.checkbox} /><span className={styles.checkmark}></span>Racks & Infrastructure</label></li>
                                        <li><label className={styles.checkboxLabel}><input type="checkbox" className={styles.checkbox} /><span className={styles.checkmark}></span>Security</label></li>
                                        <li><label className={styles.checkboxLabel}><input type="checkbox" className={styles.checkbox} /><span className={styles.checkmark}></span>Accessories</label></li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Price Range */}
                        <div className={styles.filterGroup}>
                            <h4>Price Range</h4>
                            <div className={styles.priceInputs}>
                                <input
                                    type="number"
                                    placeholder="Min $"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                />
                                <span className={styles.priceSeparator}>—</span>
                                <input
                                    type="number"
                                    placeholder="Max $"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                />
                            </div>
                            {/* Quick price shortcuts */}
                            <div className={styles.priceShortcuts}>
                                <button onClick={() => setPriceRange({ min: '0', max: '100' })}>Under $100</button>
                                <button onClick={() => setPriceRange({ min: '100', max: '500' })}>$100 – $500</button>
                                <button onClick={() => setPriceRange({ min: '500', max: '1000' })}>$500 – $1K</button>
                                <button onClick={() => setPriceRange({ min: '1000', max: '' })}>$1K+</button>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className={styles.filterGroup}>
                            <h4>Availability</h4>
                            <ul>
                                <li>
                                    <label className={styles.checkboxLabel}>
                                        <input type="radio" name="status" checked={statusFilter === 'ACTIVE'} onChange={() => setStatusFilter('ACTIVE')} />
                                        <span>In Stock</span>
                                    </label>
                                </li>
                                <li>
                                    <label className={styles.checkboxLabel}>
                                        <input type="radio" name="status" checked={statusFilter === ''} onChange={() => setStatusFilter('')} />
                                        <span>All Items</span>
                                    </label>
                                </li>
                            </ul>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <main className={styles.mainContent}>
                    <div className={styles.gridHeader}>
                        <div className={styles.gridHeaderLeft}>
                            <h2>{query ? `Search Results for "${query}"` : categoryParam ? categoryParam : 'All Products'}</h2>
                            <span className={styles.resultCount}>{filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found</span>
                        </div>
                        <div className={styles.gridHeaderRight}>
                            <div className={styles.viewToggle}>
                                <button
                                    className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewBtnActive : ''}`}
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid size={18} />
                                </button>
                                <button
                                    className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewBtnActive : ''}`}
                                    onClick={() => setViewMode('list')}
                                >
                                    <List size={18} />
                                </button>
                            </div>
                            <div className={styles.sortControls}>
                                <span>Sort by:</span>
                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                                    <option value="featured">Featured</option>
                                    <option value="price-low">Price: Low to High</option>
                                    <option value="price-high">Price: High to Low</option>
                                    <option value="name">Name A-Z</option>
                                    <option value="rating">Top Rated</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loader}>
                            <div className={styles.spinner}></div>
                            <p>Loading products...</p>
                        </div>
                    ) : filteredProducts.length > 0 ? (
                        <div className={viewMode === 'grid' ? styles.productGrid : styles.productList}>
                            {filteredProducts.map(product => (
                                <div
                                    key={product.id}
                                    className={viewMode === 'grid' ? styles.productCard : styles.productCardList}
                                    onClick={() => navigate(`/product/${product.id}`)}
                                >
                                    <div className={styles.productImage}>
                                        {product.images?.[0] ? (
                                            <img src={resolveImageUrl(product.images[0])} alt={product.name} />
                                        ) : (
                                            <div className={styles.imagePlaceholder}>
                                                <ShoppingCart size={40} />
                                            </div>
                                        )}
                                        <button 
                                            className={`${styles.wishlistBtn} ${wishlistIds.includes(product.id) ? styles.wishlistBtnActive : ''}`} 
                                            onClick={(e) => toggleWishlist(e, product.id)}
                                        >
                                            <Heart size={18} fill={wishlistIds.includes(product.id) ? "#ef4444" : "none"} />
                                        </button>
                                        {product.discount && (
                                            <span className={styles.discountBadge}>
                                                -{product.discount.percentage}%
                                            </span>
                                        )}
                                    </div>
                                    <div className={styles.productInfo}>
                                        <p className={styles.categoryName}>
                                            {(product.categoryName ? product.categoryName.toUpperCase() : 'UNCATEGORIZED')}
                                        </p>
                                        <h3>{product.name}</h3>
                                        {viewMode === 'list' && product.description && (
                                            <p className={styles.productDescription}>{product.description}</p>
                                        )}
                                        {viewMode === 'list' && (
                                            <div className={styles.rating}>
                                                <div className={styles.stars}>
                                                    {renderStars(product.averageRating)}
                                                </div>
                                                <span className={styles.reviewCount}>
                                                    ({product.reviews?.length || 0} reviews)
                                                </span>
                                            </div>
                                        )}
                                        <div className={styles.cardFooter}>
                                            <div className={styles.priceRow}>
                                                <p className={styles.price}>${product.price?.toFixed(2)}</p>
                                                {product.discount && (
                                                    <p className={styles.oldPrice}>
                                                        ${(product.price / (1 - product.discount.percentage / 100)).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                className={`${styles.addToCartBtn} ${addedId === product.id ? styles.addToCartBtnAdded : ''}`}
                                                onClick={(e) => handleAddToCart(e, product)}
                                                disabled={product.status !== 'ACTIVE'}
                                            >
                                                <ShoppingCart size={14} />
                                                {addedId === product.id ? 'Added' : 'Add to Cart'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noResults}>
                            <Search size={48} />
                            <h3>No products found</h3>
                            <p>Try adjusting your search or filters to find what you're looking for.</p>
                            <button className={styles.clearFiltersBtn} onClick={clearFilters}>Clear All Filters</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ProductListPage;
