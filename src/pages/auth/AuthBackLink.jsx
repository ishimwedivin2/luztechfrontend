import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './Auth.module.css';

const AuthBackLink = () => (
    <Link to="/" className={styles.backToHome}>
        <ArrowLeft size={18} />
        Back to Homepage
    </Link>
);

export default AuthBackLink;
