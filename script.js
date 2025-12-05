const API_KEY = "de50d9b30cf447ee80d2353aa55455a9";
const BASE_URL = "https://newsapi.org/v2";
let currentPage = 1;
let currentCategory = "general";
let currentSearchQuery = "";
const pageSize = 20; // 30 se 20 kiya hai

const newsContainer = document.getElementById('newsContainer');
const loadMoreBtn = document.getElementById('loadMoreBtn');
let desktopSearchInput = document.getElementById('desktopSearchInput');
let mobileSearchInput = document.getElementById('mobileSearchInput');
const currentCategoryTitle = document.getElementById('currentCategoryTitle');
const searchStatus = document.getElementById('searchStatus');
const searchQueryText = document.getElementById('searchQueryText');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const trendingBtn = document.getElementById('trendingBtn');
const mobileTrendingBtn = document.getElementById('mobileTrendingBtn');

let isMobileNavOpen = false;

function setupSearchIconToggle() {
    document.querySelectorAll('.search-icon').forEach(icon => {
        const newIcon = icon.cloneNode(true);
        icon.parentNode.replaceChild(newIcon, icon);
    });
    
    document.querySelectorAll('.search-icon').forEach(icon => {
        icon.addEventListener('click', function (e) {
            e.stopPropagation();
            const container = this.closest('.search-container');
            if (container) {
                container.classList.toggle('active');
                
                if (container.classList.contains('active')) {
                    const input = container.querySelector('.search-input');
                    if (input) {
                        input.focus();
                        setupSearchInputEnterListener(input);
                    }
                }
            }
        });
    });
}

function setupSearchInputEnterListener(inputElement) {
    const newInput = inputElement.cloneNode(true);
    inputElement.parentNode.replaceChild(newInput, inputElement);
    
    newInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const query = this.value.trim();
            if (query) {
                performSearch(query);
                if (window.innerWidth < 992) {
                    const container = this.closest('.search-container');
                    if (container) {
                        container.classList.remove('active');
                    }
                    const navbarCollapse = document.getElementById('navbarNav');
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                        bsCollapse.hide();
                    }
                }
            }
        }
    });
    
    return newInput;
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - News App Starting...');
    
    setupSearchIconToggle();
    setupTrendingScroll();
    setupEventListeners();
    setupCategoryListeners();
    setupSearchInputsDirectly();
    
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse) {
        navbarCollapse.addEventListener('shown.bs.collapse', function() {
            isMobileNavOpen = true;
            setTimeout(() => {
                setupSearchIconToggle();
                setupSearchInputsDirectly();
            }, 100);
        });
        
        navbarCollapse.addEventListener('hidden.bs.collapse', function() {
            isMobileNavOpen = false;
        });
    }
    
    // DIRECT NEWS LOAD - NO LOADING SPINNER INITIALLY
    setTimeout(() => {
        loadNewsByCategory('general');
    }, 500);
    
    // Trending ko blue karna
    setTimeout(() => {
        const trendingHeadings = document.querySelectorAll('.trending-heading.trending-category');
        trendingHeadings.forEach(el => {
            el.classList.add('active-category');
            el.style.color = '#007bff';
        });
    }, 100);
});

function setupSearchInputsDirectly() {
    const desktopInput = document.getElementById('desktopSearchInput');
    if (desktopInput) {
        const newDesktopInput = desktopInput.cloneNode(true);
        desktopInput.parentNode.replaceChild(newDesktopInput, desktopInput);
        
        newDesktopInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = this.value.trim();
                if (query) {
                    performSearch(query);
                }
            }
        });
    }
    
    const mobileInput = document.getElementById('mobileSearchInput');
    if (mobileInput) {
        const newMobileInput = mobileInput.cloneNode(true);
        mobileInput.parentNode.replaceChild(newMobileInput, mobileInput);
        
        newMobileInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = this.value.trim();
                if (query) {
                    performSearch(query);
                    const container = this.closest('.search-container');
                    if (container) {
                        container.classList.remove('active');
                    }
                    const navbarCollapse = document.getElementById('navbarNav');
                    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                        const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                        bsCollapse.hide();
                    }
                }
            }
        });
    }
    
    document.querySelectorAll('.search-input').forEach(input => {
        if (input.id !== 'desktopSearchInput' && input.id !== 'mobileSearchInput') {
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = this.value.trim();
                    if (query) {
                        performSearch(query);
                        if (window.innerWidth < 992) {
                            const container = this.closest('.search-container');
                            if (container) {
                                container.classList.remove('active');
                            }
                        }
                    }
                }
            });
        }
    });
}

function setupEventListeners() {
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', loadMoreNews);
    }
    
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', clearSearch);
    }
    
    if (trendingBtn) {
        trendingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loadNewsByCategory('general');
        });
    }
    
    if (mobileTrendingBtn) {
        mobileTrendingBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loadNewsByCategory('general');
        });
    }
}

function setupCategoryListeners() {
    document.querySelectorAll('.category-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            if (category) {
                loadNewsByCategory(category);
            }
        });
    });
    
    document.querySelectorAll('.trending-category').forEach(tag => {
        tag.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.getAttribute('data-category');
            if (category) {
                loadNewsByCategory(category);
            }
        });
    });
}

function setupTrendingScroll() {
    const trendingScroll = document.getElementById('trendingScroll');
    const trendingLeft = document.getElementById('trendingLeft');
    const trendingRight = document.getElementById('trendingRight');

    if (trendingScroll && trendingLeft && trendingRight) {
        const scrollStep = 150;

        function updateArrowVisibility() {
            const scrollLeft = trendingScroll.scrollLeft;
            const maxScroll = trendingScroll.scrollWidth - trendingScroll.clientWidth;

            if (scrollLeft <= 10) {
                trendingLeft.classList.add('hidden');
            } else {
                trendingLeft.classList.remove('hidden');
            }

            if (scrollLeft >= maxScroll - 10) {
                trendingRight.classList.add('hidden');
            } else {
                trendingRight.classList.remove('hidden');
            }
        }

        trendingRight.addEventListener('click', function() {
            trendingScroll.scrollBy({
                left: scrollStep,
                behavior: 'smooth'
            });
            setTimeout(updateArrowVisibility, 300);
        });

        trendingLeft.addEventListener('click', function() {
            trendingScroll.scrollBy({
                left: -scrollStep,
                behavior: 'smooth'
            });
            setTimeout(updateArrowVisibility, 300);
        });

        updateArrowVisibility();
        window.addEventListener('resize', updateArrowVisibility);
        trendingScroll.addEventListener('scroll', updateArrowVisibility);
    }
}

async function fetchNews(category = "general", page = 1, searchQuery = "") {
    try {
        let url;
        
        // Loading show karna - agar empty hai newsContainer
        if (newsContainer.innerHTML.includes('Loading news...')) {
            // Already loading hai, kuch nahi karna
        } else if (page === 1) {
            newsContainer.innerHTML = `
                <div class="col-12">
                    <div class="loading-spinner">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-3">Loading news...</p>
                    </div>
                </div>
            `;
        }
        
        if (searchQuery) {
            url = `${BASE_URL}/everything?q=${encodeURIComponent(searchQuery)}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}&sortBy=publishedAt`;
        } else {
            url = `${BASE_URL}/top-headlines?country=us&category=${category}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`;
        }
        
        console.log('Fetching from:', url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('News data received:', data.articles ? data.articles.length : 0, 'articles');
        
        if (page === 1) {
            displayNews(data.articles);
        } else {
            appendNews(data.articles);
        }
        
        updateActiveCategory();
        
        if (loadMoreBtn) {
            const totalResults = data.totalResults || 0;
            const loadedResults = page * pageSize;
            
            console.log('Total results:', totalResults, 'Loaded:', loadedResults);
            
            if (loadedResults < totalResults && totalResults > 0) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        }
        
        return data.articles;
    } catch (error) {
        console.error('Error fetching news:', error);
        showError("Failed to load news. Please try again later.");
        return [];
    }
}

function displayNews(articles) {
    console.log('Displaying', articles ? articles.length : 0, 'articles');
    
    if (!articles || articles.length === 0) {
        newsContainer.innerHTML = `
            <div class="col-12">
                <div class="no-results">
                    <i class="fas fa-newspaper fa-3x mb-3"></i>
                    <h4>No news articles found</h4>
                    <p>Try a different category or search term</p>
                </div>
            </div>
        `;
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    let cardsHTML = '';
    articles.forEach((article, index) => {
        if (index < 20) { // Max 20 cards show karo ek page mein
            const newsCard = createNewsCard(article);
            cardsHTML += newsCard;
        }
    });
    
    newsContainer.innerHTML = cardsHTML;
}

function appendNews(articles) {
    if (!articles || articles.length === 0) {
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        return;
    }
    
    articles.forEach(article => {
        const newsCard = createNewsCard(article);
        const div = document.createElement('div');
        div.innerHTML = newsCard;
        newsContainer.appendChild(div.firstChild);
    });
}

function createNewsCard(article) {
    const defaultImage = "https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
    
    const imageUrl = article.urlToImage || defaultImage;
    const title = article.title || "No title available";
    const description = article.description || "No description available";
    const source = article.source?.name || "Unknown source";
    const date = article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : "Unknown date";
    const author = article.author || "Unknown author";
    
    return `
        <div class="col-md-4 col-lg-3 mb-4">
            <div class="card news-card h-100">
                <img src="${imageUrl}" class="card-img-top" alt="${title}" 
                     onerror="this.src='${defaultImage}'">
                <div class="card-body">
                    <h5 class="card-title">${title}</h5>
                    <p class="card-text">${description}</p>
                    <div class="mt-auto">
                        <small class="text-muted d-block">
                            <i class="fas fa-user"></i> ${author}
                        </small>
                        <small class="text-muted d-block">
                            <i class="fas fa-calendar"></i> ${date}
                        </small>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-primary source-badge">${source}</span>
                        <a href="${article.url}" target="_blank" class="btn btn-sm btn-outline-primary">
                            Read More <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadNewsByCategory(category) {
    console.log('Loading category:', category);
    currentCategory = category;
    currentSearchQuery = "";
    currentPage = 1;
    
    if (searchStatus) searchStatus.style.display = 'none';
    
    if (currentCategoryTitle) {
        const categoryNames = {
            'general': 'Latest News',
            'business': 'Business News',
            'technology': 'Technology News',
            'sports': 'Sports News',
            'entertainment': 'Entertainment News',
            'politics': 'Politics News',
            'health': 'Health News',
            'science': 'Science News'
        };
        currentCategoryTitle.textContent = categoryNames[category] || `${category.charAt(0).toUpperCase() + category.slice(1)} News`;
    }
    
    if (category !== 'general') {
        const trendingHeadings = document.querySelectorAll('.trending-heading.trending-category');
        trendingHeadings.forEach(el => {
            el.classList.remove('active-category');
            el.style.color = '';
        });
    }
    
    fetchNews(category, currentPage);
    
    const desktopInput = document.getElementById('desktopSearchInput');
    if (desktopInput) desktopInput.value = "";
    const mobileInput = document.getElementById('mobileSearchInput');
    if (mobileInput) mobileInput.value = "";
}

function performSearch(query) {
    if (!query.trim()) return;
    
    console.log('Searching for:', query);
    currentSearchQuery = query.trim();
    currentCategory = "";
    currentPage = 1;
    
    if (searchStatus && searchQueryText) {
        searchQueryText.textContent = `"${currentSearchQuery}"`;
        searchStatus.style.display = 'flex';
    }
    
    if (currentCategoryTitle) {
        currentCategoryTitle.textContent = `Search Results`;
    }
    
    document.querySelectorAll('.category-link, .trending-category').forEach(el => {
        el.classList.remove('active-category');
        el.style.color = '';
    });
    
    const desktopInput = document.getElementById('desktopSearchInput');
    if (desktopInput) desktopInput.value = query;
    const mobileInput = document.getElementById('mobileSearchInput');
    if (mobileInput) mobileInput.value = query;
    
    fetchNews("", currentPage, currentSearchQuery);
}

function clearSearch() {
    currentSearchQuery = "";
    currentCategory = "general";
    currentPage = 1;
    
    if (searchStatus) searchStatus.style.display = 'none';
    
    if (currentCategoryTitle) {
        currentCategoryTitle.textContent = 'Latest News';
    }
    
    const trendingHeadings = document.querySelectorAll('.trending-heading.trending-category');
    trendingHeadings.forEach(el => {
        el.classList.add('active-category');
        el.style.color = '#007bff';
    });
    
    const desktopInput = document.getElementById('desktopSearchInput');
    if (desktopInput) desktopInput.value = "";
    const mobileInput = document.getElementById('mobileSearchInput');
    if (mobileInput) mobileInput.value = "";
    
    fetchNews(currentCategory, currentPage);
}

function loadMoreNews() {
    currentPage++;
    console.log('Loading more, page:', currentPage);
    
    if (currentSearchQuery) {
        fetchNews("", currentPage, currentSearchQuery);
    } else {
        fetchNews(currentCategory, currentPage);
    }
}

function showError(message) {
    newsContainer.innerHTML = `
        <div class="col-12">
            <div class="error-message">
                <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                <h4>Error Loading News</h4>
                <p>${message}</p>
                <button class="btn btn-primary mt-3" onclick="loadNewsByCategory('general')">
                    <i class="fas fa-redo"></i> Try Again
                </button>
            </div>
        </div>
    `;
}

function updateActiveCategory() {
    document.querySelectorAll('.category-link, .trending-category').forEach(el => {
        el.classList.remove('active-category');
        el.style.color = '';
    });
    
    if (currentSearchQuery) {
        return;
    }
    
    if (currentCategory === "general") {
        const trendingHeadings = document.querySelectorAll('.trending-heading.trending-category');
        trendingHeadings.forEach(el => {
            el.classList.add('active-category');
            el.style.color = '#007bff';
        });
        return;
    }
    
    const activeSelectors = [
        `.category-link[data-category="${currentCategory}"]`,
        `.trending-category[data-category="${currentCategory}"]`
    ];
    
    activeSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            el.classList.add('active-category');
            el.style.color = '#007bff';
        });
    });
}

window.addEventListener('resize', function() {
    if (window.innerWidth < 992) {
        setTimeout(() => {
            setupSearchIconToggle();
            setupSearchInputsDirectly();
        }, 300);
    }
});