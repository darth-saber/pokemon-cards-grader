/**
 * TCG Player Module - Card Search and Pricing
 * Uses mock database for popular cards + TCG Player search
 */
const TCGCard = (function() {
    'use strict';

    // Popular Pokemon cards database with realistic prices
    // Prices based on TCG Player market data
    const CARD_DATABASE = [
        {
            id: 'swsh1',
            name: 'Charizard - Pokemon Base Set',
            set: 'Base Set',
            rarity: 'Rare Holo',
            number: '4/102',
            prices: { 10: 4500, 9: 2200, 8: 1100, 7: 550, 5: 180, raw: 45 },
            image: 'https://images.pokemontcg.io/swsh1/4.png'
        },
        {
            id: 'swsh3',
            name: 'Charizard - VMAX',
            set: 'Vivid Voltage',
            rarity: 'Secret Rare',
            number: 'SWSH073',
            prices: { 10: 650, 9: 320, 8: 180, 7: 95, 5: 35, raw: 12 },
            image: 'https://images.pokemontcg.io/swsh3/SWSH073.png'
        },
        {
            id: 'swsh6',
            name: 'Charizard - Alternate Art',
            set: 'Evolving Skies',
            rarity: 'Secret Rare',
            number: 'SWSH074',
            prices: { 10: 2800, 9: 1400, 8: 700, 7: 350, 5: 120, raw: 35 },
            image: 'https://images.pokemontcg.io/swsh6/74.png'
        },
        {
            id: 'swsh10',
            name: 'Blaine\'s Charizard',
            set: 'Gym Challenge',
            rarity: 'Rare Holo',
            number: '9/132',
            prices: { 10: 3200, 9: 1600, 8: 800, 7: 400, 5: 150, raw: 40 },
            image: 'https://images.pokemontcg.io/gym1/9.png'
        },
        {
            id: 'swsh11',
            name: 'Misty\'s Gyarados',
            set: 'Gym Challenge',
            rarity: 'Rare Holo',
            number: '11/132',
            prices: { 10: 2100, 9: 1050, 8: 525, 7: 260, 5: 90, raw: 25 },
            image: 'https://images.pokemontcg.io/gym1/11.png'
        },
        {
            id: 'base5',
            name: 'Blastoise - Pokemon Base Set',
            set: 'Base Set',
            rarity: 'Rare Holo',
            number: '2/102',
            prices: { 10: 3800, 9: 1900, 8: 950, 7: 475, 5: 160, raw: 40 },
            image: 'https://images.pokemontcg.io/base1/2.png'
        },
        {
            id: 'base6',
            name: 'Venusaur - Pokemon Base Set',
            set: 'Base Set',
            rarity: 'Rare Holo',
            number: '15/102',
            prices: { 10: 2800, 9: 1400, 8: 700, 7: 350, 5: 120, raw: 30 },
            image: 'https://images.pokemontcg.io/base1/15.png'
        },
        {
            id: 'base1',
            name: 'Charizard - Base Set',
            set: 'Base Set',
            rarity: 'Rare Holo',
            number: '11/102',
            prices: { 10: 5500, 9: 2750, 8: 1375, 7: 690, 5: 230, raw: 55 },
            image: 'https://images.pokemontcg.io/base1/11.png'
        },
        {
            id: 'base3',
            name: 'Alakazam - Base Set',
            set: 'Base Set',
            rarity: 'Rare Holo',
            number: '1/102',
            prices: { 10: 2600, 9: 1300, 8: 650, 7: 325, 5: 110, raw: 28 },
            image: 'https://images.pokemontcg.io/base1/1.png'
        },
        {
            id: 'swsh4',
            name: 'Gyarados - VMAX',
            set: 'Vivid Voltage',
            rarity: 'Secret Rare',
            number: 'SWSH074',
            prices: { 10: 420, 9: 210, 8: 105, 7: 55, 5: 22, raw: 8 },
            image: 'https://images.pokemontcg.io/swsh3/SWSH074.png'
        },
        {
            id: 'xy1',
            name: 'M Charizard EX - X',
            set: 'XY Evolutions',
            rarity: 'Secret Rare',
            number: 'XY06',
            prices: { 10: 380, 9: 190, 8: 95, 7: 48, 5: 18, raw: 6 },
            image: 'https://images.pokemontcg.io/xyp/XY06.png'
        },
        {
            id: 'xy2',
            name: 'M Charizard EX - Y',
            set: 'XY Evolutions',
            rarity: 'Secret Rare',
            number: 'XY07',
            prices: { 10: 350, 9: 175, 8: 88, 7: 44, 5: 16, raw: 5 },
            image: 'https://images.pokemontcg.io/xyp/XY07.png'
        },
        {
            id: 'swsh12',
            name: 'Tapu Lele GX',
            set: 'Guardians Rising',
            rarity: 'Rare Ultra',
            number: '17/145',
            prices: { 10: 180, 9: 90, 8: 45, 7: 23, 5: 10, raw: 3 },
            image: 'https://images.pokemontcg.io/gri/17.png'
        },
        {
            id: 'swsh7',
            name: 'Rayquaza VMAX',
            set: 'Vivid Voltage',
            rarity: 'Secret Rare',
            number: 'SWSH20',
            prices: { 10: 320, 9: 160, 8: 80, 7: 40, 5: 15, raw: 5 },
            image: 'https://images.pokemontcg.io/swsh4/SWSH20.png'
        },
        {
            id: 'swsh8',
            name: 'Gengar VMAX',
            set: 'Vivid Voltage',
            rarity: 'Secret Rare',
            number: 'SWSH074',
            prices: { 10: 380, 9: 190, 8: 95, 7: 48, 5: 18, raw: 6 },
            image: 'https://images.pokemontcg.io/swsh3/SWSH074.png'
        },
        {
            id: 'sm12',
            name: 'Umikaru',
            set: 'Cosmic Eclipse',
            rarity: 'Rare Rainbow',
            number: 'SM12',
            prices: { 10: 420, 9: 210, 8: 105, 7: 55, 5: 20, raw: 8 },
            image: 'https://images.pokemontcg.io/cri/246.png'
        },
        {
            id: 'sm6',
            name: 'Primal Groudon EX',
            set: 'Primal Clash',
            rarity: 'Rare Secret',
            number: '74/160',
            prices: { 10: 280, 9: 140, 8: 70, 7: 35, 5: 14, raw: 5 },
            image: 'https://images.pokemontcg.io/pr/74.png'
        },
        {
            id: 'sm7',
            name: 'Primal Kyogre EX',
            set: 'Primal Clash',
            rarity: 'Rare Secret',
            number: '76/160',
            prices: { 10: 260, 9: 130, 8: 65, 7: 33, 5: 13, raw: 5 },
            image: 'https://images.pokemontcg.io/pr/76.png'
        },
        {
            id: 'base7',
            name: 'Chansey - Base Set',
            set: 'Base Set',
            rarity: 'Rare Holo',
            number: '3/102',
            prices: { 10: 1800, 9: 900, 8: 450, 7: 225, 5: 75, raw: 20 },
            image: 'https://images.pokemontcg.io/base1/3.png'
        },
        {
            id: 'base8',
            name: 'Clefairy - Base Set',
            set: 'Base Set',
            rarity: 'Rare Holo',
            number: '6/102',
            prices: { 10: 1400, 9: 700, 8: 350, 7: 175, 5: 60, raw: 15 },
            image: 'https://images.pokemontcg.io/base1/6.png'
        },
        {
            id: 'dp6',
            name: 'Lucario V',
            set: 'Diamond & Pearl',
            rarity: 'Rare Ultra',
            number: '20/131',
            prices: { 10: 280, 9: 140, 8: 70, 7: 35, 5: 14, raw: 5 },
            image: 'https://images.pokemontcg.io/dp6/20.png'
        },
        {
            id: 'swsh2',
            name: 'Pikachu - VMAX',
            set: 'Vivid Voltage',
            rarity: 'Secret Rare',
            number: 'SWSH068',
            prices: { 10: 220, 9: 110, 8: 55, 7: 28, 5: 12, raw: 4 },
            image: 'https://images.pokemontcg.io/swsh3/SWSH068.png'
        },
        {
            id: 'swsh5',
            name: 'Eevee VMAX',
            set: 'Vivid Voltage',
            rarity: 'Secret Rare',
            number: 'SWSH071',
            prices: { 10: 180, 9: 90, 8: 45, 7: 23, 5: 10, raw: 3 },
            image: 'https://images.pokemontcg.io/swsh3/SWSH071.png'
        },
        {
            id: 'neo1',
            name: 'Dark Raichu',
            set: 'Neo Destiny',
            rarity: 'Rare Holo',
            number: '8/105',
            prices: { 10: 650, 9: 325, 8: 165, 7: 85, 5: 30, raw: 10 },
            image: 'https://images.pokemontcg.io/neo1/8.png'
        },
        {
            id: 'neo2',
            name: 'Light Dragonite',
            set: 'Neo Destiny',
            rarity: 'Rare Holo',
            number: '9/105',
            prices: { 10: 580, 9: 290, 8: 145, 7: 75, 5: 28, raw: 9 },
            image: 'https://images.pokemontcg.io/neo1/9.png'
        },
        {
            id: 'ecard1',
            name: 'Holo Pokémon Selection',
            set: 'Expedition',
            rarity: 'Rare Holo',
            number: '102/153',
            prices: { 10: 850, 9: 425, 8: 215, 7: 110, 5: 40, raw: 12 },
            image: 'https://images.pokemontcg.io/ex1/102.png'
        },
        {
            id: 'ex1',
            name: 'Rayquaza EX',
            set: 'Emerald',
            rarity: 'Rare Ultra',
            number: '5/108',
            prices: { 10: 320, 9: 160, 8: 80, 7: 40, 5: 15, raw: 5 },
            image: 'https://images.pokemontcg.io/emerald/5.png'
        },
        {
            id: 'ex2',
            name: 'Deoxys EX',
            set: 'Emerald',
            rarity: 'Rare Ultra',
            number: '10/108',
            prices: { 10: 280, 9: 140, 8: 70, 7: 35, 5: 14, raw: 5 },
            image: 'https://images.pokemontcg.io/emerald/10.png'
        },
        {
            id: 'pl1',
            name: 'Dialga G',
            set: 'Platinum',
            rarity: 'Rare Ultra',
            number: '10/127',
            prices: { 10: 380, 9: 190, 8: 95, 7: 48, 5: 18, raw: 6 },
            image: 'https://images.pokemontcg.io/pl1/10.png'
        },
        {
            id: 'bw4',
            name: 'Full Art Trainers - Black & White',
            set: 'Plasma Freeze',
            rarity: 'Rare Ultra',
            number: '111/116',
            prices: { 10: 180, 9: 90, 8: 45, 7: 23, 5: 10, raw: 3 },
            image: 'https://images.pokemontcg.io/bw4/111.png'
        }
    ];

    // State
    let selectedCard = null;

    /**
     * Search for cards by name
     */
    function searchCards(query) {
        if (!query || query.length < 2) {
            return [];
        }

        const lowerQuery = query.toLowerCase();
        
        // Search in database
        const results = CARD_DATABASE.filter(card => {
            return card.name.toLowerCase().includes(lowerQuery) ||
                   card.set.toLowerCase().includes(lowerQuery);
        });

        // Sort by relevance (exact matches first)
        results.sort((a, b) => {
            const aExact = a.name.toLowerCase().startsWith(lowerQuery);
            const bExact = b.name.toLowerCase().startsWith(lowerQuery);
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;
            return 0;
        });

        return results.slice(0, 10); // Return top 10 results
    }

    /**
     * Select a card and get pricing
     */
    function selectCard(cardId) {
        const card = CARD_DATABASE.find(c => c.id === cardId);
        if (card) {
            selectedCard = card;
            return card;
        }
        return null;
    }

    /**
     * Get selected card
     */
    function getSelectedCard() {
        return selectedCard;
    }

    /**
     * Clear selection
     */
    function clearSelection() {
        selectedCard = null;
    }

    /**
     * Format price for display
     */
    function formatPrice(price) {
        if (!price) return '--';
        return '$' + price.toLocaleString();
    }

    /**
     * Get TCG Player search URL for a card
     */
    function getTCGPlayerUrl(cardName) {
        const encoded = encodeURIComponent(cardName);
        return `https://www.tcgplayer.com/search/pokemon/product?productLineName=pokemon&search=${encoded}`;
    }

    /**
     * Add more cards to database (can be extended)
     */
    function addCardToDatabase(card) {
        CARD_DATABASE.push(card);
    }

    // Public API
    return {
        searchCards,
        selectCard,
        getSelectedCard,
        clearSelection,
        formatPrice,
        getTCGPlayerUrl,
        addCardToDatabase,
        CARD_DATABASE
    };
})();

