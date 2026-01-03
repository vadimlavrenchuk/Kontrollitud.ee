// Kontrollitud.ee/frontend/src/pages/BlogPostDetail.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faClock, faShare, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import '../styles/BlogPostDetail.scss';

function BlogPostDetail() {
  const { id } = useParams();
  const { t } = useTranslation();
  const [scrollProgress, setScrollProgress] = useState(0);

  // Calculate reading time (assuming average reading speed of 200 words per minute)
  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const trackLength = documentHeight - windowHeight;
      const progress = (scrollTop / trackLength) * 100;
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top when article changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  // Blog posts data - matches BlogPage.jsx structure
  const blogPosts = [
    {
      id: 1,
      title: t('blog_post1_title'),
      excerpt: t('blog_post1_excerpt'),
      content: t('blog_post1_content'),
      date: '2025-01-15',
      author: 'Kontrollitud Team',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80',
      category: t('news')
    },
    {
      id: 2,
      title: t('blog_post2_title'),
      excerpt: t('blog_post2_excerpt'),
      content: t('blog_post2_content'),
      date: '2025-01-10',
      author: 'Kontrollitud Team',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=80',
      category: t('guides')
    },
    {
      id: 3,
      title: t('blog_post3_title'),
      excerpt: t('blog_post3_excerpt'),
      content: t('blog_post3_content'),
      date: '2025-01-05',
      author: 'Kontrollitud Team',
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80',
      category: t('tips')
    },
    {
      id: 4,
      title: t('blog_post4_title'),
      excerpt: t('blog_post4_excerpt'),
      content: t('blog_post4_excerpt'), // Using excerpt as placeholder for now
      date: '2024-12-28',
      author: 'Kontrollitud Team',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80',
      category: t('news')
    }
  ];

  const post = blogPosts.find(p => p.id === parseInt(id));
  const readingTime = post ? calculateReadingTime(post.content) : 0;
  
  // Get recommended articles (other posts excluding current)
  const recommendedPosts = blogPosts.filter(p => p.id !== parseInt(id)).slice(0, 2);

  // If post not found, redirect to blog page
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Format content with line breaks and special styling
  const formatContent = (content) => {
    // Split by actual newline characters
    const paragraphs = content.split(/\\n|\n/).filter(p => p.trim() !== '');
    
    return paragraphs.map((paragraph, index) => {
      const trimmed = paragraph.trim();
      if (trimmed === '') return null;
      
      // INTRO paragraph - special styling
      if (trimmed.startsWith('**INTRO**')) {
        const text = trimmed.replace(/\*\*INTRO\*\*/g, '').trim();
        return <p key={index} className="blog-intro">{text}</p>;
      }
      
      // H3 headings
      if (trimmed.startsWith('**H3**')) {
        const text = trimmed.replace(/\*\*H3\*\*/g, '').trim();
        return <h3 key={index} className="blog-h3">{text}</h3>;
      }
      
      // CHECK items (custom checkmarks with icon)
      if (trimmed.startsWith('**CHECK**')) {
        const text = trimmed.replace(/\*\*CHECK\*\*/g, '').trim();
        return (
          <div key={index} className="blog-check-item">
            <FontAwesomeIcon icon={faCheckCircle} className="check-icon" />
            <p>{text}</p>
          </div>
        );
      }
      
      // PROTIP block
      if (trimmed.startsWith('**PROTIP**')) {
        const text = trimmed.replace(/\*\*PROTIP\*\*/g, '').trim();
        return (
          <div key={index} className="blog-protip">
            <div className="protip-icon">💡</div>
            <div className="protip-content">
              <strong>Pro Tip:</strong> {text}
            </div>
          </div>
        );
      }
      
      // Skip if first content is an intro (already handled)
      if (index === 0 && !trimmed.startsWith('**')) {
        return <p key={index} className="blog-lead">{trimmed}</p>;
      }
      
      // Check if it's a highlight with bold text (starts with **)
      if (trimmed.includes('**') && !trimmed.startsWith('**')) {
        const parts = trimmed.split(/\*\*(.*?)\*\*/g);
        return (
          <div key={index} className="blog-highlight">
            <p className="blog-paragraph">
              {parts.map((part, i) => 
                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
              )}
            </p>
          </div>
        );
      }
      
      // Regular paragraphs
      return <p key={index} className="blog-paragraph">{trimmed}</p>;
    }).filter(Boolean);
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | Kontrollitud.ee</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
      </Helmet>

      {/* Reading progress bar */}
      <div className="reading-progress" style={{ width: `${scrollProgress}%` }} />

      <div className="blog-post-detail magazine-style">
        <div className="blog-container">
          {/* Sticky Sidebar */}
          <aside className="blog-sidebar">
            <div className="sidebar-content">
              <Link to="/blog" className="sidebar-back">
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>{t('back_to_blog')}</span>
              </Link>
              
              <div className="reading-info">
                <FontAwesomeIcon icon={faClock} />
                <span>{readingTime} min read</span>
              </div>

              <button className="share-button" onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: post.title,
                    text: post.excerpt,
                    url: window.location.href
                  });
                }
              }}>
                <FontAwesomeIcon icon={faShare} />
                <span>Share</span>
              </button>
            </div>
          </aside>

          {/* Main Article Content */}
          <main className="blog-main">
            {/* Article Header */}
            <header className="article-header">
              <div className="article-category">{post.category}</div>
              <h1 className="article-title">{post.title}</h1>
              <div className="article-meta">
                <time>{new Date(post.date).toLocaleDateString()}</time>
                <span className="meta-separator">•</span>
                <span>{post.author}</span>
                <span className="meta-separator">•</span>
                <span>{readingTime} min read</span>
              </div>
            </header>

            {/* Cover Image */}
            <div className="article-cover">
              <img src={post.image} alt={post.title} />
            </div>

            {/* Article Body */}
            <article className="article-body">
              <div className="article-excerpt">{post.excerpt}</div>
              <div className="article-content">
                {formatContent(post.content)}
              </div>
            </article>

            {/* Call to Action */}
            <div className="article-cta">
              <div className="cta-content">
                <h3>{t('ready_to_grow')}</h3>
                <p>{t('join_verified_businesses')}</p>
                <Link to="/add-business" className="cta-button">
                  {t('add_business')}
                </Link>
              </div>
            </div>

            {/* Recommended Articles */}
            {recommendedPosts.length > 0 && (
              <section className="recommended-articles">
                <h2 className="recommended-title">{t('recommended_articles')}</h2>
                <div className="recommended-grid">
                  {recommendedPosts.map(recPost => (
                    <Link key={recPost.id} to={`/blog/${recPost.id}`} className="recommended-card">
                      <div className="recommended-image">
                        <img src={recPost.image} alt={recPost.title} />
                      </div>
                      <div className="recommended-content">
                        <span className="recommended-category">{recPost.category}</span>
                        <h3>{recPost.title}</h3>
                        <p>{recPost.excerpt}</p>
                        <span className="read-more-link">{t('read_more')} →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default BlogPostDetail;
