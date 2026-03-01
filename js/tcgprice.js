
/**
 * TCG Player Pricing Module - Fetches real prices from TCG Player API
 */
const TCGPrice = (function() {
    'use strict';

    // Cache for prices
    let priceCache = {};
    const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

    /**
     * Fetch prices from TCG Player price API
     */
    async function fetchTCGPrices(productId) {
        if (!productId) return null;

        // Check cache first
        const cached = priceCache[productId];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }

        try {
            // Using Pokemon TCG API for prices
            const url = `https://prices.pokemontcg.io/tcgplayer/${productId}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch prices');
            }
            
            const data = await response.json();
            
            // Cache the result
            priceCache[productId] = {
                data: data,
                timestamp: Date.now()
            };
            
            return data;
        } catch (error) {
            console.error('Error fetching TCG Player prices:', error);
            return null;
        }
    }

    /**
     * Get prices by grade
     */
    async function getGradePrices(productId) {
        const prices = await fetchTCGPrices(productId);
        
        if (!prices) return null;
        
        // Get market price
        const marketPrice = prices.trendPrice || prices.averagePrice || prices.lowPrice || 0;
        
        // Estimated multipliers for different grades
        const gradeMultipliers = {
            10: 4.5,
            9: 2.5,
            8: 1.5,
            7: 1.0,
            6: 0.7,
            5: 0.5,
            raw: 0.3
        };
        
        return {
            10: Math.round(marketPrice * gradeMultipliers[10]),
            9: Math.round(marketPrice * gradeMultipliers[9]),
            8: Math.round(marketPrice * gradeMultipliers[8]),
            7: Math.round(marketPrice * gradeMultipliers[7]),
            6: Math.round(marketPrice * gradeMultipliers[6]),
            5: Math.round(marketPrice * gradeMultipliers[5]),
            raw: Math.round(marketPrice * gradeMultipliers.raw)
        };
    }

    /**
     * Search for card using Pokemon TCG API
     */
    async function searchCard(query) {
        try {
            const url = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(query)}*&orderBy=popularity&pageSize=10`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Search failed');
            }
            
            const data = await response.json();
            
            return data.data.map(card => ({
                id: card.id,
                name: card.name,
                set: card.set.name,
                rarity: card.rarity,
                image: card.images.small,
                productId: card.tcgplayer ? card.tcgplayer.productId : null
            }));
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    /**
     * Get TCG Player product URL
     */
    function getProductUrl(productId) {
        return `https://www.tcgplayer.com/product/${productId}?utm_campaign=affiliate&utm_medium=api`;
    }

    // Public API
    return {
        fetchTCGPrices,
        getGradePrices,
        searchCard,
        getProductUrl
    };
})();


