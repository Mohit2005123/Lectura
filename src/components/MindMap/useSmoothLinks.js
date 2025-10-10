'use client';
import { useMemo } from 'react';
import { linkHorizontal } from 'd3';

/**
 * Custom hook for generating smooth Bezier connections
 * Implements curved cubic Bezier paths matching NotebookLM style
 */
export const useSmoothLinks = (links) => {
    // Create D3 link generator for horizontal tidy tree
    const linkGenerator = linkHorizontal()
        .x(d => d.y) // Use y as horizontal position (D3 tree layout)
        .y(d => d.x) // Use x as vertical position
        .curve(d3.curveBasis); // Smooth cubic Bezier curves

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
    }, [links, generateBezierPath]);

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

    return {
        links: processedLinks,
        linkGenerator
    };
};

// Helper function for D3 curve (if not available globally)
const d3 = {
    curveBasis: (context) => {
        let x0, x1, x2, x3, y0, y1, y2, y3;
        let pointCount = 0;

        const basis = {
            lineStart() {
                pointCount = 0;
            },
            lineEnd() {
                if (pointCount > 0) context.lineTo(x2, y2);
            },
            point(x, y) {
                x = +x, y = +y;
                switch (++pointCount) {
                    case 1: return;
                    case 2: x1 = x, y1 = y; return;
                    case 3: x2 = x, y2 = y; return;
                }
                basis.point = (x, y) => {
                    x3 = x, y3 = y;
                    basis.point = (x, y) => {
                        const xc = (x0 + x1 + x2 + x3) / 4;
                        const yc = (y0 + y1 + y2 + y3) / 4;
                        context.bezierCurveTo(x1, y1, x2, y2, xc, yc);
                        x0 = x1, x1 = x2, x2 = x3, x3 = x;
                        y0 = y1, y1 = y2, y2 = y3, y3 = y;
                    };
                };
            }
        };
        return basis;
    }
};
