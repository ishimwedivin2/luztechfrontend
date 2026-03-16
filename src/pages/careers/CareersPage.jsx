import React, { useEffect, useState } from 'react';
import { Briefcase, MapPin, Clock, ArrowRight, Layers, X, Upload } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Careers.module.css';

const CareersPage = () => {
    const { user } = useAuth();
    const [openings, setOpenings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isApplying, setIsApplying] = useState(false);
    const [appData, setAppData] = useState({ fullName: '', email: '', resumeUrl: '', coverLetter: '' });

    useEffect(() => {
        const fetchOpenings = async () => {
            try {
                const response = await api.get('/careers/openings');
                if (response.success) setOpenings(response.data);
            } catch (error) { console.error('Error fetching openings', error); }
            finally { setLoading(false); }
        };
        fetchOpenings();
    }, []);

    useEffect(() => {
        if (user) setAppData(prev => ({ ...prev, fullName: `${user.firstName} ${user.lastName}`, email: user.email }));
    }, [user]);

    const handleApply = async (e) => {
        e.preventDefault();
        setIsApplying(true);
        try {
            const res = await api.post(`/careers/openings/${selectedJob.id}/apply`, appData);
            if (res.success) {
                alert('Success! Your application has been submitted. Our team will review it shortly.');
                setSelectedJob(null);
            }
        } catch (e) { alert('Error applying: ' + (e.message || 'Server error')); }
        finally { setIsApplying(false); }
    };

    return (
        <div className={styles.careers}>
            {/* Header */}
            <section className={styles.hero}>
                <div className={`${styles.heroContent} container`}>
                    <h1>Build the Future of <span className={styles.highlight}>IT Infrastructure</span></h1>
                    <p>We're looking for passionate engineers, designers, and innovators to join our growing team.</p>
                </div>
            </section>

            {/* Benefits */}
            <section className={`${styles.benefits} container`}>
                <div className={styles.benefitsGrid}>
                    <div className={styles.benefitItem}>
                        <div className={styles.iconBox}><Clock size={24} /></div>
                        <h4>Flexible Work</h4>
                        <p>Hybrid and remote options for a perfect work-life balance.</p>
                    </div>
                    <div className={styles.benefitItem}>
                        <div className={styles.iconBox}><Layers size={24} /></div>
                        <h4>Career Growth</h4>
                        <p>Access to Luz Academy and paid professional certifications.</p>
                    </div>
                    <div className={styles.benefitItem}>
                        <div className={styles.iconBox}><Briefcase size={24} /></div>
                        <h4>Modern Stack</h4>
                        <p>Work with the latest in Cisco networking and software engineering.</p>
                    </div>
                </div>
            </section>

            {/* Job Openings */}
            <section className="container">
                <h2 className="section-title">Current Openings</h2>

                {loading ? (
                    <div className={styles.loading}>Loading opportunities...</div>
                ) : (
                    <div className={styles.jobList}>
                        {openings.length > 0 ? (
                            openings.map(job => (
                                <div key={job.id} className={styles.jobCard}>
                                    <div className={styles.jobMain}>
                                        <h3>{job.title}</h3>
                                        <div className={styles.jobMeta}>
                                            <span><MapPin size={16} /> {job.location || 'Kigali, Rwanda'}</span>
                                            <span><Clock size={16} /> {job.type || 'Full-time'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.jobTags}>
                                        {job.department && <span className={styles.tag}>{job.department}</span>}
                                    </div>
                                    <button className={styles.applyBtn} onClick={() => setSelectedJob(job)}>
                                        Apply Now <ArrowRight size={18} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            /* Fallback jobs if DB is empty */
                            <>
                                <div className={styles.jobCard}>
                                    <div className={styles.jobMain}>
                                        <h3>Senior Network Engineer</h3>
                                        <div className={styles.jobMeta}>
                                            <span><MapPin size={16} /> Hybrid, Rwanda</span>
                                            <span><Clock size={16} /> Full-time</span>
                                        </div>
                                    </div>
                                    <div className={styles.jobTags}>
                                        <span className={styles.tag}>Engineering</span>
                                    </div>
                                    <button className={styles.applyBtn} onClick={() => alert('Please login to apply')}>
                                        Apply Now <ArrowRight size={18} />
                                    </button>
                                </div>
                                <div className={styles.jobCard}>
                                    <div className={styles.jobMain}>
                                        <h3>Frontend Developer (React)</h3>
                                        <div className={styles.jobMeta}>
                                            <span><MapPin size={16} /> Remote</span>
                                            <span><Clock size={16} /> Full-time</span>
                                        </div>
                                    </div>
                                    <div className={styles.jobTags}>
                                        <span className={styles.tag}>Software</span>
                                    </div>
                                    <button className={styles.applyBtn} onClick={() => alert('Please login to apply')}>
                                        Apply Now <ArrowRight size={18} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {selectedJob && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h3>Apply: {selectedJob.title}</h3>
                                <button onClick={() => setSelectedJob(null)} className={styles.closeBtn}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleApply} className={styles.applyForm}>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input type="text" value={appData.fullName} onChange={e => setAppData({...appData, fullName: e.target.value})} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email Address</label>
                                    <input type="email" value={appData.email} onChange={e => setAppData({...appData, email: e.target.value})} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Resume Link (Google Drive/Dropbox)</label>
                                    <div className={styles.inputIcon}>
                                        <Upload size={16} />
                                        <input type="url" placeholder="https://..." value={appData.resumeUrl} onChange={e => setAppData({...appData, resumeUrl: e.target.value})} required />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Brief Cover Letter</label>
                                    <textarea rows="4" value={appData.coverLetter} onChange={e => setAppData({...appData, coverLetter: e.target.value})} required placeholder="Tell us why you are a great fit..." />
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" onClick={() => setSelectedJob(null)} className={styles.cancelBtn}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={isApplying}>
                                        {isApplying ? 'Processing...' : 'Submit Application'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
};

export default CareersPage;
