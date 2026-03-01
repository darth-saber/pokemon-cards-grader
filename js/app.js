/**
 * PSA Grade Checker - Main Application
 */
(function() {
    'use strict';

    // DOM Elements
    const elements = {
        // Search section
        cardSearchSection: document.getElementById('card-search-section'),
        searchInput: document.getElementById('card-search-input'),
        searchBtn: document.getElementById('search-btn'),
        searchResults: document.getElementById('search-results'),
        
        // Card info
        cardInfo: document.getElementById('card-info'),
        cardImage: document.getElementById('card-image'),
        cardName: document.getElementById('card-name'),
        cardSet: document.getElementById('card-set'),
        cardRarity: document.getElementById('card-rarity'),
        clearCardBtn: document.getElementById('clear-card'),
        
        // Pricing
        price10: document.getElementById('price-10'),
        price9: document.getElementById('price-9'),
        price8: document.getElementById('price-8'),
        price7: document.getElementById('price-7'),
        price5: document.getElementById('price-5'),
        priceRaw: document.getElementById('price-raw'),
        tcgLink: document.getElementById('tcg-link'),
        
        // Camera section
        cameraSection: document.getElementById('camera-section'),
        cameraFeed: document.getElementById('camera-feed'),
        capturedImage: document.getElementById('captured-image'),
        captureCanvas: document.getElementById('capture-canvas'),
        
        // Controls
        captureBtn: document.getElementById('capture-btn'),
        switchCameraBtn: document.getElementById('switch-camera'),
        uploadBtn: document.getElementById('upload-btn'),
        fileInput: document.getElementById('file-input'),
        
        // Results section
        resultsSection: document.getElementById('results-section'),
        newScanBtn: document.getElementById('new-scan-btn'),
        
        // Grade display
        gradeCircle: document.getElementById('grade-circle'),
        gradeNumber: document.getElementById('grade-number'),
        gradeDescription: document.getElementById('grade-description'),
        confidenceLevel: document.getElementById('confidence-level'),
        
        // Factor bars
        centeringBar: document.getElementById('centering-bar'),
        cornersBar: document.getElementById('corners-bar'),
        edgesBar: document.getElementById('edges-bar'),
        surfaceBar: document.getElementById('surface-bar'),
        
        // Factor values
        centeringValue: document.getElementById('centering-value'),
        cornersValue: document.getElementById('corners-value'),
        edgesValue: document.getElementById('edges-value'),
        surfaceValue: document.getElementById('surface-value'),
        
        // Loading
        loadingOverlay: document.getElementById('loading-overlay')
    };

    // App state
    let currentImageData = null;
    let isAnalyzing = false;
    let selectedCard = null;

    /**
     * Initialize the application
     */
    async function init() {
        // Initialize camera module
        Camera.init(elements.cameraFeed, elements.captureCanvas);
        
        // Start camera
        await startCamera();
        
        // Set up event listeners
        setupEventListeners();
    }

    /**
     * Start camera stream
     */
    async function startCamera() {
        const result = await Camera.startCamera();
        
        if (!result.success) {
            console.log('Camera not available:', result.error);
        }
    }

    /**
     * Set up all event listeners
     */
    function setupEventListeners() {
        // Search button
        elements.searchBtn.addEventListener('click', handleSearch);
        
        // Search input - search on enter
        elements.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
        
        // Clear card selection
        elements.clearCardBtn.addEventListener('click', handleClearCard);
        
        // Capture button
        elements.captureBtn.addEventListener('click', handleCapture);
        
        // Switch camera button
        elements.switchCameraBtn.addEventListener('click', handleSwitchCamera);
        
        // Upload button
        elements.uploadBtn.addEventListener('click', () => elements.fileInput.click());
        
        // File input change
        elements.fileInput.addEventListener('change', handleFileUpload);
        
        // New scan button
        elements.newScanBtn.addEventListener('click', handleNewScan);
        
        // Handle page visibility change
        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!elements.cardSearchSection.contains(e.target)) {
                elements.searchResults.classList.add('hidden');
            }
        });
    }

    /**
     * Handle card search
     */
    async function handleSearch() {
        const query = elements.searchInput.value.trim();
        
        if (query.length < 2) {
            elements.searchResults.classList.add('hidden');
            return;
        }
        
        // First try local database
        let results = TCGCard.searchCards(query);
        
        // If no local results, try API search
        if (results.length === 0) {
            try {
                results = await TCGPrice.searchCard(query);
            } catch (e) {
                console.log('API search failed');
            }
        }
        
        displaySearchResults(results);
    }

    /**
     * Display search results
     */
    function displaySearchResults(results) {
        if (results.length === 0) {
            elements.searchResults.innerHTML = '<div class="search-result-item"><p>No cards found. Try a different search.</p></div>';
            elements.searchResults.classList.remove('hidden');
            return;
        }
        
        let html = '';
        results.forEach(card => {
            const price = TCGCard.formatPrice(card.prices.raw);
            html += `
                <div class="search-result-item" data-card-id="${card.id}">
                    <img src="${card.image}" alt="${card.name}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 140%22><rect fill=%22%23333%22 width=%22100%22 height=%22140%22/><text x=%2250%22 y=%2270%22 fill=%22%23666%22 text-anchor=%22middle%22>No Image</text></svg>'">
                    <div class="search-result-info">
                        <h4>${card.name}</h4>
                        <p>${card.set}</p>
                    </div>
                    <span class="search-result-price">${price}</span>
                </div>
            `;
        });
        
        elements.searchResults.innerHTML = html;
        elements.searchResults.classList.remove('hidden');
        
        // Add click handlers to results
        document.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const cardId = item.dataset.cardId;
                handleCardSelect(cardId);
            });
        });
    }

    /**
     * Handle card selection
     */
    function handleCardSelect(cardId) {
        const card = TCGCard.selectCard(cardId);
        if (card) {
            selectedCard = card;
            displayCardInfo(card);
            elements.searchResults.classList.add('hidden');
            elements.searchInput.value = '';
        }
    }

    /**
     * Display selected card info and pricing
     */
    function displayCardInfo(card) {
        // Show card info section
        elements.cardInfo.classList.remove('hidden');
        
        // Set card details
        elements.cardImage.src = card.image;
        elements.cardImage.onerror = function() {
            this.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140"><rect fill="#333" width="100" height="140"/><text x="50" y="70" fill="#666" text-anchor="middle">No Image</text></svg>';
        };
        elements.cardName.textContent = card.name;
        elements.cardSet.textContent = card.set + ' • ' + card.number;
        elements.cardRarity.textContent = card.rarity;
        
        // Always use local prices immediately
        setLocalPrices(card);
        
        // Try to fetch real TCG Player prices in background
        fetchRealTimePrices(card);
        
        // Scroll to results section if visible
        if (!elements.resultsSection.classList.contains('hidden')) {
            elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    /**
     * Fetch real-time prices from TCG Player API
     */
    async function fetchRealTimePrices(card) {
        try {
            const gradePrices = await TCGPrice.getGradePrices(card.id);
            
            if (gradePrices && gradePrices[10] > 0) {
                // Update with real prices if available
                elements.price10.textContent = TCGCard.formatPrice(gradePrices[10]);
                elements.price9.textContent = TCGCard.formatPrice(gradePrices[9]);
                elements.price8.textContent = TCGCard.formatPrice(gradePrices[8]);
                elements.price7.textContent = TCGCard.formatPrice(gradePrices[7]);
                elements.price5.textContent = TCGCard.formatPrice(gradePrices[5]);
                elements.priceRaw.textContent = TCGCard.formatPrice(gradePrices.raw);
                
                // Update link
                if (card.id) {
                    elements.tcgLink.href = TCGPrice.getProductUrl(card.id);
                }
            }
        } catch (error) {
            console.log('Using local prices');
        }
    }
    
    /**
     * Set local fallback prices
     */
    function setLocalPrices(card) {
        elements.price10.textContent = TCGCard.formatPrice(card.prices[10]);
        elements.price9.textContent = TCGCard.formatPrice(card.prices[9]);
        elements.price8.textContent = TCGCard.formatPrice(card.prices[8]);
        elements.price7.textContent = TCGCard.formatPrice(card.prices[7]);
        elements.price5.textContent = TCGCard.formatPrice(card.prices[5]);
        elements.priceRaw.textContent = TCGCard.formatPrice(card.prices.raw);
        elements.tcgLink.href = TCGCard.getTCGPlayerUrl(card.name);
    }

    /**
     * Handle clear card selection
     */
    function handleClearCard() {
        TCGCard.clearSelection();
        selectedCard = null;
        elements.cardInfo.classList.add('hidden');
    }

    /**
     * Handle capture button click
     */
    async function handleCapture() {
        if (isAnalyzing) return;
        
        // Capture frame from video
        const imageData = Camera.captureFrame();
        
        if (imageData) {
            currentImageData = imageData;
            await analyzeCard(imageData);
        }
    }

    /**
     * Handle camera switch
     */
    async function handleSwitchCamera() {
        await Camera.switchCamera();
    }

    /**
     * Handle file upload
     */
    async function handleFileUpload(event) {
        const file = event.target.files[0];
        
        if (!file) return;
        
        try {
            const imageData = await Camera.loadImageFromFile(file);
            currentImageData = imageData;
            await analyzeCard(imageData);
        } catch (error) {
            showError('Failed to load image. Please try again.');
        }
        
        // Reset file input
        event.target.value = '';
    }

    /**
     * Analyze the card image
     */
    async function analyzeCard(imageData) {
        if (isAnalyzing) return;
        isAnalyzing = true;
        
        // Show loading
        showLoading(true);
        
        // Stop camera to save resources
        Camera.stopCamera();
        
        // Show captured image
        elements.cameraFeed.classList.add('hidden');
        elements.capturedImage.src = imageData;
        elements.capturedImage.classList.remove('hidden');
        
        try {
            // Analyze the card
            const analysis = await Analyzer.analyzeCard(imageData);
            
            // Calculate grade
            const gradeResult = Grading.calculateGrade(analysis);
            
            // Display results
            displayResults(gradeResult, analysis);
            
        } catch (error) {
            console.error('Analysis error:', error);
            showError('Failed to analyze card. Please try again.');
            handleNewScan();
        }
        
        showLoading(false);
        isAnalyzing = false;
    }

    /**
     * Display grading results
     */
    function displayResults(gradeResult, analysis) {
        // Hide camera section, show results
        elements.resultsSection.classList.remove('hidden');
        
        // Update grade circle
        elements.gradeNumber.textContent = gradeResult.grade;
        
        // Remove old grade classes and add new one
        elements.gradeCircle.classList.remove('grade-1', 'grade-2', 'grade-3', 'grade-4', 
            'grade-5', 'grade-6', 'grade-7', 'grade-8', 'grade-9', 'grade-10');
        elements.gradeCircle.classList.add(`grade-${gradeResult.grade}`);
        
        // Update grade info
        elements.gradeDescription.textContent = gradeResult.description;
        elements.confidenceLevel.textContent = `Confidence: ${gradeResult.confidence}%`;
        
        // Update factor bars with animation
        setTimeout(() => {
            elements.centeringBar.style.width = `${analysis.centering}%`;
            elements.cornersBar.style.width = `${analysis.corners}%`;
            elements.edgesBar.style.width = `${analysis.edges}%`;
            elements.surfaceBar.style.width = `${analysis.surface}%`;
            
            // Update factor values
            elements.centeringValue.textContent = Grading.getFactorDescription('centering', analysis.centering);
            elements.cornersValue.textContent = Grading.getFactorDescription('corners', analysis.corners);
            elements.edgesValue.textContent = Grading.getFactorDescription('edges', analysis.edges);
            elements.surfaceValue.textContent = Grading.getFactorDescription('surface', analysis.surface);
        }, 100);
        
        // Scroll to results on mobile
        elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Handle new scan
     */
    async function handleNewScan() {
        // Reset state
        currentImageData = null;
        isAnalyzing = false;
        
        // Reset UI
        elements.resultsSection.classList.add('hidden');
        elements.capturedImage.classList.add('hidden');
        elements.cameraFeed.classList.remove('hidden');
        
        // Reset factor bars
        elements.centeringBar.style.width = '0%';
        elements.cornersBar.style.width = '0%';
        elements.edgesBar.style.width = '0%';
        elements.surfaceBar.style.width = '0%';
        
        // Restart camera
        await startCamera();
    }

    /**
     * Show/hide loading overlay
     */
    function showLoading(show) {
        if (show) {
            elements.loadingOverlay.classList.remove('hidden');
        } else {
            elements.loadingOverlay.classList.add('hidden');
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        alert(message);
    }

    /**
     * Handle page visibility change
     */
    async function handleVisibilityChange() {
        if (document.hidden) {
            Camera.stopCamera();
        } else if (!elements.resultsSection.classList.contains('hidden') === false && !isAnalyzing) {
            await startCamera();
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
