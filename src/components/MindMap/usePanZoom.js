'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { zoom, zoomIdentity, select } from 'd3';

/**
 * Custom hook for pan and zoom functionality
 * Provides smooth pan/zoom with zoom-to-fit capabilities
 */
export const usePanZoom = (containerRef, nodes, containerSize) => {
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const zoomRef = useRef(null);

    /**
     * Initialize D3 zoom behavior
     */
    useEffect(() => {
        if (!containerRef.current) return;

        const svg = select(containerRef.current);

        // Create zoom behavior
        const zoomBehavior = zoom()
            .scaleExtent([0.2, 3]) // Min and max zoom levels
            .on('zoom', (event) => {
                const { x, y, k } = event.transform;
                setTransform({ x, y, k });
            })
            .on('start', () => {
                setIsDragging(true);
            })
            .on('end', () => {
                setIsDragging(false);
            });

        // Apply zoom behavior to SVG
        svg.call(zoomBehavior);
        zoomRef.current = zoomBehavior;

        return () => {
            svg.on('.zoom', null);
        };
    }, [containerRef]);

    /**
     * Zoom to fit all visible nodes
     */
    const zoomToFit = useCallback(() => {
        if (!nodes.length || !containerRef.current) return;

        // Calculate bounding box of all nodes
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        nodes.forEach(node => {
            const halfWidth = node.width / 2;
            const halfHeight = node.height / 2;

            minX = Math.min(minX, node.x - halfWidth);
            minY = Math.min(minY, node.y - halfHeight);
            maxX = Math.max(maxX, node.x + halfWidth);
            maxY = Math.max(maxY, node.y + halfHeight);
        });

        // Add padding
        const padding = 40;
        const contentWidth = maxX - minX + padding * 2;
        const contentHeight = maxY - minY + padding * 2;

        // Calculate scale to fit
        const scaleX = containerSize.width / contentWidth;
        const scaleY = containerSize.height / contentHeight;
        const scale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%

        // Calculate center position
        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;
        const contentCenterX = (minX + maxX) / 2;
        const contentCenterY = (minY + maxY) / 2;

        // Calculate translation
        const translateX = centerX - contentCenterX * scale;
        const translateY = centerY - contentCenterY * scale;

        // Apply transform
        const newTransform = zoomIdentity
            .translate(translateX, translateY)
            .scale(scale);

        if (zoomRef.current) {
            select(containerRef.current)
                .transition()
                .duration(300)
                .call(zoomRef.current.transform, newTransform);
        }
    }, [nodes, containerSize, containerRef]);

    /**
     * Center on a specific node
     */
    const centerOn = useCallback((nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || !containerRef.current) return;

        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;

        const translateX = centerX - node.x;
        const translateY = centerY - node.y;

        const newTransform = zoomIdentity
            .translate(translateX, translateY)
            .scale(transform.k);

        if (zoomRef.current) {
            select(containerRef.current)
                .transition()
                .duration(300)
                .call(zoomRef.current.transform, newTransform);
        }
    }, [nodes, containerSize, transform.k, containerRef]);

    /**
     * Expand to a specific depth
     */
    const expandToDepth = useCallback((depth) => {
        // This would be implemented based on your expansion logic
        console.log(`Expanding to depth ${depth}`);
    }, []);

    /**
     * Reset zoom and pan
     */
    const resetView = useCallback(() => {
        if (!containerRef.current) return;

        const resetTransform = zoomIdentity.translate(0, 0).scale(1);

        if (zoomRef.current) {
            select(containerRef.current)
                .transition()
                .duration(300)
                .call(zoomRef.current.transform, resetTransform);
        }
    }, [containerRef]);

    /**
     * Zoom in
     */
    const zoomIn = useCallback(() => {
        if (!containerRef.current) return;

        const newScale = Math.min(transform.k * 1.2, 3);
        const newTransform = zoomIdentity
            .translate(transform.x, transform.y)
            .scale(newScale);

        if (zoomRef.current) {
            select(containerRef.current)
                .transition()
                .duration(200)
                .call(zoomRef.current.transform, newTransform);
        }
    }, [transform, containerRef]);

    /**
     * Zoom out
     */
    const zoomOut = useCallback(() => {
        if (!containerRef.current) return;

        const newScale = Math.max(transform.k / 1.2, 0.2);
        const newTransform = zoomIdentity
            .translate(transform.x, transform.y)
            .scale(newScale);

        if (zoomRef.current) {
            select(containerRef.current)
                .transition()
                .duration(200)
                .call(zoomRef.current.transform, newTransform);
        }
    }, [transform, containerRef]);

    return {
        transform,
        isDragging,
        zoomToFit,
        centerOn,
        expandToDepth,
        resetView,
        zoomIn,
        zoomOut
    };
};
