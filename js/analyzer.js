/**
 * Image Analyzer Module - Analyzes card condition from images
 */
const Analyzer = (function() {
    'use strict';

    /**
     * Analyze card from image data
     * Returns condition assessment
     */
    async function analyzeCard(imageData) {
        // Create an Image object from the data URL
        const img = await loadImage(imageData);
        
        // Create canvas for analysis
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize for faster processing
        const maxSize = 400;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Get image data
        const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Perform various analyses
        const sharpness = calculateSharpness(imageDataObj);
        const brightness = calculateBrightness(imageDataObj);
        const saturation = calculateSaturation(imageDataObj);
        const contrast = calculateContrast(imageDataObj);
        const edgeQuality = detectEdges(imageDataObj);
        const cornerQuality = analyzeCorners(imageDataObj, canvas.width, canvas.height);
        
        // Calculate overall metrics (0-100)
        const centering = estimateCentering(imageDataObj);
        const corners = Math.round(cornerQuality * 100);
        const edges = Math.round(edgeQuality * 100);
        const surface = calculateSurfaceQuality(sharpness, saturation, contrast);
        
        return {
            centering: Math.round(centering),
            corners: corners,
            edges: edges,
            surface: surface,
            sharpness: sharpness,
            brightness: brightness,
            saturation: saturation,
            contrast: contrast
        };
    }

    /**
     * Load image from data URL
     */
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    /**
     * Calculate image sharpness using Laplacian variance
     */
    function calculateSharpness(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Convert to grayscale and apply Laplacian
        let laplacianValues = [];
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;
                
                // Get neighboring pixel values (grayscale)
                const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                const top = (data[((y - 1) * width + x) * 4] + data[((y - 1) * width + x) * 4 + 1] + data[((y - 1) * width + x) * 4 + 2]) / 3;
                const bottom = (data[((y + 1) * width + x) * 4] + data[((y + 1) * width + x) * 4 + 1] + data[((y + 1) * width + x) * 4 + 2]) / 3;
                const left = (data[(y * width + (x - 1)) * 4] + data[(y * width + (x - 1)) * 4 + 1] + data[(y * width + (x - 1)) * 4 + 2]) / 3;
                const right = (data[(y * width + (x + 1)) * 4] + data[(y * width + (x + 1)) * 4 + 1] + data[(y * width + (x + 1)) * 4 + 2]) / 3;
                
                // Laplacian
                const laplacian = Math.abs(4 * center - top - bottom - left - right);
                laplacianValues.push(laplacian);
            }
        }
        
        // Calculate variance
        const mean = laplacianValues.reduce((a, b) => a + b, 0) / laplacianValues.length;
        const variance = laplacianValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / laplacianValues.length;
        
        // Normalize to 0-100 scale (higher is sharper)
        const normalizedScore = Math.min(100, (variance / 50) * 100);
        
        return normalizedScore;
    }

    /**
     * Calculate average brightness
     */
    function calculateBrightness(imageData) {
        const data = imageData.data;
        let totalBrightness = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            // Weighted brightness (human eye is more sensitive to green)
            const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
            totalBrightness += brightness;
        }
        
        const avgBrightness = totalBrightness / (data.length / 4);
        
        // Optimal brightness is around 128, score based on deviation
        const deviation = Math.abs(128 - avgBrightness);
        const score = Math.max(0, 100 - (deviation / 1.28));
        
        return score;
    }

    /**
     * Calculate color saturation level
     */
    function calculateSaturation(imageData) {
        const data = imageData.data;
        let totalSaturation = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            
            let saturation = 0;
            if (max !== 0) {
                saturation = (max - min) / max;
            }
            
            totalSaturation += saturation;
        }
        
        const avgSaturation = totalSaturation / (data.length / 4);
        
        // Score: higher saturation generally better for cards
        return Math.min(100, avgSaturation * 100);
    }

    /**
     * Calculate contrast level
     */
    function calculateContrast(imageData) {
        const data = imageData.data;
        let min = 255;
        let max = 0;
        
        for (let i = 0; i < data.length; i += 4) {
            const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
            min = Math.min(min, gray);
            max = Math.max(max, gray);
        }
        
        const contrast = max - min;
        
        // Good contrast is between 100-200
        const score = Math.min(100, (contrast / 1.5));
        
        return score;
    }

    /**
     * Detect edge quality (damage indicators)
     */
    function detectEdges(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        let edgePixels = 0;
        const sampleRate = 4; // Sample every 4th pixel for speed
        
        for (let y = 1; y < height - 1; y += sampleRate) {
            for (let x = 1; x < width - 1; x += sampleRate) {
                const idx = (y * width + x) * 4;
                
                const center = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                const top = (data[((y - 1) * width + x) * 4] + data[((y - 1) * width + x) * 4 + 1] + data[((y - 1) * width + x) * 4 + 2]) / 3;
                const bottom = (data[((y + 1) * width + x) * 4] + data[((y + 1) * width + x) * 4 + 1] + data[((y + 1) * width + x) * 4 + 2]) / 3;
                const left = (data[(y * width + (x - 1)) * 4] + data[(y * width + (x - 1)) * 4 + 1] + data[(y * width + (x - 1)) * 4 + 2]) / 3;
                const right = (data[(y * width + (x + 1)) * 4] + data[(y * width + (x + 1)) * 4 + 1] + data[(y * width + (x + 1)) * 4 + 2]) / 3;
                
                // Sobel-like edge detection
                const gx = Math.abs(right - left);
                const gy = Math.abs(bottom - top);
                const edge = Math.sqrt(gx * gx + gy * gy);
                
                if (edge > 30) { // Threshold for significant edge
                    edgePixels++;
                }
            }
        }
        
        const totalSampled = Math.floor(height / sampleRate) * Math.floor(width / sampleRate);
        const edgeRatio = edgePixels / totalSampled;
        
        // Lower edge ratio in center = better (less damage)
        // Higher edge ratio at edges = expected (card border)
        return Math.max(0, Math.min(100, 100 - (edgeRatio * 500)));
    }

    /**
     * Analyze corner quality
     */
    function analyzeCorners(imageData, width, height) {
        const data = imageData.data;
        const cornerSize = Math.min(width, height) * 0.15;
        
        const corners = [
            { x: 0, y: 0 },           // Top-left
            { x: width - cornerSize, y: 0 },  // Top-right
            { x: 0, y: height - cornerSize },  // Bottom-left
            { x: width - cornerSize, y: height - cornerSize }  // Bottom-right
        ];
        
        let totalCornerQuality = 0;
        
        corners.forEach(corner => {
            let cornerBrightness = 0;
            let count = 0;
            
            for (let y = Math.floor(corner.y); y < Math.floor(corner.y + cornerSize) && y < height; y++) {
                for (let x = Math.floor(corner.x); x < Math.floor(corner.x + cornerSize) && x < width; x++) {
                    const idx = (y * width + x) * 4;
                    const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    cornerBrightness += brightness;
                    count++;
                }
            }
            
            const avgBrightness = cornerBrightness / count;
            // Corners should be consistent with overall image
            totalCornerQuality += Math.min(100, avgBrightness);
        });
        
        return (totalCornerQuality / 4) / 100;
    }

    /**
     * Estimate centering quality
     */
    function estimateCentering(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Sample rows and columns to find the card bounds
        const threshold = 250; // White/paper threshold
        
        // Find left edge
        let leftEdge = width;
        for (let x = 0; x < width; x++) {
            let hasContent = false;
            for (let y = Math.floor(height * 0.3); y < Math.floor(height * 0.7); y++) {
                const idx = (y * width + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (brightness < threshold) {
                    hasContent = true;
                    break;
                }
            }
            if (hasContent) {
                leftEdge = x;
                break;
            }
        }
        
        // Find right edge
        let rightEdge = 0;
        for (let x = width - 1; x >= 0; x--) {
            let hasContent = false;
            for (let y = Math.floor(height * 0.3); y < Math.floor(height * 0.7); y++) {
                const idx = (y * width + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (brightness < threshold) {
                    hasContent = true;
                    break;
                }
            }
            if (hasContent) {
                rightEdge = x;
                break;
            }
        }
        
        // Find top edge
        let topEdge = height;
        for (let y = 0; y < height; y++) {
            let hasContent = false;
            for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x++) {
                const idx = (y * width + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (brightness < threshold) {
                    hasContent = true;
                    break;
                }
            }
            if (hasContent) {
                topEdge = y;
                break;
            }
        }
        
        // Find bottom edge
        let bottomEdge = 0;
        for (let y = height - 1; y >= 0; y--) {
            let hasContent = false;
            for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x++) {
                const idx = (y * width + x) * 4;
                const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                if (brightness < threshold) {
                    hasContent = true;
                    break;
                }
            }
            if (hasContent) {
                bottomEdge = y;
                break;
            }
        }
        
        const cardWidth = rightEdge - leftEdge;
        const cardHeight = bottomEdge - topEdge;
        
        // Check centering
        const horizontalCenter = (leftEdge + rightEdge) / 2;
        const verticalCenter = (topEdge + bottomEdge) / 2;
        const imageCenterX = width / 2;
        const imageCenterY = height / 2;
        
        const horizontalOffset = Math.abs(horizontalCenter - imageCenterX) / width;
        const verticalOffset = Math.abs(verticalCenter - imageCenterY) / height;
        
        // Score based on how centered the card is
        const centeringScore = 100 - ((horizontalOffset + verticalOffset) * 200);
        
        return Math.max(0, Math.min(100, centeringScore));
    }

    /**
     * Calculate overall surface quality
     */
    function calculateSurfaceQuality(sharpness, saturation, contrast) {
        // Weighted average of factors
        const score = (sharpness * 0.4) + (saturation * 0.3) + (contrast * 0.3);
        return Math.round(score);
    }

    // Public API
    return {
        analyzeCard
    };
})();

