import React, { useEffect, useState, useRef } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';
import useIsBrowser from '@docusaurus/useIsBrowser';
import heroImage from '/img/hero.jpg';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  const isBrowser = useIsBrowser();
  const version = siteConfig.themeConfig.version || 'not defined';

  const [hasAnimated, setHasAnimated] = useState(new Set());

  useEffect(() => {
    if (isBrowser) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated.has(entry.target)) {
              entry.target.classList.add('active');
              setHasAnimated(prev => new Set(prev).add(entry.target));
            }
          });
        },
        { threshold: 0.3 }
      );

      const elements = document.querySelectorAll('.animate-on-scroll');
      elements.forEach(element => observer.observe(element));

      return () => observer.disconnect();
    }
  }, [isBrowser, hasAnimated]);

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={`${styles.heroText} animate-on-scroll fade-in`}>
            <div className={styles.heroBadgeContainer}>
              <span className={styles.heroBadge}>Version</span>
              <span className={styles.versionBadge}>{version}</span>
            </div>
            <Heading as="h1" className={clsx('hero__title', styles.heroTitle)}>
              {siteConfig.title}
            </Heading>
            <p className={clsx('hero__subtitle', styles.heroSubtitle)}>
              {siteConfig.tagline}
            </p>
            <div className={styles.buttons}>
              <Link
                className={clsx('button button--lg', styles.customButton, styles.primaryButton, 'pulse-hover')}
                to="/docs/introduction"
              >
                Primeros pasos
              </Link>
            </div>
          </div>
          <div className={`${styles.heroVisual} animate-on-scroll scale-in`}>
            <img src={heroImage} alt="Logo" />
          </div>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures() {
  const { siteConfig } = useDocusaurusContext();
  const isBrowser = useIsBrowser();
  const features = siteConfig.themeConfig.homepageFeatures || [];
  const featureRefs = useRef([]);
  const [hasHovered, setHasHovered] = useState(new Set());

  useEffect(() => {
    if (isBrowser) {
      const isMobile = window.innerWidth <= 768;
      const cards = document.querySelectorAll(`.${styles.featureCard}`);

      // Parallax effect for desktop
      const handleMouseOver = (card) => {
        if (!isMobile) {
          card.classList.add(styles.hovered);
        }
      };

      const handleMouseOut = (card) => {
        if (!isMobile) {
          card.classList.remove(styles.hovered);
          card.style.setProperty('--rotate-x', '15deg');
          card.style.setProperty('--rotate-y', '-10deg');
        }
      };

      const handleMouseMove = (event, card) => {
        if (!isMobile) {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const mouseX = event.clientX - centerX;
          const mouseY = event.clientY - centerY;
          const maxRotate = 5;
          const rotateX = -(mouseY / rect.height) * maxRotate;
          const rotateY = (mouseX / rect.width) * maxRotate;
          card.style.setProperty('--rotate-x', `${rotateX}deg`);
          card.style.setProperty('--rotate-y', `${rotateY}deg`);
        }
      };

      // Touch events for mobile
      const handleTouchStart = (card) => {
        if (isMobile) {
          cards.forEach(otherCard => {
            if (otherCard !== card) {
              otherCard.classList.remove(styles.mobileHover);
              setHasHovered(prev => {
                const newSet = new Set(prev);
                newSet.delete(otherCard);
                return newSet;
              });
            }
          });
          card.classList.add(styles.mobileHover);
          setHasHovered(prev => new Set(prev).add(card));
        }
      };

      const handleTouchEnd = (card) => {
        if (isMobile) {
          setTimeout(() => {
            card.classList.remove(styles.mobileHover);
            setHasHovered(prev => {
              const newSet = new Set(prev);
              newSet.delete(card);
              return newSet;
            });
          }, 300);
        }
      };

      // IntersectionObserver for mobile hover effect
      const observer = new IntersectionObserver(
        (entries) => {
          if (!isMobile) return;
          entries.forEach((entry) => {
            const card = entry.target;
            if (entry.isIntersecting && !hasHovered.has(card)) {
              card.classList.add(styles.mobileHover);
              setHasHovered(prev => new Set(prev).add(card));
            }
            // Do not remove styles.mobileHover when card exits viewport
          });
        },
        {
          root: null,
          rootMargin: '0px',
          threshold: 0.5, // Trigger when 50% of the card is visible
        }
      );

      // Apply event listeners and observer
      cards.forEach((card, index) => {
        featureRefs.current[index] = card;
        if (!isMobile) {
          card.addEventListener('mouseover', () => handleMouseOver(card));
          card.addEventListener('mouseout', () => handleMouseOut(card));
          card.addEventListener('mousemove', (event) => handleMouseMove(event, card));
        }
        card.addEventListener('touchstart', () => handleTouchStart(card), { passive: true });
        card.addEventListener('touchend', () => handleTouchEnd(card), { passive: true });
        if (isMobile) {
          observer.observe(card);
        }
      });

      // Cleanup
      return () => {
        cards.forEach((card, index) => {
          featureRefs.current[index] = null;
          if (!isMobile) {
            card.removeEventListener('mouseover', () => handleMouseOver(card));
            card.removeEventListener('mouseout', () => handleMouseOut(card));
            card.removeEventListener('mousemove', (event) => handleMouseMove(event, card));
          }
          card.removeEventListener('touchstart', () => handleTouchStart(card));
          card.removeEventListener('touchend', () => handleTouchEnd(card));
          if (isMobile) {
            observer.unobserve(card);
          }
        });
      };
    }
  }, [isBrowser]);

  const featureRows = [];
  for (let i = 0; i < features.length; i += 3) {
    featureRows.push(features.slice(i, i + 3));
  }

  return (
    <section className={styles.features}>
      <div className="container">
        {featureRows.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.featureRow}>
            {row.map((feature, colIndex) => (
              <div
                key={colIndex}
                className={`${styles.featureCard} animate-on-scroll slide-up`}
                style={{
                  transitionDelay: `${rowIndex * 100 + colIndex * 50}ms`,
                  animationDelay: `${rowIndex * 100 + colIndex * 50}ms`
                }}
              >
                <div className={styles.featureIcon}>
                  {feature.emoji || '✨'}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className={styles.ctaSection}>
      <div className="container">
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
          <p className={styles.ctaText}>Join the community of developers who trust in Dynamic Installer</p>
          <div className={styles.ctaButtons}>
            <Link
              className={clsx('button button--lg', styles.ctaButton, styles.primaryButton, 'pulse-hover')}
              to="/docs/introduction"
            >
              Get Started
            </Link>
            <Link
              className={clsx('button button--lg', styles.ctaButton, styles.secondaryButton, 'pulse-hover')}
              to="https://github.com/BlassGO/sanjose-workspace"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="icon-github"></span> View on GitHub
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout
      title={`${siteConfig.title} - ${siteConfig.tagline}`}
      description="Angular library for building web applications."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        {/*<CallToAction />*/}
      </main>
    </Layout>
  );
}