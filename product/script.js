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
                    
                    return `<a href="${url}">${post.title} <small>(${postDate.toLocaleDateString()})</small></a>`;
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

// ... (keep all previous functions until cleanDescription)

function cleanDescription(text, maxLength = 100, preserveParagraphs = false) {
    // First remove any HTML tags if they exist
    let cleaned = text.replace(/<[^>]*>/g, ' ');
    
    // Replace multiple newlines with paragraph breaks if preserving paragraphs
    if (preserveParagraphs) {
        cleaned = cleaned.replace(/\n\s*\n/g, '</p><p>');
        cleaned = '<p>' + cleaned + '</p>';
    }
    
    // Collapse multiple spaces
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // Truncate if needed (only when not preserving paragraphs)
    if (maxLength && !preserveParagraphs && cleaned.length > maxLength) {
        cleaned = cleaned.substring(0, maxLength) + '...';
    }
    
    return cleaned;
}

// ... (keep loadBlogPosts function but update the card generation part)

grid.innerHTML = paginatedPosts.map(post => {
    // ... (previous card code)
    `<p>${cleanDescription(post.excerpt, 100)}</p>
    <a href="${postUrl}" class="read-more" data-navigo>Read More →</a>`
    // ... (rest of card code)
});

// Update loadSinglePost function to handle paragraphs
async function loadSinglePost() {
    // ... (previous single post code)
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
    // ... (rest of single post code)
}

function formatPostContent(text) {
    // First split into paragraphs by double newlines
    let paragraphs = text.split(/\n\s*\n/);
    
    // Process each paragraph
    return paragraphs.map(para => {
        // Replace single newlines with <br>
        para = para.replace(/\n/g, '<br>');
        // Wrap in <p> tags
        return `<p>${para}</p>`;
    }).join('');
}
