'use client';
import { useMemo, useCallback } from 'react';

/**
 * Simple smooth links implementation without D3
 * Generates curved Bezier paths matching NotebookLM style
 */
export const useSimpleSmoothLinks = (links) => {
    /**
     * Generate Bezier path for a single link
     */
    const generateBezierPath = useCallback((source, target) => {
        // Calculate connection points
        const sourceX = source.x + source.width / 2; // Right edge of source
        const sourceY = source.y;
        const targetX = target.x - target.width / 2; // Left edge of target
        const targetY = target.y;


        // Calculate control points for smooth curve
        const horizontalDistance = targetX - sourceX;
        const verticalDistance = targetY - sourceY;

        // Dynamic curve intensity based on distance
        const curveIntensity = Math.min(0.6, Math.max(0.3, horizontalDistance / 200));

        // Control points for cubic Bezier
        const controlPoint1X = sourceX + horizontalDistance * curveIntensity;
        const controlPoint1Y = sourceY;
        const controlPoint2X = targetX - horizontalDistance * curveIntensity;
        const controlPoint2Y = targetY;

        // Add small offset for siblings to avoid visual merging
        const siblingOffset = Math.abs(verticalDistance) < 50 ? 6 : 0;
        const offsetDirection = verticalDistance >= 0 ? 1 : -1;

        const path = `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y + siblingOffset * offsetDirection}, ${controlPoint2X} ${controlPoint2Y + siblingOffset * offsetDirection}, ${targetX} ${targetY}`;

        return path;
    }, []);

    /**
     * Generate invisible hit path for better interaction
     */
    const generateHitPath = useCallback((source, target) => {
        const sourceX = source.x + source.width / 2;
        const sourceY = source.y;
        const targetX = target.x - target.width / 2;
        const targetY = target.y;

        // Create a wider path for easier clicking
        const horizontalDistance = targetX - sourceX;
        const verticalDistance = targetY - sourceY;
        const curveIntensity = Math.min(0.6, Math.max(0.3, horizontalDistance / 200));

        const controlPoint1X = sourceX + horizontalDistance * curveIntensity;
        const controlPoint1Y = sourceY;
        const controlPoint2X = targetX - horizontalDistance * curveIntensity;
        const controlPoint2Y = targetY;

        return `M ${sourceX} ${sourceY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${targetX} ${targetY}`;
    }, []);

    /**
     * Process all links and generate Bezier paths
     */
    const processedLinks = useMemo(() => {
        return links.map(link => {
            const path = generateBezierPath(link.source, link.target);

            return {
                ...link,
                path,
                // Add invisible hit target for easier interaction
                hitPath: generateHitPath(link.source, link.target)
            };
        });
    }, [links, generateBezierPath, generateHitPath]);

    return {
        links: processedLinks
    };
};
