// Kontrollitud.ee/frontend/src/pages/BlogPage.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar, faUser, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import '../styles/BlogPage.scss';

function BlogPage() {
  const { t } = useTranslation();

  // Placeholder blog posts
  const blogPosts = [
    {
      id: 1,
      title: t('blog_post1_title'),
      excerpt: t('blog_post1_excerpt'),
      date: '2025-01-15',
      author: 'Kontrollitud Team',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
      category: t('news')
    },
    {
      id: 2,
      title: t('blog_post2_title'),
      excerpt: t('blog_post2_excerpt'),
      date: '2025-01-10',
      author: 'Kontrollitud Team',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&q=80',
      category: t('guides')
    },
    {
      id: 3,
      title: t('blog_post3_title'),
      excerpt: t('blog_post3_excerpt'),
      date: '2025-01-05',
      author: 'Kontrollitud Team',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80',
      category: t('tips')
    },
    {
      id: 4,
      title: t('blog_post4_title'),
      excerpt: t('blog_post4_excerpt'),
      date: '2024-12-28',
      author: 'Kontrollitud Team',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800&q=80',
      category: t('news')
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('blog_page_title')} | Kontrollitud.ee</title>
        <meta name="description" content={t('blog_page_description')} />
        <meta name="keywords" content="blog, news, articles, Estonia, business tips, verified companies" />
      </Helmet>

      {/* Hero Section */}
      <section className="blog-hero">
        <div className="container">
          <h1 className="blog-hero-title">{t('blog_hero_title')}</h1>
          <p className="blog-hero-subtitle">{t('blog_hero_subtitle')}</p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="blog-content">
        <div className="container">
          <div className="blog-grid">
            {blogPosts.map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-card-image">
                  <img src={post.image} alt={post.title} />
                  <div className="blog-card-category">{post.category}</div>
                </div>
                
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <span className="meta-item">
                      <FontAwesomeIcon icon={faCalendar} />
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                    <span className="meta-item">
                      <FontAwesomeIcon icon={faUser} />
                      {post.author}
                    </span>
                  </div>
                  
                  <h2 className="blog-card-title">{post.title}</h2>
                  <p className="blog-card-excerpt">{post.excerpt}</p>
                  
                  <Link to={`/blog/${post.id}`} className="blog-card-link">
                    {t('read_more')}
                    <FontAwesomeIcon icon={faArrowRight} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="blog-newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>{t('subscribe_newsletter')}</h2>
            <p>{t('newsletter_subtitle')}</p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder={t('enter_email')}
                className="newsletter-input"
              />
              <button type="submit" className="newsletter-button">
                {t('subscribe')}
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default BlogPage;
