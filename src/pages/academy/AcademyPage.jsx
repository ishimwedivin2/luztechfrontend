import React, { useEffect, useState } from 'react';
import { BookOpen, Award, Users, Search, PlayCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import styles from './Academy.module.css';

const AcademyPage = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollmentData, setEnrollmentData] = useState({ studentName: '', email: '', motivation: '' });

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const response = await api.get('/academy/courses');
                if (response.success) setCourses(response.data);
            } catch (error) { console.error('Error fetching courses', error); }
            finally { setLoading(false); }
        };
        fetchCourses();
    }, []);

    useEffect(() => {
        if (user) setEnrollmentData(prev => ({ ...prev, studentName: `${user.firstName} ${user.lastName}`, email: user.email }));
    }, [user]);

    const handleEnroll = async (e) => {
        e.preventDefault();
        setIsEnrolling(true);
        try {
            const res = await api.post(`/academy/courses/${selectedCourse.id}/enroll`, enrollmentData);
            if (res.success) {
                alert('Enrollment application submitted! Check your email for next steps.');
                setSelectedCourse(null);
            }
        } catch (e) { alert('Error submitting enrollment: ' + (e.message || 'Server error')); }
        finally { setIsEnrolling(false); }
    };

    return (
        <div className={styles.academy}>
            {/* Academy Hero */}
            <section className={styles.hero}>
                <div className={`${styles.heroContent} container`}>
                    <div className={styles.badge}>Luz Technology Academy</div>
                    <h1>Advance Your <span className={styles.highlight}>IT Career</span></h1>
                    <p>Join thousands of students learning networking, security, and cloud engineering from industry experts.</p>
                    <div className={styles.stats}>
                        <div className={styles.stat}><Users size={20} /> <span>5,000+ Students</span></div>
                        <div className={styles.stat}><BookOpen size={20} /> <span>50+ Courses</span></div>
                        <div className={styles.stat}><Award size={20} /> <span>Global Certs</span></div>
                    </div>
                </div>
            </section>

            {/* Course Listing */}
            <section className="container">
                <div className={styles.sectionHeader}>
                    <h2 className="section-title">Explore Courses</h2>
                    <div className={styles.searchBox}>
                        <Search size={20} />
                        <input type="text" placeholder="Search courses..." />
                    </div>
                </div>

                {loading ? (
                    <div className={styles.loading}>Loading academy...</div>
                ) : (
                    <div className={styles.courseGrid}>
                        {courses.length > 0 ? (
                            courses.map(course => (
                                <div key={course.id} className={styles.courseCard}>
                                    <div className={styles.courseImage}>
                                        <PlayCircle size={48} className={styles.playIcon} />
                                        <span>{course.level || 'Beginner'}</span>
                                    </div>
                                    <div className={styles.courseBody}>
                                        <h3>{course.title}</h3>
                                        <p>{course.description}</p>
                                        <div className={styles.courseMeta}>
                                            <span>{course.duration || '20h 30m'}</span>
                                            <span className={styles.coursePrice}>${course.price || 'Free'}</span>
                                        </div>
                                        <button className="btn-primary" onClick={() => setSelectedCourse(course)}>Enroll Now</button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Fallback courses if DB is empty */
                            <>
                                <div className={styles.courseCard}>
                                    <div className={styles.courseImage}>
                                        <PlayCircle size={48} className={styles.playIcon} />
                                        <span>Beginner</span>
                                    </div>
                                    <div className={styles.courseBody}>
                                        <h3>CCNA 200-301 Mastery</h3>
                                        <p>Complete guide to Cisco Certified Network Associate certification.</p>
                                        <div className={styles.courseMeta}>
                                            <span>45h total</span>
                                            <span className={styles.coursePrice}>$49.99</span>
                                        </div>
                                        <button className="btn-primary" onClick={() => alert('Please log in for the full experience')}>Enroll Now</button>
                                    </div>
                                </div>
                                <div className={styles.courseCard}>
                                    <div className={styles.courseImage}>
                                        <PlayCircle size={48} className={styles.playIcon} />
                                        <span>Advanced</span>
                                    </div>
                                    <div className={styles.courseBody}>
                                        <h3>Network Security Auditing</h3>
                                        <p>Advanced techniques for auditing and securing enterprise networks.</p>
                                        <div className={styles.courseMeta}>
                                            <span>30h total</span>
                                            <span className={styles.coursePrice}>$79.00</span>
                                        </div>
                                        <button className="btn-primary" onClick={() => alert('Please log in for the full experience')}>Enroll Now</button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {selectedCourse && (
                    <div className={styles.modalOverlay}>
                        <div className={styles.modalContent}>
                            <div className={styles.modalHeader}>
                                <h3>Apply for {selectedCourse.title}</h3>
                                <button onClick={() => setSelectedCourse(null)} className={styles.closeBtn}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleEnroll} className={styles.enrollForm}>
                                <div className={styles.formGroup}>
                                    <label>Full Name</label>
                                    <input type="text" value={enrollmentData.studentName} onChange={e => setEnrollmentData({...enrollmentData, studentName: e.target.value})} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Email Address</label>
                                    <input type="email" value={enrollmentData.email} onChange={e => setEnrollmentData({...enrollmentData, email: e.target.value})} required />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Why do you want to join this course?</label>
                                    <textarea rows="4" value={enrollmentData.motivation} onChange={e => setEnrollmentData({...enrollmentData, motivation: e.target.value})} required placeholder="Short description of your background/interest..." />
                                </div>
                                <div className={styles.modalActions}>
                                    <button type="button" onClick={() => setSelectedCourse(null)} className={styles.cancelBtn}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={isEnrolling}>
                                        {isEnrolling ? 'Submitting...' : 'Confirm Enrollment'}
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

export default AcademyPage;
