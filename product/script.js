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
    if (isPostPage()) {
        loadSinglePost();
    } else {
        loadBlogPosts();
    }
}

function initSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    searchInput.addEventListener('input', async function() {
        const query = this.value.trim().toLowerCase();
        
        if (query.length < 2) {
            searchResults.style.display = 'none';
            return;
        }
        
        try {
            const response = await fetch('/product/blog_data.json');
            const posts = await response.json();
            
            const results = posts.filter(post => 
                post.title.toLowerCase().includes(query) || 
                post.excerpt.toLowerCase().includes(query) ||
                cleanDescription(post.description).toLowerCase().includes(query)
            ).slice(0, 5);
            
            if (results.length > 0) {
                searchResults.innerHTML = results.map(post => {
                    const postDate = new Date(post.date);
                    const slug = createSlug(post.title);
                    const url = `/product/${postDate.getFullYear()}/${String(postDate.getMonth() + 1).padStart(2, '0')}/${String(postDate.getDate()).padStart(2, '0')}/${slug}.html`;
                    
                    return `<a href="${url}" data-navigo>${post.title} <small>(${postDate.toLocaleDateString()})</small></a>`;
                }).join('');
                searchResults.style.display = 'block';
            } else {
                searchResults.innerHTML = '<div class="no-results">No articles found</div>';
                searchResults.style.display = 'block';
            }
        } catch (error) {
            console.error('Search error:', error);
            searchResults.innerHTML = '<div class="no-results">Error loading search results</div>';
            searchResults.style.display = 'block';
        }
    });
    
    // Hide results when clicking elsewhere
    document.addEventListener('click', function(e) {
        if (e.target !== searchInput) {
            searchResults.style.display = 'none';
        }
    });
}

function cleanDescription(text, maxLength = 100) {
    // First remove any HTML tags if they exist
    let cleaned = text.replace(/<[^>]*>/g, ' ');
    
    // Collapse multiple spaces and newlines
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Truncate if needed
    if (maxLength && cleaned.length > maxLength) {
        cleaned = cleaned.substring(0, maxLength) + '...';
    }
    
    return cleaned;
}

function isPostPage() {
    return /\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)\.html$/.test(window.location.pathname);
}

function createSlug(title) {
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
        const allPosts = await response.json();
        
        // Sort by date (newest first)
        allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Pagination - 6 posts per page
        const postsPerPage = 6;
        const currentPage = getPageNumber();
        const totalPages = Math.ceil(allPosts.length / postsPerPage);
        const paginatedPosts = allPosts.slice(
            (currentPage - 1) * postsPerPage,
            currentPage * postsPerPage
        );
        
        // Display posts
        const grid = document.getElementById('blog-grid');
        if (grid) {
            grid.style.display = 'grid';
            grid.innerHTML = paginatedPosts.map(post => {
                const postDate = new Date(post.date);
                const year = postDate.getFullYear();
                const month = String(postDate.getMonth() + 1).padStart(2, '0');
                const day = String(postDate.getDate()).padStart(2, '0');
                const slug = createSlug(post.title);
                const postUrl = `/product/${year}/${month}/${day}/${slug}.html`;
                
                return `
                    <article class="blog-card">
                        <div class="card-image">
                            <a href="${postUrl}" data-navigo>
                                <img src="${post.image}" alt="${post.title}">
                            </a>
                        </div>
                        <div class="card-content">
                            <div class="post-meta">
                                <span>By ${post.author}</span>
                                <span>•</span>
                                <span>${postDate.toLocaleDateString()}</span>
                            </div>
                            <h2><a href="${postUrl}" data-navigo>${post.title}</a></h2>
                            <p>${cleanDescription(post.excerpt, 100)}</p>
                            <a href="${postUrl}" class="read-more" data-navigo>Read More →</a>
                        </div>
                    </article>
                `;
            }).join('');
        }
        
        // Display pagination
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
        
        // Hide single post container
        const postContent = document.getElementById('post-content');
        if (postContent) postContent.style.display = 'none';
        
        // Initialize link handling
        initLinkInterception();
    } catch (error) {
        console.error('Error loading posts:', error);
        const grid = document.getElementById('blog-grid');
        if (grid) {
            grid.innerHTML = `
                <div class="error-message">
                    <p>Failed to load blog posts. Please try again later.</p>
                </div>
            `;
        }
    }
}

async function loadSinglePost() {
    try {
        const pathMatch = window.location.pathname.match(/\/(\d{4})\/(\d{2})\/(\d{2})\/(.+)\.html$/);
        
        if (!pathMatch) {
            window.location.href = '/product/index.html';
            return;
        }
        
        const [_, year, month, day, slug] = pathMatch;
        
        const response = await fetch('/product/blog_data.json');
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
            // Update SEO meta tags
            document.getElementById('post-title').textContent = `${post.title} | Bandar Deterjen`;
            document.getElementById('meta-description').content = post.excerpt;
            document.getElementById('meta-keywords').content = `laundry, ${post.title.toLowerCase().split(' ').join(', ')}, ${post.author}`;
            
            // Update Open Graph tags
            document.getElementById('og-url').content = window.location.href;
            document.getElementById('og-title').content = post.title;
            document.getElementById('og-description').content = post.excerpt;
            document.getElementById('og-image').content = post.image;
            
            // Show single post and hide blog grid
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
                        <span>By ${post.author}</span>
                        <span>•</span>
                        <span>${new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div class="featured-image">
                        <img src="${post.image}" alt="${post.title}">
                    </div>
                    <div class="post-body">
                        ${formatPostContent(post.description)}
                    </div>
                    <a href="/product/index.html" class="back-link" data-navigo>← Back to Blog</a>
                `;
            }
            
            // Initialize link handling
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
                </div>
            `;
        }
    }
}

function formatPostContent(text) {
    // First split into paragraphs by double newlines
    let paragraphs = text.split(/\n\s*\n/);
    
    // Process each paragraph
    return paragraphs.map(para => {
        // Replace single newlines with <br> except after bullet points
        para = para.replace(/([^\n])\n([^\n•\-*\d])/g, '$1<br>$2');
        // Wrap in <p> tags
        return `<p>${para}</p>`;
    }).join('');
}

function initLinkInterception() {
    // Handle internal navigation
    document.querySelectorAll('[data-navigo]').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.hasAttribute('data-navigo')) {
                e.preventDefault();
                const href = this.getAttribute('href');
                window.history.pushState(null, null, href);
                handleRouting();
            }
        });
    });
}

function getPageNumber() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page')) || 1;
    return Math.max(1, page);
}
