'use client';
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Simple pan and zoom functionality without D3
 * Provides smooth pan/zoom with zoom-to-fit capabilities
 */
export const useSimplePanZoom = (containerRef, nodes, containerSize) => {
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const dragState = useRef({
        dragging: false,
        startX: 0,
        startY: 0,
        startPanX: 0,
        startPanY: 0
    });

    /**
     * Handle mouse wheel for zooming
     */
    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const zoomIntensity = 0.001;
        const delta = -e.deltaY * zoomIntensity;
        const newScale = Math.min(3, Math.max(0.2, transform.k * (1 + delta)));

        // Calculate zoom center point
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            const centerX = e.clientX - rect.left;
            const centerY = e.clientY - rect.top;

            // Adjust translation to zoom around cursor
            const scaleFactor = newScale / transform.k;
            const newX = centerX - (centerX - transform.x) * scaleFactor;
            const newY = centerY - (centerY - transform.y) * scaleFactor;

            setTransform({ x: newX, y: newY, k: newScale });
        } else {
            setTransform(prev => ({ ...prev, k: newScale }));
        }
    }, [transform]);

    /**
     * Handle mouse down for panning
     */
    const handleMouseDown = useCallback((e) => {
        if (e.target.closest('.control-button') || e.target.closest('button')) return;

        dragState.current = {
            dragging: true,
            startX: e.clientX,
            startY: e.clientY,
            startPanX: transform.x,
            startPanY: transform.y
        };
        setIsDragging(true);
    }, [transform.x, transform.y]);

    /**
     * Handle mouse move for panning
     */
    const handleMouseMove = useCallback((e) => {
        if (!dragState.current.dragging) return;

        const deltaX = e.clientX - dragState.current.startX;
        const deltaY = e.clientY - dragState.current.startY;

        setTransform(prev => ({
            ...prev,
            x: dragState.current.startPanX + deltaX,
            y: dragState.current.startPanY + deltaY
        }));
    }, []);

    /**
     * Handle mouse up for panning
     */
    const handleMouseUp = useCallback(() => {
        if (dragState.current.dragging) {
            dragState.current.dragging = false;
            setIsDragging(false);
        }
    }, []);

    // Set up event listeners
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('wheel', handleWheel, { passive: false });
        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mouseleave', handleMouseUp);

        return () => {
            container.removeEventListener('wheel', handleWheel);
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('mouseleave', handleMouseUp);
        };
    }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

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

        setTransform({ x: translateX, y: translateY, k: scale });
    }, [nodes, containerSize, containerRef]);

    /**
     * Center on a specific node
     */
    const centerOn = useCallback((nodeId) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node || !containerRef.current) return;

        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;

        const translateX = centerX - node.x * transform.k;
        const translateY = centerY - node.y * transform.k;

        setTransform(prev => ({
            ...prev,
            x: translateX,
            y: translateY
        }));
    }, [nodes, containerSize, transform.k]);

    /**
     * Expand to a specific depth
     */
    const expandToDepth = useCallback((depth) => {
        console.log(`Expanding to depth ${depth}`);
    }, []);

    /**
     * Reset zoom and pan
     */
    const resetView = useCallback(() => {
        setTransform({ x: 0, y: 0, k: 1 });
    }, []);

    /**
     * Zoom in
     */
    const zoomIn = useCallback(() => {
        const newScale = Math.min(transform.k * 1.2, 3);
        setTransform(prev => ({ ...prev, k: newScale }));
    }, [transform.k]);

    /**
     * Zoom out
     */
    const zoomOut = useCallback(() => {
        const newScale = Math.max(transform.k / 1.2, 0.2);
        setTransform(prev => ({ ...prev, k: newScale }));
    }, [transform.k]);

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
