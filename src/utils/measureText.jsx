/**
 * Text measurement utility using Canvas 2D API
 * Measures and wraps text to prevent node overlap
 */

// Create a hidden canvas for text measurement
const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const context = canvas ? canvas.getContext('2d') : null;

/**
 * Measure text and wrap it to fit within max width
 * @param {string} text - Text to measure and wrap
 * @param {string} font - Font specification (e.g., "14px Arial")
 * @param {number} maxWidth - Maximum width in pixels (default: 220)
 * @param {boolean} hasChildren - Whether the node has children (affects width calculation)
 * @returns {Object} - { lines, boxWidth, boxHeight }
 */
export function measureText(text, font = '14px Arial', maxWidth = 220, hasChildren = false) {
    if (!context) {
        // Fallback for SSR
        return {
            lines: [text || 'Untitled'],
            boxWidth: 160,
            boxHeight: 40
        };
    }

    context.font = font;
    const words = (text || 'Untitled').split(' ');
    const lines = [];
    let currentLine = '';

    // Wrap text to fit maxWidth
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const metrics = context.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    // Calculate dimensions with better padding
    const lineHeight = 22; // Increased line height for better readability
    const verticalPadding = 32; // 16px padding top and bottom
    const horizontalPadding = 32; // 16px padding left and right
    const symbolWidth = hasChildren ? 24 : 0; // Space for expand/collapse symbol
    const maxLines = 3; // Limit to 3 lines max

    const actualLines = lines.slice(0, maxLines);
    const boxHeight = actualLines.length * lineHeight + verticalPadding;

    // Calculate actual width needed
    let maxLineWidth = 0;
    actualLines.forEach(line => {
        const metrics = context.measureText(line);
        maxLineWidth = Math.max(maxLineWidth, metrics.width);
    });

    // Add extra space for symbol if node has children
    const totalWidth = maxLineWidth + horizontalPadding + symbolWidth;
    const boxWidth = Math.max(180, Math.min(320, totalWidth));

    return {
        lines: actualLines,
        boxWidth,
        boxHeight
    };
}

/**
 * Get font specification based on node level
 * @param {number} level - Node hierarchy level
 * @returns {string} - Font specification
 */
export function getNodeFont(level) {
    const fontFamily = "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif";
    switch (level) {
        case 0: return `600 18px ${fontFamily}`;
        case 1: return `600 16px ${fontFamily}`;
        case 2: return `500 14px ${fontFamily}`;
        default: return `500 13px ${fontFamily}`;
    }
}
