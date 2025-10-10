/**
 * Zoom to fit utility
 * Calculates optimal transform to fit content in viewport
 */

export function calculateZoomToFit(bbox, containerWidth, containerHeight, padding = 20) {
    if (!bbox || bbox.width === 0 || bbox.height === 0) {
        return { x: 0, y: 0, k: 1 };
    }

    const contentWidth = bbox.width + padding * 2;
    const contentHeight = bbox.height + padding * 2;

    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;

    // Use the smaller scale to fit completely
    let scale = Math.min(scaleX, scaleY);

    // More aggressive zoom - allow up to 1.5x scale and reduce minimum scale
    scale = Math.max(0.1, Math.min(1.5, scale));

    // Center the content
    const scaledWidth = contentWidth * scale;
    const scaledHeight = contentHeight * scale;

    const x = (containerWidth - scaledWidth) / 2 - (bbox.x - padding) * scale;
    const y = (containerHeight - scaledHeight) / 2 - (bbox.y - padding) * scale;

    return { x, y, k: scale };
}

export function calculateCenterOnNode(node, containerWidth, containerHeight, currentScale = 1) {
    if (!node) return { x: 0, y: 0, k: currentScale };

    const x = containerWidth / 2 - node.y * currentScale;
    const y = containerHeight / 2 - node.x * currentScale;

    return { x, y, k: currentScale };
}
