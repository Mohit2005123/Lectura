'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { animate, easing } from './utils';

/**
 * Custom hook for managing animated layout transitions
 * @param {Object} layout - Current layout data
 * @param {number} duration - Animation duration in milliseconds
 */
export const useAnimatedLayout = (layout, duration = 300) => {
    const [animatedNodes, setAnimatedNodes] = useState([]);
    const [animatedConnections, setAnimatedConnections] = useState([]);
    const [isAnimating, setIsAnimating] = useState(false);
    const previousLayoutRef = useRef({ nodes: [], connections: [] });
    const animationRefs = useRef([]);

    // Cancel all ongoing animations
    const cancelAllAnimations = useCallback(() => {
        animationRefs.current.forEach(cancel => {
            if (cancel) cancel();
        });
        animationRefs.current = [];
    }, []);

    // Animate a single node position
    const animateNodePosition = useCallback((nodeId, fromPos, toPos, onComplete) => {
        const startTime = performance.now();
        let animationId;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing.easeInOut(progress);

            const currentX = fromPos.x + (toPos.x - fromPos.x) * easedProgress;
            const currentY = fromPos.y + (toPos.y - fromPos.y) * easedProgress;

            setAnimatedNodes(prev =>
                prev.map(node =>
                    node.id === nodeId
                        ? { ...node, x: currentX, y: currentY }
                        : node
                )
            );

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        };

        animationId = requestAnimationFrame(animate);
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [duration]);

    // Animate connection path changes
    const animateConnection = useCallback((connectionId, fromPath, toPath, onComplete) => {
        const startTime = performance.now();
        let animationId;

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easing.easeInOut(progress);

            // For now, we'll just update the path directly
            // In a more complex implementation, we could interpolate between path points
            setAnimatedConnections(prev =>
                prev.map(conn =>
                    conn.id === connectionId
                        ? { ...conn, path: toPath }
                        : conn
                )
            );

            if (progress < 1) {
                animationId = requestAnimationFrame(animate);
            } else {
                if (onComplete) onComplete();
            }
        };

        animationId = requestAnimationFrame(animate);
        return () => {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
        };
    }, [duration]);

    // Update animated layout when layout changes
    useEffect(() => {
        if (!layout || !layout.nodes || !layout.nodes.length) {
            setAnimatedNodes([]);
            setAnimatedConnections([]);
            return;
        }

        const previousLayout = previousLayoutRef.current;
        const hasPreviousLayout = previousLayout && previousLayout.nodes && previousLayout.nodes.length > 0;

        if (!hasPreviousLayout) {
            // First render - no animation needed
            setAnimatedNodes(layout.nodes);
            setAnimatedConnections(layout.connections);
            previousLayoutRef.current = { ...layout };
            return;
        }

        // Check if layout actually changed
        const layoutChanged =
            layout.nodes.length !== previousLayout.nodes.length ||
            layout.nodes.some((node, index) => {
                const prevNode = previousLayout.nodes[index];
                return !prevNode ||
                    node.x !== prevNode.x ||
                    node.y !== prevNode.y ||
                    node.id !== prevNode.id;
            });

        if (!layoutChanged) {
            return;
        }

        setIsAnimating(true);
        cancelAllAnimations();

        // Create a map of previous positions for smooth transitions
        const previousPositions = new Map();
        if (previousLayout && previousLayout.nodes) {
            previousLayout.nodes.forEach(node => {
                previousPositions.set(node.id, { x: node.x, y: node.y });
            });
        }

        // Start with previous positions
        const initialNodes = previousLayout && previousLayout.nodes
            ? previousLayout.nodes.map(node => {
                const currentNode = layout.nodes.find(n => n.id === node.id);
                return currentNode ? { ...currentNode, x: node.x, y: node.y } : node;
            })
            : layout.nodes;

        setAnimatedNodes(initialNodes);

        // Animate each node to its new position
        let completedAnimations = 0;
        const totalAnimations = layout.nodes.length;

        const onAnimationComplete = () => {
            completedAnimations++;
            if (completedAnimations >= totalAnimations) {
                setIsAnimating(false);
                // Ensure final positions are exact
                setAnimatedNodes(layout.nodes);
                setAnimatedConnections(layout.connections);
            }
        };

        layout.nodes.forEach(node => {
            const previousPos = previousPositions.get(node.id);
            const currentPos = { x: node.x, y: node.y };

            if (previousPos) {
                const distance = Math.sqrt(
                    Math.pow(currentPos.x - previousPos.x, 2) +
                    Math.pow(currentPos.y - previousPos.y, 2)
                );

                if (distance > 1) { // Only animate if position changed significantly
                    const cancel = animateNodePosition(
                        node.id,
                        previousPos,
                        currentPos,
                        onAnimationComplete
                    );
                    animationRefs.current.push(cancel);
                } else {
                    onAnimationComplete();
                }
            } else {
                // New node - fade in from parent position
                const parentNode = layout.nodes.find(n => n.id === node.parentId);
                const startPos = parentNode ? { x: parentNode.x, y: parentNode.y } : currentPos;

                const cancel = animateNodePosition(
                    node.id,
                    startPos,
                    currentPos,
                    onAnimationComplete
                );
                animationRefs.current.push(cancel);
            }
        });

        // Update connections
        setAnimatedConnections(layout.connections);

        // Update previous layout reference
        previousLayoutRef.current = { ...layout };

    }, [layout, animateNodePosition, cancelAllAnimations]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            cancelAllAnimations();
        };
    }, [cancelAllAnimations]);

    return {
        animatedNodes,
        animatedConnections,
        isAnimating
    };
};
