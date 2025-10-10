/**
 * Bezier links hook using D3 shape
 * Generates curved connections with proper node anchoring
 */

import { useMemo } from 'react';
import { linkHorizontal } from 'd3-shape';

export function useBezierLinks(links) {
    /**
     * Manual Bezier path fallback (if d3-shape not available)
     */
    function bezierPath(sx, sy, tx, ty) {
        const mx = (sy + ty) / 2;
        return `M ${sy},${sx} C ${mx},${sx} ${mx},${tx} ${ty},${tx}`;
    }

    /**
     * Generate link paths with proper node anchoring
     */
    const processedLinks = useMemo(() => {
        if (!links || links.length === 0) return [];

        // Create link generator
        const linkGen = linkHorizontal().x(d => d.y).y(d => d.x);

        return links.map(link => {
            const source = link.source;
            const target = link.target;

            // Calculate anchor points (touching node edges)
            const sourceBoxWidth = source.data.boxWidth || 160;
            const targetBoxWidth = target.data.boxWidth || 160;

            // Start at source node's right edge center
            const sx = source.x;
            const sy = source.y + (sourceBoxWidth / 2) - 8;

            // End at target node's left edge center  
            const tx = target.x;
            const ty = target.y - (targetBoxWidth / 2) + 8;

            // Add small offset for siblings to keep parallel links separate
            const siblingOffset = Math.abs(tx - sx) < 50 ? 6 : 0;
            const offsetDirection = tx >= sx ? 1 : -1;

            // Create link data for d3-shape
            const linkData = {
                source: { x: sx, y: sy + siblingOffset * offsetDirection },
                target: { x: tx, y: ty + siblingOffset * offsetDirection }
            };

            // Generate path
            let path;
            try {
                path = linkGen(linkData);
            } catch (error) {
                // Fallback to manual Bezier if d3-shape fails
                path = bezierPath(
                    linkData.source.x,
                    linkData.source.y,
                    linkData.target.x,
                    linkData.target.y
                );
            }

            // Create hit target path (wider for easier interaction)
            const hitPath = bezierPath(sx, sy, tx, ty);

            return {
                ...link,
                path,
                hitPath,
                sourceAnchor: { x: sx, y: sy },
                targetAnchor: { x: tx, y: ty }
            };
        });
    }, [links]);

    return { links: processedLinks };
}
