import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Shield, Save, Camera, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Profile.module.css';

const ProfilePage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [saved, setSaved] = useState(false);

    const [profile, setProfile] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || '',
        city: 'Kigali',
        country: 'Rwanda'
    });

    if (!user) {
        navigate('/login');
        return null;
    }

    const handleSave = async () => {
        try {
            const response = await api.put('/users/profile', profile);
            if (response.success) {
                // Update local storage user data
                const updatedUser = { ...user, ...response.data };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setIsEditing(false);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error updating profile', error);
            alert('Failed to update profile');
        }
    };

    return (
        <div className={`${styles.profilePage} container`}>
            <h1 className={styles.pageTitle}>My Account</h1>

            <div className={styles.profileLayout}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <div className={styles.avatarSection}>
                        <div className={styles.avatar}>
                            <span>{user.firstName?.[0]}{user.lastName?.[0]}</span>
                            <button className={styles.avatarEdit}><Camera size={14} /></button>
                        </div>
                        <h3>{user.firstName} {user.lastName}</h3>
                        <p>{user.email}</p>
                        <span className={styles.roleBadge}>{user.role || 'Customer'}</span>
                    </div>
                    <nav className={styles.profileNav}>
                        <button className={styles.navActive}>Profile Details</button>
                        <button onClick={() => navigate('/orders')}>My Orders</button>
                        <button onClick={() => navigate('/support')}>Support Tickets</button>
                        <button onClick={() => navigate('/wishlist')}>Wishlist</button>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className={styles.mainContent}>
                    {saved && (
                        <div className={styles.successAlert}>
                            <Shield size={18} /> Profile updated successfully!
                        </div>
                    )}

                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h2>Personal Information</h2>
                            <button className={styles.editBtn} onClick={() => setIsEditing(!isEditing)}>
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>

                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label><User size={16} /> First Name</label>
                                <input type="text" value={profile.firstName} disabled={!isEditing} onChange={e => setProfile({ ...profile, firstName: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label><User size={16} /> Last Name</label>
                                <input type="text" value={profile.lastName} disabled={!isEditing} onChange={e => setProfile({ ...profile, lastName: e.target.value })} />
                            </div>
                            <div className={styles.formGroup}>
                                <label><Mail size={16} /> Email</label>
                                <input type="email" value={profile.email} disabled className={styles.disabledField} />
                            </div>
                            <div className={styles.formGroup}>
                                <label><Phone size={16} /> Phone</label>
                                <input type="tel" value={profile.phoneNumber} disabled={!isEditing} placeholder="+250..." onChange={e => setProfile({ ...profile, phoneNumber: e.target.value })} />
                            </div>
                            <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                <label><MapPin size={16} /> Address</label>
                                <input type="text" value={profile.address} disabled={!isEditing} placeholder="Your shipping address" onChange={e => setProfile({ ...profile, address: e.target.value })} />
                            </div>
                        </div>

                        {isEditing && (
                            <div className={styles.cardActions}>
                                <button className="btn-primary" onClick={handleSave}><Save size={18} /> Save Changes</button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePage;
