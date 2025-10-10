/**
 * Utility functions for mindmap calculations and operations
 */

/**
 * Calculate the distance between two points
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} Distance between points
 */
export const calculateDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Calculate the angle between two points
 * @param {number} x1 - First point X coordinate
 * @param {number} y1 - First point Y coordinate
 * @param {number} x2 - Second point X coordinate
 * @param {number} y2 - Second point Y coordinate
 * @returns {number} Angle in radians
 */
export const calculateAngle = (x1, y1, x2, y2) => {
    return Math.atan2(y2 - y1, x2 - x1);
};

/**
 * Generate a smooth Bezier curve path between two points
 * @param {number} startX - Start X coordinate
 * @param {number} startY - Start Y coordinate
 * @param {number} endX - End X coordinate
 * @param {number} endY - End Y coordinate
 * @param {number} curvature - Curve intensity (0-1)
 * @returns {string} SVG path string
 */
export const generateBezierPath = (startX, startY, endX, endY, curvature = 0.5) => {
    const distance = calculateDistance(startX, startY, endX, endY);
    const controlDistance = distance * curvature;

    // Calculate control points
    const angle = calculateAngle(startX, startY, endX, endY);
    const control1X = startX + Math.cos(angle) * controlDistance;
    const control1Y = startY + Math.sin(angle) * controlDistance;
    const control2X = endX - Math.cos(angle) * controlDistance;
    const control2Y = endY - Math.sin(angle) * controlDistance;

    return `M ${startX} ${startY} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${endX} ${endY}`;
};

/**
 * Calculate node dimensions based on text content
 * @param {string} text - Node text
 * @param {number} fontSize - Font size in pixels
 * @param {string} fontFamily - Font family
 * @returns {Object} Object with width and height
 */
export const calculateTextDimensions = (text, fontSize = 16, fontFamily = 'Arial') => {
    if (!text) return { width: 0, height: 0 };

    // Create a temporary canvas to measure text
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${fontSize}px ${fontFamily}`;

    const metrics = context.measureText(text);
    const width = metrics.width;
    const height = fontSize * 1.2; // Approximate line height

    return { width, height };
};

/**
 * Check if two rectangles overlap
 * @param {Object} rect1 - First rectangle {x, y, width, height}
 * @param {Object} rect2 - Second rectangle {x, y, width, height}
 * @returns {boolean} Whether rectangles overlap
 */
export const rectanglesOverlap = (rect1, rect2) => {
    return !(
        rect1.x + rect1.width < rect2.x ||
        rect2.x + rect2.width < rect1.x ||
        rect1.y + rect1.height < rect2.y ||
        rect2.y + rect2.height < rect1.y
    );
};

/**
 * Resolve rectangle overlaps by adjusting positions
 * @param {Array} rectangles - Array of rectangle objects
 * @param {number} minSpacing - Minimum spacing between rectangles
 * @returns {Array} Array of adjusted rectangles
 */
export const resolveOverlaps = (rectangles, minSpacing = 20) => {
    const adjusted = [...rectangles];

    for (let i = 0; i < adjusted.length; i++) {
        for (let j = i + 1; j < adjusted.length; j++) {
            const rect1 = adjusted[i];
            const rect2 = adjusted[j];

            if (rectanglesOverlap(rect1, rect2)) {
                // Calculate overlap
                const overlapX = Math.min(rect1.x + rect1.width, rect2.x + rect2.width) -
                    Math.max(rect1.x, rect2.x);
                const overlapY = Math.min(rect1.y + rect1.height, rect2.y + rect2.height) -
                    Math.max(rect1.y, rect2.y);

                // Adjust positions
                if (overlapX > 0) {
                    const adjustment = (overlapX + minSpacing) / 2;
                    adjusted[i].x -= adjustment;
                    adjusted[j].x += adjustment;
                }

                if (overlapY > 0) {
                    const adjustment = (overlapY + minSpacing) / 2;
                    adjusted[i].y -= adjustment;
                    adjusted[j].y += adjustment;
                }
            }
        }
    }

    return adjusted;
};

/**
 * Generate a unique ID for nodes
 * @param {string} prefix - ID prefix
 * @returns {string} Unique ID
 */
export const generateNodeId = (prefix = 'node') => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} Cloned object
 */
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
    return obj;
};

/**
 * Find a node by ID in a tree structure
 * @param {Object} root - Root node
 * @param {string} nodeId - ID to search for
 * @returns {Object|null} Found node or null
 */
export const findNodeById = (root, nodeId) => {
    if (!root || !nodeId) return null;

    if (root.id === nodeId) return root;

    if (root.children && Array.isArray(root.children)) {
        for (const child of root.children) {
            const found = findNodeById(child, nodeId);
            if (found) return found;
        }
    }

    return null;
};

/**
 * Get all descendant nodes of a given node
 * @param {Object} node - Parent node
 * @returns {Array} Array of descendant nodes
 */
export const getDescendants = (node) => {
    if (!node || !node.children || !Array.isArray(node.children)) return [];

    const descendants = [];

    const traverse = (currentNode) => {
        if (currentNode.children && Array.isArray(currentNode.children)) {
            currentNode.children.forEach(child => {
                descendants.push(child);
                traverse(child);
            });
        }
    };

    traverse(node);
    return descendants;
};

/**
 * Calculate the bounding box of all nodes
 * @param {Array} nodes - Array of positioned nodes
 * @returns {Object} Bounding box {minX, minY, maxX, maxY, width, height}
 */
export const calculateBoundingBox = (nodes) => {
    if (!nodes || nodes.length === 0) {
        return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0 };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
        const halfWidth = (node.width || 150) / 2;
        const halfHeight = (node.height || 50) / 2;

        minX = Math.min(minX, node.x - halfWidth);
        minY = Math.min(minY, node.y - halfHeight);
        maxX = Math.max(maxX, node.x + halfWidth);
        maxY = Math.max(maxY, node.y + halfHeight);
    });

    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
    };
};

/**
 * Smooth animation easing functions
 */
export const easing = {
    easeInOut: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeOut: (t) => 1 - Math.pow(1 - t, 3),
    easeIn: (t) => t * t * t,
    linear: (t) => t
};

/**
 * Animate a value from start to end over duration
 * @param {number} start - Start value
 * @param {number} end - End value
 * @param {number} duration - Duration in milliseconds
 * @param {Function} easingFn - Easing function
 * @param {Function} onUpdate - Update callback
 * @param {Function} onComplete - Complete callback
 * @returns {Function} Cancel function
 */
export const animate = (start, end, duration, easingFn = easing.easeInOut, onUpdate, onComplete) => {
    const startTime = performance.now();
    let animationId;

    const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easingFn(progress);
        const currentValue = start + (end - start) * easedProgress;

        onUpdate(currentValue);

        if (progress < 1) {
            animationId = requestAnimationFrame(update);
        } else if (onComplete) {
            onComplete();
        }
    };

    animationId = requestAnimationFrame(update);

    return () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    };
};
