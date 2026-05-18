import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings, ShieldCheck, PlusCircle, Trash2, Edit, Eye, DollarSign, TrendingUp, Search, LifeBuoy, Clock, CheckCircle, Send, AlertTriangle, GraduationCap, Briefcase, FileText, Ticket, Percent, Info, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Admin.module.css';

const AdminDashboard = () => {
    const { user, isAdmin, isEmployee, isSupportAgent } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(isAdmin() || isEmployee() ? 'overview' : 'support');

    if (!user || (!isAdmin() && !isEmployee() && !isSupportAgent())) {
        return (
            <div className={styles.accessDenied}>
                <ShieldCheck size={64} />
                <h2>Access Denied</h2>
                <p>You don't have permission to view this page.</p>
                <button onClick={() => navigate('/')} className="btn-primary">Go Home</button>
            </div>
        );
    }

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.adminSidebar}>
                <div className={styles.adminBrand}>
                    <ShieldCheck size={24} color="#10b981" />
                    <span>Luz Admin</span>
                </div>
                <nav className={styles.adminNav}>
                    {[
                        { key: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview', roles: ['ADMIN', 'EMPLOYEE'] },
                        { key: 'products', icon: <Package size={20} />, label: 'Products', roles: ['ADMIN', 'EMPLOYEE'] },
                        { key: 'inventory', icon: <Settings size={20} />, label: 'Inventory', roles: ['ADMIN', 'EMPLOYEE'] },
                        { key: 'orders', icon: <ShoppingBag size={20} />, label: 'Orders', roles: ['ADMIN', 'EMPLOYEE'] },
                        { key: 'users', icon: <Users size={20} />, label: 'Customers', roles: ['ADMIN'] },
                        { key: 'analytics', icon: <BarChart3 size={20} />, label: 'Reports', roles: ['ADMIN'] },
                        { key: 'support', icon: <LifeBuoy size={20} />, label: 'Support', roles: ['ADMIN', 'SUPPORT'] },
                        { key: 'academy', icon: <GraduationCap size={20} />, label: 'Academy', roles: ['ADMIN'] },
                        { key: 'careers', icon: <Briefcase size={20} />, label: 'Careers', roles: ['ADMIN'] },
                        { key: 'discounts', icon: <Ticket size={20} />, label: 'Discounts', roles: ['ADMIN'] },
                        { key: 'audit', icon: <Clock size={20} />, label: 'Audit Logs', roles: ['ADMIN'] },
                    ].filter(item => {
                        if (isAdmin()) return true;
                        if (isEmployee() && item.roles.includes('EMPLOYEE')) return true;
                        if (isSupportAgent() && item.roles.includes('SUPPORT')) return true;
                        return false;
                    }).map(item => (
                        <button key={item.key} className={`${styles.navItem} ${activeTab === item.key ? styles.active : ''}`} onClick={() => setActiveTab(item.key)}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>
                <div className={styles.sidebarFooter}>
                    <button className={styles.navItem} onClick={() => navigate('/')}>← Back to Site</button>
                </div>
            </aside>

            <main className={styles.adminMain}>
                <header className={styles.adminHeader}>
                    <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                    <div className={styles.adminUser}>
                        <span>{user?.firstName} {user?.lastName}</span>
                        <div className={styles.avatar}>{user?.firstName?.[0]}</div>
                    </div>
                </header>
                <div className={styles.adminContent}>
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'products' && <ProductsTab />}
                    {activeTab === 'inventory' && <InventoryTab />}
                    {activeTab === 'orders' && <OrdersTab />}
                    {activeTab === 'users' && <UsersTab />}
                    {activeTab === 'analytics' && <AnalyticsTab />}
                    {activeTab === 'support' && <SupportTab />}
                    {activeTab === 'academy' && <AcademyTab />}
                    {activeTab === 'careers' && <CareersTab />}
                    {activeTab === 'discounts' && <DiscountsTab />}
                    {activeTab === 'audit' && <AuditTab />}
                </div>
            </main>
        </div>
    );
};

/* ===== OVERVIEW TAB ===== */
const OverviewTab = () => {
    const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [prodRes, orderRes] = await Promise.all([
                    api.get('/products'),
                    api.get('/orders')
                ]);
                setStats({
                    products: prodRes.data?.length || 0,
                    orders: orderRes.data?.length || 0,
                    revenue: orderRes.data?.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 0
                });
            } catch (e) { console.error(e); }
        };
        fetchStats();
    }, []);

    return (
        <div className={styles.statsGrid}>
            <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#dbeafe' }}><DollarSign size={24} color="#2563eb" /></div>
                <div><h4>Total Revenue</h4><div className={styles.statValue}>${stats.revenue.toFixed(2)}</div></div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#d1fae5' }}><ShoppingBag size={24} color="#059669" /></div>
                <div><h4>Total Orders</h4><div className={styles.statValue}>{stats.orders}</div></div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#fef3c7' }}><Package size={24} color="#d97706" /></div>
                <div><h4>Products</h4><div className={styles.statValue}>{stats.products}</div></div>
            </div>
            <div className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: '#ede9fe' }}><TrendingUp size={24} color="#7c3aed" /></div>
                <div><h4>Growth</h4><div className={styles.statValue}>+12.5%</div></div>
            </div>
        </div>
    );
};

/* ===== PRODUCTS TAB ===== */
const ProductsTab = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProducts = async () => {
        try {
            const res = await api.get('/products');
            if (res.success) setProducts(res.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try { await api.delete(`/products/${id}`); setProducts(prev => prev.filter(p => p.id !== id)); }
        catch (e) { alert('Error deleting product'); }
    };

    return (
        <div>
            <div className={styles.tabHeader}>
                <div className={styles.searchBox}><Search size={18} /><input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} /></div>
                <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}><PlusCircle size={18} /> Add Product</button>
            </div>
            {isAddModalOpen && <AddProductModal onClose={() => setIsAddModalOpen(false)} onAdded={fetchProducts} />}
            {editingProduct && <EditProductModal product={editingProduct} onClose={() => setEditingProduct(null)} onUpdated={fetchProducts} />}
            {loading ? <p>Loading...</p> : (
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className={styles.productCell}>
                                            <div className={styles.thumbSmall}>
                                                {p.images?.[0] ? (
                                                    <img src={`http://localhost:8080${p.images[0].url ? p.images[0].url : p.images[0]}`} alt="" />
                                                ) : '📦'}
                                            </div>
                                            <span>{p.name}</span>
                                        </div>
                                    </td>
                                    <td>{p.sku}</td>
                                    <td>{p.categoryName || '—'}</td>
                                    <td className={styles.priceCol}>${p.price?.toFixed(2)}</td>
                                    <td><span className={`${styles.badge} ${p.status === 'ACTIVE' ? styles.badgeGreen : styles.badgeGray}`}>{p.status}</span></td>
                                    <td><div className={styles.actionBtns}><button title="View"><Eye size={16} /></button><button title="Edit" onClick={() => setEditingProduct(p)}><Edit size={16} /></button><button title="Delete" onClick={() => handleDelete(p.id)}><Trash2 size={16} /></button></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filtered.length === 0 && <p className={styles.noData}>No products found.</p>}
                </div>
            )}
        </div>
    );
};

/* ===== ADD PRODUCT MODAL ===== */
const AddProductModal = ({ onClose, onAdded }) => {
    const [formData, setFormData] = useState({ name: '', description: '', price: '', sku: '', status: 'ACTIVE', categoryId: '' });
    const [files, setFiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/products/categories').then(res => setCategories(res.data || [])).catch(e => console.error(e));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            
            // Primary image (first one)
            if (files.length > 0) {
                data.append('file', files[0]);
            }

            const res = await api.post('/products/upload', data);
            
            if (res.success && files.length > 1) {
                const productId = res.data.id;
                // Upload additional images sequentially
                for (let i = 1; i < files.length; i++) {
                    const extraData = new FormData();
                    extraData.append('file', files[i]);
                    await api.post(`/products/${productId}/images`, extraData);
                }
            }

            if (res.success) {
                onAdded();
                onClose();
            }
        } catch (e) { const msg = e.response?.data?.message || e.response?.data || e.message; alert('Error: ' + msg); console.error(e); }
        finally { setLoading(false); }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                <h3>Add New Product</h3>
                <form onSubmit={handleSubmit} className={styles.adminForm}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Product Name</label>
                            <input id="product-name" name="name" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Price ($)</label>
                            <input id="product-price" name="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>SKU</label>
                            <input id="product-sku" name="sku" type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Category</label>
                            <select id="product-category" name="categoryId" value={formData.categoryId} onChange={e => setFormData({ ...formData, categoryId: e.target.value })} required>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea id="product-description" name="description" rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Product Images (First will be primary)</label>
                        <input id="product-images" name="file" type="file" onChange={e => setFiles(Array.from(e.target.files))} accept="image/*" multiple required />
                        {files.length > 0 && <p className={styles.fileCountHint}>{files.length} images selected</p>}
                    </div>
                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Uploading...' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ===== EDIT PRODUCT MODAL ===== */
const EditProductModal = ({ product, onClose, onUpdated }) => {
    const [formData, setFormData] = useState({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        sku: product.sku || '',
        status: product.status || 'ACTIVE'
    });
    const [images, setImages] = useState(product.images || []);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put(`/products/${product.id}`, formData);
            if (res.success) {
                onUpdated();
                onClose();
            }
        } catch (e) { alert('Error: ' + e.message); }
        finally { setLoading(false); }
    };

    const handleUploadImage = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const data = new FormData();
            data.append('file', file);
            const res = await api.post(`/products/${product.id}/images`, data);
            if (res.success) {
                setImages([...images, res.data]);
                onUpdated();
            }
        } catch (e) { const msg = e.response?.data?.message || e.response?.data || e.message; alert('Upload failed: ' + msg); console.error(e); }
        finally { setUploadingImage(false); }
    };

    const handleDeleteImage = async (imageId) => {
        if (!window.confirm('Remove this image?')) return;
        try {
            // Backend delete image endpoint assumed or logic to remove
            await api.patch(`/products/${product.id}/remove-image/${imageId}`);
            setImages(images.filter(img => img.id !== imageId));
            onUpdated();
        } catch (e) { 
            console.error(e);
            alert('Failed to delete image. Please check if this feature is fully implemented on the backend.'); 
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <h3>Edit Product: {product.name}</h3>
                <form onSubmit={handleSubmit} className={styles.adminForm}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Product Name</label>
                            <input id="edit-product-name" name="name" type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Price ($)</label>
                            <input id="edit-product-price" name="price" type="number" step="0.01" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>SKU</label>
                            <input id="edit-product-sku" name="sku" type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Status</label>
                            <select id="edit-product-status" name="status" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} required>
                                <option value="ACTIVE">Active</option>
                                <option value="DRAFT">Draft</option>
                                <option value="ARCHIVED">Archived</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea id="edit-product-description" name="description" rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                    </div>

                    <div className={styles.imageEditSection}>
                        <label>Manage Images</label>
                        <div className={styles.imageGrid}>
                            {images.map(img => (
                                <div key={img.id} className={styles.imageWrapper}>
                                    <img src={`http://localhost:8080${img.url}`} alt="" />
                                    <button type="button" className={styles.deleteBtnSmall} onClick={() => handleDeleteImage(img.id)}><Trash2 size={12} /></button>
                                    {img.isPrimary && <span className={styles.primaryTag}>Primary</span>}
                                </div>
                            ))}
                            <label className={styles.addImageCard}>
                                <input id="edit-product-image" name="file" type="file" onChange={handleUploadImage} accept="image/*" hidden disabled={uploadingImage} />
                                {uploadingImage ? '...' : <PlusCircle size={24} />}
                            </label>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


/* ===== ORDERS TAB ===== */
const OrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                if (res.success) setOrders(res.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchOrders();
    }, []);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/orders/${id}/status?status=${status}`);
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
        } catch (e) { alert('Error updating status'); }
    };

    return (
        <div>
            <div className={styles.tabHeader}><h3>{orders.length} Orders</h3></div>
            {loading ? <p>Loading...</p> : (
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead><tr><th>Order ID</th><th>Date</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {orders.map(o => (
                                <tr key={o.id}>
                                    <td className={styles.idCol}>{o.id?.substring(0, 8)}...</td>
                                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                                    <td className={styles.priceCol}>${o.totalAmount?.toFixed(2) || '—'}</td>
                                    <td><span className={`${styles.badge} ${o.status === 'DELIVERED' ? styles.badgeGreen : o.status === 'CANCELLED' ? styles.badgeRed : styles.badgeYellow}`}>{o.status}</span></td>
                                    <td>
                                        <select className={styles.statusSelect} value={o.status} onChange={e => updateStatus(o.id, e.target.value)}>
                                            <option value="PENDING">PENDING</option>
                                            <option value="PROCESSING">PROCESSING</option>
                                            <option value="SHIPPED">SHIPPED</option>
                                            <option value="DELIVERED">DELIVERED</option>
                                            <option value="CANCELLED">CANCELLED</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && <p className={styles.noData}>No orders yet.</p>}
                </div>
            )}
        </div>
    );
};

/* ===== USERS TAB (CRM) ===== */
const UsersTab = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [summary, setSummary] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/crm/customers');
            if (res.success) setUsers(res.data || []);
        } catch (e) {
            // Fallback to admin users endpoint if crm one fails
            try {
                const res = await api.get('/admin/users');
                if (res.success) setUsers(res.data || []);
            } catch (err) { console.error(err); }
        }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const fetchSummary = async (userId) => {
        setLoadingSummary(true);
        setSelectedUser(users.find(u => u.id === userId));
        try {
            const res = await api.get(`/crm/customers/${userId}/summary`);
            if (res.success) setSummary(res.data);
        } catch (e) { console.error(e); }
        finally { setLoadingSummary(false); }
    };

    const filteredUsers = users.filter(u => 
        u.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className={styles.tabHeader}>
                <h3>{users.length} Customers</h3>
                <div className={styles.searchWrapper} style={{ width: '300px' }}>
                    <Search size={18} />
                    <input 
                        type="text" 
                        placeholder="Search name or email..." 
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
            </div>

            {loading ? <p>Loading customers...</p> : (
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className={styles.nameAvatar}>
                                            <div className={styles.avatarSmall}>{u.firstName?.[0]}</div>
                                            <strong>{u.firstName} {u.lastName}</strong>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td><span className={`${styles.badge} ${u.role === 'ADMIN' ? styles.badgeGreen : styles.badgeGray}`}>{u.role}</span></td>
                                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button className="btn-primary btn-sm" onClick={() => fetchSummary(u.id)}>
                                            <Eye size={16} /> View Profile
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredUsers.length === 0 && <p className={styles.noData}>No customers found matching "{searchTerm}"</p>}
                </div>
            )}

            {selectedUser && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '900px', width: '95%' }}>
                        <div className={styles.modalHeader}>
                            <div className={styles.userDetailHeader}>
                                <div className={styles.avatarLarge}>{selectedUser.firstName?.[0]}</div>
                                <div>
                                    <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
                                    <p>{selectedUser.email}</p>
                                </div>
                            </div>
                            <button className={styles.cancelBtn} onClick={() => { setSelectedUser(null); setSummary(null); }}>Close</button>
                        </div>

                        {loadingSummary ? <p style={{ padding: '2rem' }}>Loading user intelligence...</p> : summary && (
                            <div className={styles.crmSummary}>
                                <div className={styles.crmStatsGrid}>
                                    <div className={styles.crmStatCard}>
                                        <label>Total Purchases</label>
                                        <div className={styles.statValue}>{summary.profile?.totalPurchases || 0}</div>
                                    </div>
                                    <div className={styles.crmStatCard}>
                                        <label>Total Spent</label>
                                        <div className={styles.statValue} style={{ color: '#059669' }}>${summary.profile?.totalSpent?.toFixed(2) || '0.00'}</div>
                                    </div>
                                    <div className={styles.crmStatCard}>
                                        <label>Segment</label>
                                        <div className={styles.badgeGreen} style={{ display: 'inline-block', marginTop: '0.5rem' }}>
                                            {summary.profile?.segment?.name || 'REGULAR'}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.crmSections}>
                                    <div className={styles.crmSection}>
                                        <h4><ShoppingBag size={18} /> Recent Orders</h4>
                                        <div className={styles.miniTable}>
                                            {summary.orders?.length > 0 ? summary.orders.slice(0, 5).map(o => (
                                                <div key={o.id} className={styles.miniRow}>
                                                    <span>#{o.orderNumber?.substring(0, 10)}</span>
                                                    <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                                                    <strong>${o.totalAmount?.toFixed(2)}</strong>
                                                    <span className={styles.badgeSmall}>{o.status}</span>
                                                </div>
                                            )) : <p className={styles.noDataSmall}>No orders yet.</p>}
                                        </div>
                                    </div>

                                    <div className={styles.crmSection}>
                                        <h4><LifeBuoy size={18} /> Support Activity</h4>
                                        <div className={styles.miniTable}>
                                            {summary.tickets?.length > 0 ? summary.tickets.slice(0, 5).map(t => (
                                                <div key={t.id} className={styles.miniRow}>
                                                    <span style={{ flex: 1 }}>{t.title}</span>
                                                    <span className={styles.badgeSmall}>{t.status}</span>
                                                </div>
                                            )) : <p className={styles.noDataSmall}>No support tickets.</p>}
                                        </div>
                                    </div>

                                    <div className={styles.crmSection}>
                                        <h4><GraduationCap size={18} /> Academy Enrollments</h4>
                                        <div className={styles.miniTable}>
                                            {summary.enrollments?.length > 0 ? summary.enrollments.map(e => (
                                                <div key={e.id} className={styles.miniRow}>
                                                    <span>{e.courseTitle || 'Course Enrollment'}</span>
                                                    <span className={styles.badgeSmall}>{e.status}</span>
                                                </div>
                                            )) : <p className={styles.noDataSmall}>Not enrolled in any courses.</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

/* ===== ANALYTICS TAB ===== */
const AnalyticsTab = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const today = new Date().toISOString().split('T')[0];
    const monthAgo = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/analytics/dashboard');
                setData(res.data || res);
            } catch (e) {
                // Fallback dummy data if endpoint fails to show UI
                setData({
                    totalRevenue: 12450.50,
                    totalOrders: 42,
                    topProducts: [
                        { name: 'Training Course Alpha', sales: 15, revenue: 4500 },
                        { name: 'Hardware Kit X', sales: 12, revenue: 3600 },
                        { name: 'Consultation Pro', sales: 8, revenue: 2400 }
                    ],
                    revenueByDay: [400, 600, 200, 800, 500, 700, 900]
                });
            } finally { setLoading(false); }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <p>Loading reports...</p>;

    return (
        <div className={styles.analyticsContainer}>
            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div><h4>Period Revenue</h4><div className={styles.statValue}>${data.totalRevenue?.toFixed(2)}</div></div>
                    <TrendingUp color="#10b981" />
                </div>
                <div className={styles.statCard}>
                    <div><h4>Period Orders</h4><div className={styles.statValue}>{data.totalOrders}</div></div>
                    <ShoppingBag color="#3b82f6" />
                </div>
            </div>

            <div className={styles.analyticsSecondaryGrid}>
                {/* Visual Bar Chart (CSS-based) */}
                <div className={styles.chartCard}>
                    <h3>Revenue Trend (Last 7 Days)</h3>
                    <div className={styles.barChart}>
                        {data.revenueByDay?.map((val, i) => (
                            <div key={i} className={styles.barWrapper}>
                                <div className={styles.bar} style={{ height: `${(val / 1000) * 100}%` }}>
                                    <span className={styles.barTooltip}>${val}</span>
                                </div>
                                <span className={styles.barLabel}>Day {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products Table */}
                <div className={styles.chartCard}>
                    <h3>Performance by Product</h3>
                    <div className={styles.miniTable}>
                        {data.topProducts?.map((p, i) => (
                            <div key={i} className={styles.miniRow}>
                                <span>{p.name}</span>
                                <strong>{p.sales} sales</strong>
                                <span className={styles.priceCol}>${p.revenue}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.reportButtons} style={{ marginTop: '2rem', justifyContent: 'flex-start' }}>
                <button className={styles.reportBtn} onClick={() => window.open(`http://localhost:8080/api/reports/sales?startDate=${monthAgo}&endDate=${today}`, '_blank')}>
                    <BarChart3 size={18} /> Download Detailed Export (.xlsx)
                </button>
            </div>
        </div>
    );
};

/* ===== INVENTORY TAB ===== */
const InventoryTab = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [adjustment, setAdjustment] = useState({ quantity: 0, reason: '', type: 'ADD' });

    const fetchInventory = async () => {
        try {
            const res = await api.get('/inventory');
            if (res.success) setItems(res.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleAdjust = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/inventory/${selectedItem.id}/adjust`, null, {
                params: {
                    quantity: adjustment.quantity,
                    reason: adjustment.reason,
                    type: adjustment.type
                }
            });
            setSelectedItem(null);
            fetchInventory();
        } catch (e) { alert('Error adjusting stock'); }
    };

    return (
        <div>
            <div className={styles.tabHeader}>
                <h3>Stock Control</h3>
                <button className={styles.reportBtn} onClick={() => api.get('/inventory/low-stock').then(res => setItems(res.data))}>
                    <AlertTriangle size={18} /> View Low Stock Only
                </button>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead><tr><th>Product Name</th><th>Current Stock</th><th>Threshold</th><th>Location</th><th>Actions</th></tr></thead>
                        <tbody>
                            {items.map(item => (
                                <tr key={item.id} className={item.quantity <= item.lowStockThreshold ? styles.lowStockRow : ''}>
                                    <td><strong>{item.product?.name || 'Unknown Product'}</strong><br /><small>{item.sku}</small></td>
                                    <td><span className={styles.statValue} style={{ fontSize: '1rem' }}>{item.quantity}</span></td>
                                    <td>{item.lowStockThreshold}</td>
                                    <td>{item.location || 'Warehouse A'}</td>
                                    <td>
                                        <button className="btn-primary btn-sm" onClick={() => setSelectedItem(item)}>
                                            <TrendingUp size={16} /> Adjust Stock
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedItem && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3>Adjust Stock: {selectedItem.product?.name}</h3>
                        <form onSubmit={handleAdjust}>
                            <div className={styles.formGroup}>
                                <label>Adjustment Type</label>
                                <select value={adjustment.type} onChange={e => setAdjustment({ ...adjustment, type: e.target.value })}>
                                    <option value="ADD">Restock (Add)</option>
                                    <option value="SUBTRACT">Sale/Damage (Subtract)</option>
                                    <option value="SET">Direct Correction (Set)</option>
                                </select>
                            </div>
                            <div className={styles.formGroup}>
                                <label>Quantity</label>
                                <input type="number" value={adjustment.quantity} onChange={e => setAdjustment({ ...adjustment, quantity: parseInt(e.target.value) })} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Reason/Note</label>
                                <textarea value={adjustment.reason} onChange={e => setAdjustment({ ...adjustment, reason: e.target.value })} required />
                            </div>
                            <div className={styles.formActions}>
                                <button type="button" onClick={() => setSelectedItem(null)} className={styles.cancelBtn}>Cancel</button>
                                <button type="submit" className="btn-primary">Confirm Adjustment</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ===== SUPPORT TAB ===== */
const SupportTab = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const { user } = useAuth();
    
    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await api.get('/support/tickets');
                if (res.success) setTickets(res.data || []);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchTickets();
    }, []);

    const fetchMessages = async (ticketId) => {
        try {
            const res = await api.get(`/support/tickets/${ticketId}/messages`);
            setMessages(res.data || []);
        } catch (e) { console.error(e); }
    };

    const handleSelectTicket = (ticket) => {
        setSelectedTicket(ticket);
        fetchMessages(ticket.id);
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;
        setSending(true);
        try {
            const res = await api.post(`/support/tickets/${selectedTicket.id}/messages`, { message: newMessage });
            if (res.success) {
                setMessages([...messages, res.data]);
                setNewMessage('');
            }
        } catch (e) { alert('Failed to send reply'); }
        finally { setSending(false); }
    };

    const closeTicket = async (id) => {
        try {
            await api.patch(`/support/tickets/${id}/close`);
            setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'CLOSED' } : t));
            if (selectedTicket?.id === id) setSelectedTicket({ ...selectedTicket, status: 'CLOSED' });
        } catch (e) { alert('Failed to close ticket'); }
    };

    if (loading) return <p>Loading support...</p>;

    return (
        <div className={styles.supportManagement}>
            <div className={styles.ticketSidebar}>
                <div className={styles.tabHeader}><h3>{tickets.length} Tickets</h3></div>
                <div className={styles.adminTicketGrid}>
                    {tickets.map(t => (
                        <div key={t.id} className={`${styles.adminTicketCard} ${selectedTicket?.id === t.id ? styles.adminTicketCardActive : ''}`} onClick={() => handleSelectTicket(t)}>
                            <div className={styles.ticketMeta}>
                                <span className={t.status === 'CLOSED' ? styles.badgeGray : styles.badgeGreen}>{t.status}</span>
                                <span className={styles.dateSmall}>{new Date(t.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h4>{t.title}</h4>
                            <p>Client: {t.customer?.firstName} {t.customer?.lastName}</p>
                        </div>
                    ))}
                    {tickets.length === 0 && <p className={styles.noData}>No support tickets found.</p>}
                </div>
            </div>
            
            <div className={styles.conversationPanel}>
                {selectedTicket ? (
                    <div className={styles.adminChatView}>
                        <header className={styles.adminChatHeader}>
                            <div>
                                <h2>{selectedTicket.title}</h2>
                                <p>Issue described by {selectedTicket.customer?.firstName} {selectedTicket.customer?.lastName}</p>
                            </div>
                            <button className="btn-primary" onClick={() => closeTicket(selectedTicket.id)} disabled={selectedTicket.status === 'CLOSED'}>
                                {selectedTicket.status === 'CLOSED' ? <><CheckCircle size={16} /> Resolved</> : 'Close Ticket'}
                            </button>
                        </header>
                        
                        <div className={styles.adminChatMessages}>
                            <div className={styles.initialDescription}>
                                <strong>Problem Description:</strong>
                                <p>{selectedTicket.description}</p>
                            </div>
                            {messages.map((m, i) => (
                                <div key={i} className={`${styles.adminMsgBubble} ${m.sender?.id === user?.id ? styles.adminMyMsg : styles.adminOtherMsg}`}>
                                    <div className={styles.msgText}>
                                        <p>{m.message}</p>
                                        <span className={styles.msgTime}>{new Date(m.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form className={styles.adminReplyArea} onSubmit={handleReply}>
                            <textarea 
                                placeholder="Write your response..." 
                                value={newMessage} 
                                onChange={e => setNewMessage(e.target.value)}
                                disabled={selectedTicket.status === 'CLOSED'}
                            ></textarea>
                            <button type="submit" className="btn-primary" disabled={sending || !newMessage.trim() || selectedTicket.status === 'CLOSED'}>
                                {sending ? '...' : <Send size={20} />}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className={styles.emptyConversation}>
                        <MessageSquare size={64} opacity={0.2} />
                        <p>Select a ticket from the left to view conversation details and reply to the customer.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ===== ACADEMY TAB ===== */
const AcademyTab = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewingEnrollments, setViewingEnrollments] = useState(null);

    const fetchCourses = async () => {
        try {
            const res = await api.get('/academy/courses');
            setCourses(res.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this course?')) return;
        try {
            await api.delete(`/academy/courses/${id}`);
            setCourses(prev => prev.filter(c => c.id !== id));
        } catch (e) { alert('Failed to delete course'); }
    };

    return (
        <div>
            <div className={styles.tabHeader}>
                <h3>{courses.length} Courses Offered</h3>
                <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}><PlusCircle size={18} /> Internal / Training Course</button>
            </div>

            {loading ? <p>Loading Academy...</p> : (
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead><tr><th>Course Title</th><th>Instructor</th><th>Type</th><th>Duration</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {courses.map(c => (
                                <tr key={c.id}>
                                    <td><strong>{c.title}</strong></td>
                                    <td>{c.instructor}</td>
                                    <td><span className={styles.badge}>{c.type}</span></td>
                                    <td>{c.duration}</td>
                                    <td>{c.price === 0 ? 'FREE' : `$${c.price}`}</td>
                                    <td><span className={`${styles.badge} ${c.status === 'ACTIVE' ? styles.badgeGreen : styles.badgeGray}`}>{c.status}</span></td>
                                    <td>
                                        <div className={styles.actionBtns}>
                                            <button title="View Enrollments" onClick={() => setViewingEnrollments(c)}><Users size={16} /></button>
                                            <button title="Edit"><Edit size={16} /></button>
                                            <button title="Delete" onClick={() => handleDelete(c.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isAddModalOpen && (
                <AddCourseModal onClose={() => setIsAddModalOpen(false)} onAdded={fetchCourses} />
            )}

            {viewingEnrollments && (
                <EnrollmentsModal course={viewingEnrollments} onClose={() => setViewingEnrollments(null)} />
            )}
        </div>
    );
};

/* ===== ADD COURSE MODAL ===== */
const AddCourseModal = ({ onClose, onAdded }) => {
    const [formData, setFormData] = useState({ title: '', description: '', instructor: '', duration: '', price: 0, type: 'TRAINING', status: 'UPCOMING' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/academy/courses', formData);
            if (res.success) {
                onAdded();
                onClose();
            }
        } catch (e) { alert('Error: ' + e.message); }
        finally { setLoading(false); }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                <h3>Add New Course / Internship</h3>
                <form onSubmit={handleSubmit} className={styles.adminForm}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Title</label>
                            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Instructor</label>
                            <input type="text" value={formData.instructor} onChange={e => setFormData({ ...formData, instructor: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Duration</label>
                            <input type="text" placeholder="e.g. 3 Months" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Price ($)</label>
                            <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Type</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required>
                                <option value="TRAINING">TRAINING</option>
                                <option value="INTERNSHIP">INTERNSHIP</option>
                                <option value="CERTIFICATION">CERTIFICATION</option>
                                <option value="WORKSHOP">WORKSHOP</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Status</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} required>
                                <option value="UPCOMING">UPCOMING</option>
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="COMPLETED">COMPLETED</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                    </div>
                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Post Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ===== ENROLLMENTS MODAL ===== */
const EnrollmentsModal = ({ course, onClose }) => {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/academy/enrollments/${course.id}`)
            .then(res => setEnrollments(res.data || []))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [course.id]);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/academy/enrollments/${id}/status?status=${status}`);
            setEnrollments(prev => prev.map(e => e.id === id ? { ...e, status } : e));
        } catch (e) { alert('Failed to update enrollment status'); }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: '800px' }}>
                <div className={styles.tabHeader}>
                    <h3>Enrollments: {course.title}</h3>
                    <button className={styles.cancelBtn} onClick={onClose}>Close</button>
                </div>
                {loading ? <p>Loading enrollments...</p> : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead><tr><th>Student Name</th><th>Email</th><th>Applied On</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {enrollments.map(e => (
                                    <tr key={e.id}>
                                        <td>{e.studentName}</td>
                                        <td>{e.email}</td>
                                        <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                                        <td><span className={`${styles.badge} ${e.status === 'APPROVED' ? styles.badgeGreen : e.status === 'REJECTED' ? styles.badgeRed : styles.badgeYellow}`}>{e.status}</span></td>
                                        <td>
                                            <select className={styles.statusSelect} value={e.status} onChange={(evt) => updateStatus(e.id, evt.target.value)}>
                                                <option value="PENDING">PENDING</option>
                                                <option value="APPROVED">APPROVED</option>
                                                <option value="REJECTED">REJECTED</option>
                                                <option value="COMPLETED">COMPLETED</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {enrollments.length === 0 && <p className={styles.noData}>No enrollments found for this course.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ===== CAREERS TAB ===== */
const CareersTab = () => {
    const [openings, setOpenings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewingApplications, setViewingApplications] = useState(null);

    const fetchOpenings = async () => {
        try {
            const res = await api.get('/careers/openings');
            setOpenings(res.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        fetchOpenings();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this job opening?')) return;
        try {
            await api.delete(`/careers/openings/${id}`);
            setOpenings(prev => prev.filter(o => o.id !== id));
        } catch (e) { alert('Failed to delete job opening'); }
    };

    return (
        <div>
            <div className={styles.tabHeader}>
                <h3>{openings.length} Active Job Openings</h3>
                <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}><PlusCircle size={18} /> Post New Job</button>
            </div>

            {loading ? <p>Loading Careers...</p> : (
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead><tr><th>Job Title</th><th>Location</th><th>Type</th><th>Salary Range</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {openings.map(o => (
                                <tr key={o.id}>
                                    <td><strong>{o.title}</strong></td>
                                    <td>{o.location}</td>
                                    <td><span className={styles.badge}>{o.type}</span></td>
                                    <td>{o.salaryRange}</td>
                                    <td><span className={`${styles.badge} ${o.status === 'OPEN' ? styles.badgeGreen : styles.badgeGray}`}>{o.status}</span></td>
                                    <td>
                                        <div className={styles.actionBtns}>
                                            <button title="View Applications" onClick={() => setViewingApplications(o)}><FileText size={16} /></button>
                                            <button title="Edit"><Edit size={16} /></button>
                                            <button title="Delete" onClick={() => handleDelete(o.id)}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isAddModalOpen && (
                <AddJobModal onClose={() => setIsAddModalOpen(false)} onAdded={fetchOpenings} />
            )}

            {viewingApplications && (
                <ApplicationsModal job={viewingApplications} onClose={() => setViewingApplications(null)} />
            )}
        </div>
    );
};

/* ===== ADD JOB MODAL ===== */
const AddJobModal = ({ onClose, onAdded }) => {
    const [formData, setFormData] = useState({ title: '', description: '', requirements: '', location: '', salaryRange: '', type: 'FULL_TIME', status: 'OPEN' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/careers/openings', formData);
            if (res.success) {
                onAdded();
                onClose();
            }
        } catch (e) { alert('Error: ' + e.message); }
        finally { setLoading(false); }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: '700px' }}>
                <h3>Post New Job Vacancy</h3>
                <form onSubmit={handleSubmit} className={styles.adminForm}>
                    <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                            <label>Job Title</label>
                            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Location</label>
                            <input type="text" placeholder="e.g. Kigali / Remote" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Type</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} required>
                                <option value="FULL_TIME">FULL TIME</option>
                                <option value="PART_TIME">PART TIME</option>
                                <option value="CONTRACT">CONTRACT</option>
                                <option value="INTERN">INTERN</option>
                                <option value="REMOTE">REMOTE</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Status</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} required>
                                <option value="OPEN">OPEN</option>
                                <option value="CLOSED">CLOSED</option>
                                <option value="DRAFT">DRAFT</option>
                            </select>
                        </div>
                        <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                            <label>Salary Range</label>
                            <input type="text" placeholder="e.g. $1000 - $2000" value={formData.salaryRange} onChange={e => setFormData({ ...formData, salaryRange: e.target.value })} />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea rows="3" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Requirements</label>
                        <textarea rows="3" value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} required />
                    </div>
                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Posting...' : 'Post Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ===== APPLICATIONS MODAL ===== */
const ApplicationsModal = ({ job, onClose }) => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get(`/careers/applications/${job.id}`)
            .then(res => setApplications(res.data || []))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [job.id]);

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`/careers/applications/${id}/status?status=${status}`);
            setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
        } catch (e) { alert('Failed to update application status'); }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent} style={{ maxWidth: '800px' }}>
                <div className={styles.tabHeader}>
                    <h3>Applications: {job.title}</h3>
                    <button className={styles.cancelBtn} onClick={onClose}>Close</button>
                </div>
                {loading ? <p>Loading applications...</p> : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead><tr><th>Applicant Name</th><th>Email</th><th>Resume/Link</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {applications.map(a => (
                                    <tr key={a.id}>
                                        <td>{a.fullName}</td>
                                        <td>{a.email}</td>
                                        <td><a href={a.resumeUrl} target="_blank" rel="noreferrer">View CV</a></td>
                                        <td><span className={`${styles.badge} ${a.status === 'HIRED' ? styles.badgeGreen : a.status === 'REJECTED' ? styles.badgeRed : styles.badgeYellow}`}>{a.status}</span></td>
                                        <td>
                                            <select className={styles.statusSelect} value={a.status} onChange={(evt) => updateStatus(a.id, evt.target.value)}>
                                                <option value="PENDING">PENDING</option>
                                                <option value="REVIEWING">REVIEWING</option>
                                                <option value="INTERVIEWING">INTERVIEWING</option>
                                                <option value="HIRED">HIRED</option>
                                                <option value="REJECTED">REJECTED</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {applications.length === 0 && <p className={styles.noData}>No applications found for this opening.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ===== DISCOUNTS & COUPONS TAB ===== */
const DiscountsTab = () => {
    const [view, setView] = useState('coupons'); // 'coupons' or 'rules'
    const [coupons, setCoupons] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [view]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (view === 'coupons') {
                const res = await api.get('/finance/coupons');
                setCoupons(res.data || []);
            } else {
                const res = await api.get('/products/discounts');
                setRules(res.data || []);
            }
        } catch (e) {
            console.error(e);
            // demo fallbacks
            if (view === 'coupons') setCoupons([{ id: '1', code: 'SPRING20', amount: 20, type: 'PERCENTAGE', active: true, usageLimit: 100, currentUsage: 45 }]);
            else setRules([{ id: '1', name: 'Summer Sale', discountPercentage: 15, active: true }]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this?')) return;
        try {
            const endpoint = view === 'coupons' ? `/finance/coupons/${id}` : `/products/discounts/${id}`;
            await api.delete(endpoint);
            fetchData();
        } catch (e) { alert('Delete failed'); }
    };

    return (
        <div className={styles.discountsContainer}>
            <div className={styles.tabHeader}>
                <div className={styles.toggleGroup}>
                    <button className={`${styles.toggleBtn} ${view === 'coupons' ? styles.toggleActive : ''}`} onClick={() => setView('coupons')}>Checkout Coupons</button>
                    <button className={`${styles.toggleBtn} ${view === 'rules' ? styles.toggleActive : ''}`} onClick={() => setView('rules')}>Product Discounts</button>
                </div>
                <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                    <PlusCircle size={18} /> New {view === 'coupons' ? 'Coupon' : 'Rule'}
                </button>
            </div>

            {loading ? <div className={styles.loadingState}>Refreshing promotional data...</div> : (
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            {view === 'coupons' ? (
                                <tr><th>Code</th><th>Value</th><th>Type</th><th>Usage</th><th>Status</th><th>Actions</th></tr>
                            ) : (
                                <tr><th>Name</th><th>Discount</th><th>Starts</th><th>Ends</th><th>Status</th><th>Actions</th></tr>
                            )}
                        </thead>
                        <tbody>
                            {view === 'coupons' ? coupons.map(c => (
                                <tr key={c.id}>
                                    <td><strong>{c.code}</strong></td>
                                    <td>{c.amount}{c.type === 'PERCENTAGE' ? '%' : '$'}</td>
                                    <td><span className={styles.badgeGray}>{c.type}</span></td>
                                    <td>{c.currentUsage} / {c.usageLimit || '∞'}</td>
                                    <td><span className={`${styles.badge} ${c.active ? styles.badgeGreen : styles.badgeRed}`}>{c.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
                                    <td><div className={styles.actionBtns}><button onClick={() => handleDelete(c.id)}><Trash2 size={16} /></button></div></td>
                                </tr>
                            )) : rules.map(r => (
                                <tr key={r.id}>
                                    <td><strong>{r.name}</strong></td>
                                    <td>{r.discountPercentage}%</td>
                                    <td>{r.startDate ? new Date(r.startDate).toLocaleDateString() : 'Immediate'}</td>
                                    <td>{r.endDate ? new Date(r.endDate).toLocaleDateString() : 'No Limit'}</td>
                                    <td><span className={`${styles.badge} ${r.active ? styles.badgeGreen : styles.badgeRed}`}>{r.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
                                    <td><div className={styles.actionBtns}><button onClick={() => handleDelete(r.id)}><Trash2 size={16} /></button></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(view === 'coupons' ? coupons : rules).length === 0 && <div className={styles.noData}>No {view} active at the moment.</div>}
                </div>
            )}

            {showAddModal && <AddPromotionModal type={view} onClose={() => setShowAddModal(false)} onAdded={fetchData} />}
        </div>
    );
};

const AddPromotionModal = ({ type, onClose, onAdded }) => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(type === 'coupons' ? {
        code: '', amount: '', type: 'PERCENTAGE', usageLimit: '', minimumOrderAmount: '', active: true
    } : {
        name: '', description: '', discountPercentage: '', active: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const endpoint = type === 'coupons' ? '/finance/coupons' : '/products/discounts';
            await api.post(endpoint, form);
            onAdded();
            onClose();
        } catch (e) { alert('Error creating ' + type); }
        finally { setLoading(false); }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>Create New {type === 'coupons' ? 'Promo Coupon' : 'Discount Rule'}</h3>
                <form onSubmit={handleSubmit} className={styles.adminForm}>
                    {type === 'coupons' ? (
                        <>
                            <div className={styles.formGroup}>
                                <label>Coupon Code (e.g. SAVE20)</label>
                                <input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required placeholder="SAVE20" />
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Amount</label>
                                    <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Type</label>
                                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                        <option value="PERCENTAGE">Percentage (%)</option>
                                        <option value="FIXED">Fixed Amount ($)</option>
                                    </select>
                                </div>
                            </div>
                            <div className={styles.formGrid}>
                                <div className={styles.formGroup}>
                                    <label>Usage Limit</label>
                                    <input type="number" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Min Order Spend</label>
                                    <input type="number" value={form.minimumOrderAmount} onChange={e => setForm({...form, minimumOrderAmount: e.target.value})} />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.formGroup}>
                                <label>Rule Name</label>
                                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Discount Percentage (%)</label>
                                <input type="number" value={form.discountPercentage} onChange={e => setForm({...form, discountPercentage: e.target.value})} required />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Description</label>
                                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                            </div>
                        </>
                    )}
                    <div className={styles.formActions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create Promotion'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ===== AUDIT LOGS TAB ===== */
const AuditTab = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchEmail, setSearchEmail] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedLog, setSelectedLog] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchLogs = async (p = page) => {
        setLoading(true);
        try {
            let endpoint = '/admin/audit';
            const params = new URLSearchParams({
                page: p,
                size: 20,
                sort: 'timestamp,desc'
            });

            if (searchEmail) {
                endpoint = '/admin/audit/search';
                params.append('email', searchEmail);
            }

            const res = await api.get(`${endpoint}?${params.toString()}`);
            if (res.success && res.data) {
                setLogs(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);
            }
        } catch (e) {
            console.error('Error fetching logs', e);
            // demo fallback
            setLogs([
                { id: '1', userEmail: 'admin@luz.com', action: 'LOGIN', resource: '/api/auth/login', ipAddress: '192.168.1.1', status: 'SUCCESS', timestamp: new Date().toISOString() },
                { id: '2', userEmail: 'user@test.com', action: 'ORDER_CREATE', resource: '/api/orders', ipAddress: '10.0.0.5', status: 'SUCCESS', timestamp: new Date().toISOString() },
                { id: '3', userEmail: 'intruder@hack.com', action: 'LOGIN_FAILURE', resource: '/api/auth/login', ipAddress: '45.1.2.3', status: 'FAILURE', timestamp: new Date().toISOString(), details: 'Invalid credentials attempted 5 times.' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(0);
        setPage(0);
    }, [searchEmail]);

    const handleNextPage = () => {
        if (page < totalPages - 1) {
            const next = page + 1;
            setPage(next);
            fetchLogs(next);
        }
    };

    const handlePrevPage = () => {
        if (page > 0) {
            const prev = page - 1;
            setPage(prev);
            fetchLogs(prev);
        }
    };

    const filteredLogs = statusFilter 
        ? logs.filter(l => l.status === statusFilter)
        : logs;

    return (
        <div className={styles.auditContainer}>
            <div className={styles.tabHeader}>
                <div className={styles.searchWrapper} style={{ width: '350px' }}>
                    <Search size={18} />
                    <input 
                        placeholder="Search by User Email..." 
                        value={searchEmail}
                        onChange={e => setSearchEmail(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <div className={styles.filterGroupRow}>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={styles.statusSelect}>
                        <option value="">All Statuses</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILURE">Failure</option>
                    </select>
                    <button className={styles.refreshBtn} onClick={() => fetchLogs(page)} title="Refresh logs"><Clock size={18} /></button>
                </div>
            </div>

            {loading ? <div className={styles.loadingState} style={{ padding: '4rem', textAlign: 'center' }}>Loading audit logs...</div> : (
                <div className={styles.tableWrapper}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Resource</th>
                                <th>IP Address</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map(log => (
                                <tr key={log.id} className={log.status === 'FAILURE' ? styles.errorRow : ''}>
                                    <td className={styles.timeCol}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className={styles.emailCol}><strong>{log.userEmail || 'System'}</strong></td>
                                    <td><span className={styles.actionBadge}>{log.action}</span></td>
                                    <td className={styles.resourceCol}><code>{log.resource}</code></td>
                                    <td>{log.ipAddress}</td>
                                    <td>
                                        <span className={`${styles.badge} ${log.status === 'SUCCESS' ? styles.badgeGreen : styles.badgeRed}`}>
                                            {log.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className={styles.iconBtn} onClick={() => setSelectedLog(log)} title="View Details">
                                            <Info size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredLogs.length === 0 && (
                        <div className={styles.noData} style={{ padding: '4rem', textAlign: 'center' }}>
                            <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto 1rem', display: 'block' }} />
                            <p>No audit logs found for the selected criteria.</p>
                        </div>
                    )}

                    <div className={styles.pagination} style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
                        <button className="btn-secondary btn-sm" disabled={page === 0} onClick={handlePrevPage}>Previous</button>
                        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Page {page + 1} of {totalPages || 1}</span>
                        <button className="btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={handleNextPage}>Next</button>
                    </div>
                </div>
            )}

            {selectedLog && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
                        <div className={styles.modalHeader}>
                            <h3>Audit Log Details</h3>
                            <button onClick={() => setSelectedLog(null)} className={styles.closeBtn}><X size={20} /></button>
                        </div>
                        <div className={styles.logDetails} style={{ padding: '1rem' }}>
                            <div className={styles.detailItem} style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Action Targeted</label>
                                <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{selectedLog.action}</span>
                            </div>
                            <div className={styles.detailGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                                <div className={styles.detailItem}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Timestamp</label>
                                    <span style={{ fontSize: '0.9rem' }}>{new Date(selectedLog.timestamp).toLocaleString()}</span>
                                </div>
                                <div className={styles.detailItem}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>IP Address</label>
                                    <span style={{ fontSize: '0.9rem' }}>{selectedLog.ipAddress}</span>
                                </div>
                            </div>
                            <div className={styles.detailItem}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>Technical Details / Payload</label>
                                <pre style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0', marginTop: '0.5rem' }}>
                                    {selectedLog.details || 'No additional details available for this action.'}
                                </pre>
                            </div>
                        </div>
                        <div className={styles.modalActions}>
                            <button className="btn-primary" onClick={() => setSelectedLog(null)}>Close Viewer</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;


