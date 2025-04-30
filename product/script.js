document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }

    // Initialize search functionality
    initSearch();
    
    // Check URL and load appropriate content
    handleRouting();
    
    // Handle back/forward navigation
    window.addEventListener('popstate', handleRouting);
});

function handleRouting() {
    // Check for single post URLs first
    const urlParams = new URLSearchParams(window.location.search);
    const year = urlParams.get('year');
    const month = urlParams.get('month');
    const day = urlParams.get('day');
    const slug = urlParams.get('slug');
    
    if (year && month && day && slug) {
        const prettyUrl = `/${year}/${month}/${day}/${slug}.html`;
        window.history.replaceState(null, null, prettyUrl);
        loadSinglePost();
    } 
    else if (isPostPage()) {
        loadSinglePost();
    }
    // Add these lines to handle about and contact pages
    else if (window.location.pathname.includes('about.html')) {
        document.querySelector('.nav-links a[href*="about.html"]').classList.add('active');
    }
    else if (window.location.pathname.includes('contact.html')) {
        document.querySelector('.nav-links a[href*="contact.html"]').classList.add('active');
        initContactForm();
    }
    else {
        loadBlogPosts();
    }
}

// Add this new function for contact form handling
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            
            if (!name || !email || !subject) {
                alert('Silakan lengkapi semua field yang wajib diisi');
                return;
            }
            
            alert(`Terima kasih ${name}! Pesan Anda telah terkirim. Kami akan segera menghubungi Anda melalui email ${email}.`);
            this.reset();
        });
    }
}
function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const randomButton = document.getElementById('random-post-button');
    const searchResults = document.getElementById('search-results');
    const searchContainer = document.querySelector('.search-container');
    
    if (!searchInput || !searchResults) return;
    
    // Search functionality
    const performSearch = async () => {
        const query = searchInput.value.trim().toLowerCase();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        try {
            const response = await fetch('/product/blog_data.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const posts = await response.json();
            
            const results = posts.filter(post => 
                post.title.toLowerCase().includes(query) || 
                post.excerpt.toLowerCase().includes(query) ||
                cleanDescription(post.description).toLowerCase().includes(query)
            ).slice(0, 10);
            
            if (results.length > 0) {
                searchResults.innerHTML = results.map(post => {
                    const postDate = new Date(post.date);
                    const slug = createSlug(post.title);
                    const prettyUrl = `/product/${postDate.getFullYear()}/${String(postDate.getMonth() + 1).padStart(2, '0')}/${String(postDate.getDate()).padStart(2, '0')}/${slug}.html`;
                    const paramUrl = `/product/index.html?year=${postDate.getFullYear()}&month=${String(postDate.getMonth() + 1).padStart(2, '0')}&day=${String(postDate.getDate()).padStart(2, '0')}&slug=${slug}`;
                    
                    return `<a href="${paramUrl}" data-navigo data-fallback="${prettyUrl}">${post.title} <small>(${postDate.toLocaleDateString()})</small></a>`;
                }).join('');
                searchResults.style.display = 'block';
            } else {
                searchResults.innerHTML = '<div class="no-results">No articles found. Try different keywords.</div>';
                searchResults.style.display = 'block';
            }
        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = '<div class="no-results">Error loading search results</div>';
            searchResults.style.display = 'block';
        }
    };
    
    // Random post functionality
    randomButton.addEventListener('click', async () => {
        try {
            const response = await fetch('/product/blog_data.json');
            if (!response.ok) throw new Error('Network response was not ok');
            const posts = await response.json();
            
            if (posts.length > 0) {
                const randomPost = posts[Math.floor(Math.random() * posts.length)];
                const postDate = new Date(randomPost.date);
                const slug = createSlug(randomPost.title);
                const prettyUrl = `/product/${postDate.getFullYear()}/${String(postDate.getMonth() + 1).padStart(2, '0')}/${String(postDate.getDate()).padStart(2, '0')}/${slug}.html`;
                
                // For random button, we'll always use client-side navigation
                window.history.pushState(null, null, prettyUrl);
                handleRouting();
            }
        } catch (error) {
            console.error('Error loading random post:', error);
            alert('Failed to load a random post. Please try again.');
        }
    });
    
    // Event listeners
    searchInput.addEventListener('input', performSearch);
    searchButton.addEventListener('click', performSearch);
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    // Hide results when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (!searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

function cleanDescription(text, maxLength = 100) {
    if (!text) return '';
    let cleaned = text.replace(/<[^>]*>/g, ' ');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    if (maxLength && cleaned.length > maxLength) {
        cleaned = cleaned.substring(0, maxLength) + '...';
    }
    return cleaned;
}

function isPostPage() {
    return /\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)\.html$/.test(window.location.pathname) ||
           /\?year=\d{4}&month=\d{2}&day=\d{2}&slug=.+$/.test(window.location.search);
}

function createSlug(title) {
    if (!title) return '';
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50)
        .replace(/-$/, '');
}

async function loadBlogPosts() {
    try {
        const response = await fetch('/product/blog_data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const allPosts = await response.json();
        
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const postsPerPage = 6;
        const currentPage = getPageNumber();
        const totalPages = Math.ceil(allPosts.length / postsPerPage);
        const paginatedPosts = allPosts.slice(
            (currentPage - 1) * postsPerPage,
            currentPage * postsPerPage
        );
        
        const grid = document.getElementById('blog-grid');
        if (grid) {
            grid.style.display = 'grid';
            grid.innerHTML = paginatedPosts.map(post => {
                const postDate = new Date(post.date);
                const year = postDate.getFullYear();
                const month = String(postDate.getMonth() + 1).padStart(2, '0');
                const day = String(postDate.getDate()).padStart(2, '0');
                const slug = createSlug(post.title);
                const prettyUrl = `/product/${year}/${month}/${day}/${slug}.html`;
                const paramUrl = `/product/index.html?year=${year}&month=${month}&day=${day}&slug=${slug}`;
                
                return `
                    <article class="blog-card">
                        <div class="card-image">
                            <a href="${paramUrl}" data-navigo data-fallback="${prettyUrl}">
                                <img src="${post.image}" alt="${post.title}" onerror="this.src='https://via.placeholder.com/600x400?text=Image+Not+Available'">
                            </a>
                        </div>
                        <div class="card-content">
                            <div class="post-meta">
                                <span>By ${post.author || 'Unknown'}</span>
                                <span>•</span>
                                <span>${postDate.toLocaleDateString()}</span>
                            </div>
                            <h2><a href="${paramUrl}" data-navigo data-fallback="${prettyUrl}">${post.title}</a></h2>
                            <p>${cleanDescription(post.excerpt, 100)}</p>
                            <a href="${paramUrl}" class="read-more" data-navigo data-fallback="${prettyUrl}">Read More →</a>
                        </div>
                    </article>
                `;
            }).join('');
        }
        
        const pagination = document.getElementById('pagination');
        if (pagination && totalPages > 1) {
            pagination.style.display = 'flex';
            let paginationHTML = '';
            
            if (currentPage > 1) {
                paginationHTML += `<a href="/product/index.html?page=${currentPage - 1}" data-navigo>← Previous</a>`;
            }
            
            const startPage = Math.max(1, currentPage - 1);
            const endPage = Math.min(totalPages, currentPage + 1);
            
            for (let i = startPage; i <= endPage; i++) {
                paginationHTML += `<a href="/product/index.html?page=${i}" ${i === currentPage ? 'class="active"' : ''} data-navigo>${i}</a>`;
            }
            
            if (currentPage < totalPages) {
                paginationHTML += `<a href="/product/index.html?page=${currentPage + 1}" data-navigo>Next →</a>`;
            }
            
            pagination.innerHTML = paginationHTML;
        }
        
        const postContent = document.getElementById('post-content');
        if (postContent) postContent.style.display = 'none';
        
        initLinkInterception();
    } catch (error) {
        console.error('Error loading posts:', error);
        const grid = document.getElementById('blog-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message">
                    <p>Failed to load blog posts. Please try again later.</p>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

async function loadSinglePost() {
    try {
        let year, month, day, slug;
        
        const pathMatch = window.location.pathname.match(/\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)\.html$/);
        
        if (pathMatch) {
            [year, month, day, slug] = pathMatch.slice(1);
        } else {
            const urlParams = new URLSearchParams(window.location.search);
            year = urlParams.get('year');
            month = urlParams.get('month');
            day = urlParams.get('day');
            slug = urlParams.get('slug');
            
            if (!year || !month || !day || !slug) {
                throw new Error('Invalid post URL');
            }
        }
        
        const response = await fetch('/product/blog_data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const posts = await response.json();
        
        const post = posts.find(p => {
            const postSlug = createSlug(p.title);
            const postDate = new Date(p.date);
            return postSlug === slug &&
                   postDate.getFullYear() == year &&
                   String(postDate.getMonth() + 1).padStart(2, '0') == month &&
                   String(postDate.getDate()).padStart(2, '0') == day;
        });

        if (post) {
            document.getElementById('post-title').textContent = `${post.title} | Bandar Deterjen`;
            document.getElementById('meta-description').content = post.excerpt;
            document.getElementById('meta-keywords').content = `laundry, ${post.title.toLowerCase().split(' ').join(', ')}, ${post.author}`;
            
            document.getElementById('og-url').content = window.location.href;
            document.getElementById('og-title').content = post.title;
            document.getElementById('og-description').content = post.excerpt;
            document.getElementById('og-image').content = post.image;
            
            const grid = document.getElementById('blog-grid');
            const pagination = document.getElementById('pagination');
            const postContent = document.getElementById('post-content');
            
            if (grid) grid.style.display = 'none';
            if (pagination) pagination.style.display = 'none';
            if (postContent) {
                postContent.style.display = 'block';
                postContent.innerHTML = `
                    <h1>${post.title}</h1>
                    <div class="post-meta">
                        <span>By ${post.author || 'Unknown'}</span>
                        <span>•</span>
                        <span>${new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div class="featured-image">
                        <img src="${post.image}" alt="${post.title}" onerror="this.src='https://via.placeholder.com/800x400?text=Image+Not+Available'">
                    </div>
                    <div class="post-body">
                        ${formatPostContent(post.description)}
                    </div>
                    <a href="/product/index.html" class="back-link" data-navigo>← Back to Blog</a>
                `;
            }
            
            initLinkInterception();
        } else {
            window.location.href = '/product/index.html';
        }
    } catch (error) {
        console.error('Error loading post:', error);
        const postContent = document.getElementById('post-content');
        if (postContent) {
            postContent.innerHTML = `
                <div class="error-message">
                    <p>Post not found. <a href="/product/index.html" data-navigo>Return to blog</a></p>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

function formatPostContent(text) {
    if (!text) return '<p>No content available</p>';
    
    let paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs.map(para => {
        if (!para.trim()) return '';
        
        para = para.replace(/([^\n])\n([^\n•\-*\d])/g, '$1<br>$2');
        para = para.replace(/^(\s*[\-*•]\s+)/gm, '<li>');
        para = para.replace(/^(\s*\d+\.\s+)/gm, '<li>');
        
        if (para.includes('<li>')) {
            para = para.replace(/<li>/g, '</li><li>').replace('</li>', '');
            para = `<ul>${para}</ul>`;
        }
        
        if (!para.startsWith('<ul>')) {
            para = `<p>${para}</p>`;
        }
        
        return para;
    }).join('');
}

function initLinkInterception() {
    document.querySelectorAll('[data-navigo]').forEach(link => {
        // Update href for right-click/open in new tab
        const fallback = link.getAttribute('data-fallback');
        if (fallback) {
            link.setAttribute('href', fallback);
        }
        
        link.addEventListener('click', function(e) {
            if (this.hasAttribute('data-navigo')) {
                e.preventDefault();
                const href = this.getAttribute('data-fallback') || this.getAttribute('href');
                
                if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) {
                    window.open(href, '_blank');
                } else {
                    window.history.pushState(null, null, href);
                    handleRouting();
                }
            }
        });
    });
}

function getPageNumber() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page')) || 1;
    return Math.max(1, page);
}
