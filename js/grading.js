/**
 * Grading Module - Calculates PSA grade from analysis results
 */
const Grading = (function() {
    'use strict';

    // PSA Grade descriptions
    const GRADE_DESCRIPTIONS = {
        10: 'Gem Mint',
        9: 'Mint',
        8: 'Near Mint-Mint',
        7: 'Near Mint',
        6: 'Excellent-Mint',
        5: 'Excellent',
        4: 'Good-Exc',
        3: 'Good',
        2: 'Fair',
        1: 'Poor'
    };

    const GRADE_COLORS = {
        10: '#FFD700',
        9: '#C0C0C0',
        8: '#CD7F32',
        7: '#45B7D1',
        6: '#96CEB4',
        5: '#FFEAA7',
        4: '#DFE6E9',
        3: '#B2BEC3',
        2: '#95A5A6',
        1: '#636E72'
    };

    /**
     * Calculate PSA grade from analysis results
     */
    function calculateGrade(analysis) {
        const { centering, corners, edges, surface, brightness, saturation, sharpness } = analysis;

        // Weights for each factor (PSA considers these in order of importance)
        const weights = {
            centering: 0.25,
            corners: 0.30,
            edges: 0.25,
            surface: 0.20
        };

        // Calculate weighted score
        let weightedScore = 
            (centering * weights.centering) +
            (corners * weights.corners) +
            (edges * weights.edges) +
            (surface * weights.surface);

        // Apply adjustments based on specific conditions
        // Poor brightness affects grade significantly
        if (brightness < 50) {
            weightedScore *= 0.7;
        } else if (brightness < 70) {
            weightedScore *= 0.85;
        }

        // Low sharpness (blurry) significantly impacts grade
        if (sharpness < 30) {
            weightedScore *= 0.6;
        } else if (sharpness < 50) {
            weightedScore *= 0.8;
        }

        // Very low saturation might indicate poor image quality
        if (saturation < 20) {
            weightedScore *= 0.8;
        }

        // Add some variance based on image characteristics to simulate real grading
        // In reality, this would be replaced by ML model predictions
        const variance = (Math.random() * 6) - 3; // -3 to +3
        weightedScore += variance;

        // Convert to PSA grade (1-10)
        let grade = Math.round(weightedScore / 10);
        grade = Math.max(1, Math.min(10, grade));

        // Calculate confidence based on image quality
        const confidence = calculateConfidence(analysis, grade);

        return {
            grade: grade,
            description: GRADE_DESCRIPTIONS[grade],
            confidence: confidence,
            color: GRADE_COLORS[grade],
            factors: {
                centering: centering,
                corners: corners,
                edges: edges,
                surface: surface
            }
        };
    }

    /**
     * Calculate confidence level based on analysis quality
     */
    function calculateConfidence(analysis, grade) {
        const { centering, corners, edges, surface, brightness, saturation, sharpness } = analysis;

        // Base confidence on image quality metrics
        let confidence = 70; // Base confidence

        // Higher confidence when image metrics are clear
        if (brightness > 60 && brightness < 90) confidence += 10;
        if (saturation > 30) confidence += 5;
        if (sharpness > 40) confidence += 10;

        // Lower confidence when metrics are borderline
        const avgFactor = (centering + corners + edges + surface) / 4;
        if (avgFactor > 80 || avgFactor < 30) confidence += 10;

        // Add some randomness for demo purposes
        confidence += (Math.random() * 10) - 5;

        return Math.round(Math.max(50, Math.min(95, confidence)));
    }

    /**
     * Get grade recommendation text
     */
    function getGradeRecommendation(grade) {
        const recommendations = {
            10: 'Perfect condition! Ready for PSA submission.',
            9: 'Excellent condition. Highly desirable for collectors.',
            8: 'Great condition. Minor imperfections only visible upon close inspection.',
            7: 'Very nice condition. Slight wear visible but still attractive.',
            6: 'Good condition. Some visible wear but still playable.',
            5: 'Moderate condition. Noticeable wear on corners/edges.',
            4: 'Fair condition. Significant wear visible.',
            3: 'Poor condition. Heavy wear, creases, or damage.',
            2: 'Very poor condition. Major damage visible.',
            1: 'Damaged. For collection only, significant flaws.'
        };

        return recommendations[grade] || 'Unable to assess.';
    }

    /**
     * Get factor description
     */
    function getFactorDescription(factorName, value) {
        if (value >= 90) return 'Excellent';
        if (value >= 80) return 'Very Good';
        if (value >= 70) return 'Good';
        if (value >= 60) return 'Acceptable';
        if (value >= 50) return 'Fair';
        return 'Poor';
    }

    // Public API
    return {
        calculateGrade,
        getGradeRecommendation,
        getFactorDescription,
        GRADE_DESCRIPTIONS
    };
})();

