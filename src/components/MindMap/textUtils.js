/**
 * Text measurement utilities for node sizing and wrapping
 */

// Create a canvas for text measurement
const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const ctx = canvas ? canvas.getContext('2d') : null;

/**
 * Measure text width using canvas
 * @param {string} text - Text to measure
 * @param {string} font - Font specification
 * @returns {number} Text width in pixels
 */
export const measureText = (text, font = '14px Inter, system-ui, sans-serif') => {
    if (!ctx) return text.length * 8; // Fallback estimation

    ctx.font = font;
    return ctx.measureText(text).width;
};

/**
 * Calculate node dimensions with text wrapping
 * @param {string} text - Node text content
 * @param {number} maxWidth - Maximum node width
 * @param {string} font - Font specification
 * @returns {Object} { width, height, lines }
 */
export const calculateNodeDimensions = (text, maxWidth = 260, font = '14px Inter, system-ui, sans-serif') => {
    if (!text) return { width: 160, height: 40, lines: [''] };

    const minWidth = 160;
    const padding = 24; // 12px on each side
    const lineHeight = 20;

    // Split text into words
    const words = text.split(/\s+/);
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = measureText(testLine, font);

        if (testWidth <= maxWidth - padding) {
            currentLine = testLine;
        } else {
            if (currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                // Single word is too long, force it
                lines.push(word);
            }
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    // Calculate dimensions
    const textWidth = Math.max(...lines.map(line => measureText(line, font)));
    const width = Math.max(minWidth, Math.min(maxWidth, textWidth + padding));
    const height = Math.max(40, lines.length * lineHeight + padding);

    return { width, height, lines };
};

/**
 * Get font specification for different node levels
 * @param {number} level - Node level (0 = root, 1+ = children)
 * @returns {string} Font specification
 */
export const getNodeFont = (level) => {
    if (level === 0) {
        return '16px Inter, system-ui, sans-serif'; // Root node
    } else if (level === 1) {
        return '15px Inter, system-ui, sans-serif'; // Level 1
    } else {
        return '14px Inter, system-ui, sans-serif'; // Level 2+
    }
};
