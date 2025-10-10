'use client';
import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for mindmap layout calculations and state management
 * Implements hierarchical tree layout with dynamic positioning
 */
export const useLayout = (data, containerSize) => {
    const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
    const [nodePositions, setNodePositions] = useState(new Map());

    // Layout constants for infinite canvas
    const LEVEL_GAP = 600; // Very generous horizontal gap between levels
    const VERTICAL_SPACING = 300; // Very generous vertical spacing between siblings
    const ROOT_X = 300; // Root node X position
    const MIN_NODE_WIDTH = 180;
    const MAX_NODE_WIDTH = 400;

    /**
     * Toggle node expansion state
     * @param {string} nodeId - ID of node to toggle
     */
    const toggleNode = useCallback((nodeId) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                // Collapse: remove this node and all descendants
                newSet.delete(nodeId);
                removeDescendants(nodeId, newSet);
            } else {
                // Expand: add this node
                newSet.add(nodeId);
            }
            return newSet;
        });
    }, []);

    /**
     * Remove all descendant nodes from expanded set
     * @param {string} nodeId - Parent node ID
     * @param {Set} expandedSet - Set to modify
     */
    const removeDescendants = useCallback((nodeId, expandedSet) => {
        const findAndRemoveDescendants = (node) => {
            if (node.children && Array.isArray(node.children)) {
                node.children.forEach(child => {
                    expandedSet.delete(child.id);
                    findAndRemoveDescendants(child);
                });
            }
        };

        if (data) {
            const findNode = (node) => {
                if (node.id === nodeId) {
                    findAndRemoveDescendants(node);
                    return true;
                }
                if (node.children && Array.isArray(node.children)) {
                    return node.children.some(findNode);
                }
                return false;
            };
            findNode(data);
        }
    }, [data]);

    /**
     * Check if a node should be visible (all parents must be expanded)
     * @param {Object} node - Node to check
     * @param {string} parentId - Parent node ID
     * @returns {boolean} Whether node is visible
     */
    const isNodeVisible = useCallback((node, parentId = null) => {
        if (!node) return false;

        // Root node is always visible
        if (!parentId) return true;

        // Check if parent is expanded
        return expandedNodes.has(parentId);
    }, [expandedNodes]);

    /**
     * Calculate node width based on text content
     * @param {Object} node - Node object with title or text property
     * @returns {number} Calculated width in pixels
     */
    const calculateNodeWidth = useCallback((node) => {
        const text = node.title || node.text || '';
        if (!text) return MIN_NODE_WIDTH;

        // Estimate width based on character count with better sizing
        const charWidth = 10; // Increased character width for better readability
        const padding = 60; // Increased horizontal padding for better appearance
        const estimatedWidth = text.length * charWidth + padding;

        return Math.max(MIN_NODE_WIDTH, Math.min(MAX_NODE_WIDTH, estimatedWidth));
    }, []);

    /**
     * Get all visible nodes in the tree
     * @param {Object} root - Root node
     * @param {number} level - Current level
     * @param {string} parentId - Parent node ID
     * @returns {Array} Array of visible nodes
     */
    const getVisibleNodes = useCallback((root, level = 0, parentId = null) => {
        if (!root) return [];

        const visibleNodes = [];

        // Check if current node should be visible
        if (isNodeVisible(root, parentId)) {
            const hasChildren = root.children && root.children.length > 0;
            const isExpanded = expandedNodes.has(root.id);

            visibleNodes.push({
                ...root,
                level,
                parentId,
                hasChildren,
                isExpanded,
                width: calculateNodeWidth(root)
            });

            // Add children if current node is expanded
            if (hasChildren && isExpanded) {
                root.children.forEach(child => {
                    const childNodes = getVisibleNodes(child, level + 1, root.id);
                    visibleNodes.push(...childNodes);
                });
            }
        }

        return visibleNodes;
    }, [isNodeVisible, expandedNodes, calculateNodeWidth]);

    /**
     * Calculate positions for all visible nodes with infinite canvas layout
     * @param {Array} visibleNodes - Array of visible nodes
     * @returns {Array} Array of positioned nodes
     */
    const calculatePositions = useCallback((visibleNodes) => {
        if (!visibleNodes.length) return [];

        const positionedNodes = [];
        const nodesByLevel = {};

        // Group nodes by level
        visibleNodes.forEach(node => {
            if (!nodesByLevel[node.level]) {
                nodesByLevel[node.level] = [];
            }
            nodesByLevel[node.level].push(node);
        });

        // Position nodes level by level with infinite canvas
        Object.keys(nodesByLevel).forEach(levelStr => {
            const level = parseInt(levelStr);
            const levelNodes = nodesByLevel[level];

            if (level === 0) {
                // Root node - positioned at origin
                const rootNode = levelNodes[0];
                positionedNodes.push({
                    ...rootNode,
                    x: ROOT_X,
                    y: 0 // Start at origin, no container height restriction
                });
            } else {
                // Child nodes - position with generous spacing
                const positionedNodesAtLevel = [];

                // Group nodes by their parent
                const nodesByParent = {};
                levelNodes.forEach(node => {
                    if (!nodesByParent[node.parentId]) {
                        nodesByParent[node.parentId] = [];
                    }
                    nodesByParent[node.parentId].push(node);
                });

                // Process each parent group
                Object.keys(nodesByParent).forEach(parentId => {
                    const parentNode = positionedNodes.find(n => n.id === parentId);
                    if (!parentNode) return;

                    const children = nodesByParent[parentId];
                    const x = ROOT_X + (level * LEVEL_GAP);

                    // Calculate positions for this parent's children
                    children.forEach((child, index) => {
                        const minSpacing = VERTICAL_SPACING;
                        let y;

                        if (children.length === 1) {
                            // Single child - position directly to the right of parent
                            y = parentNode.y;
                        } else {
                            // Multiple children - distribute vertically around parent
                            const totalSpacing = (children.length - 1) * minSpacing;
                            const startY = parentNode.y - totalSpacing / 2;
                            y = startY + index * minSpacing;
                        }

                        positionedNodesAtLevel.push({
                            ...child,
                            x,
                            y
                        });
                    });
                });

                // Add all positioned nodes at this level
                positionedNodes.push(...positionedNodesAtLevel);
            }
        });

        // Apply infinite canvas spacing - no container restrictions
        return applyInfiniteCanvasSpacing(positionedNodes);
    }, []);

    /**
     * Apply infinite canvas spacing - no container restrictions
     * @param {Array} nodes - Array of positioned nodes
     * @returns {Array} Array of nodes with infinite canvas spacing
     */
    const applyInfiniteCanvasSpacing = useCallback((nodes) => {
        const spacedNodes = [...nodes];
        const MIN_DISTANCE = 350; // Extremely generous minimum distance between nodes
        const MAX_ITERATIONS = 10; // More iterations for better spacing
        const DAMPING = 0.8; // Higher damping for more stable positioning

        // Group nodes by level for better collision resolution
        const nodesByLevel = {};
        spacedNodes.forEach(node => {
            if (!nodesByLevel[node.level]) {
                nodesByLevel[node.level] = [];
            }
            nodesByLevel[node.level].push(node);
        });

        // Resolve collisions level by level with infinite space
        Object.keys(nodesByLevel).forEach(levelStr => {
            const level = parseInt(levelStr);
            const levelNodes = nodesByLevel[level];

            for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
                let hasCollisions = false;

                for (let i = 0; i < levelNodes.length; i++) {
                    for (let j = i + 1; j < levelNodes.length; j++) {
                        const node1 = levelNodes[i];
                        const node2 = levelNodes[j];

                        // Calculate distance between nodes
                        const dx = node2.x - node1.x;
                        const dy = node2.y - node1.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < MIN_DISTANCE && distance > 0) {
                            hasCollisions = true;

                            // Calculate separation vector
                            const separation = MIN_DISTANCE - distance;
                            const normalizedDx = dx / distance;
                            const normalizedDy = dy / distance;

                            // Apply separation with damping
                            const moveX = normalizedDx * separation * DAMPING / 2;
                            const moveY = normalizedDy * separation * DAMPING / 2;

                            // Move nodes apart - no container restrictions
                            node1.x -= moveX;
                            node1.y -= moveY;
                            node2.x += moveX;
                            node2.y += moveY;
                        }
                    }
                }

                if (!hasCollisions) break;
            }
        });

        // No container bounds restrictions - infinite canvas
        return spacedNodes;
    }, []);

    /**
     * Resolve node collisions by adjusting positions
     * @param {Array} nodes - Array of positioned nodes
     * @returns {Array} Array of nodes with resolved collisions
     */
    const resolveCollisions = useCallback((nodes) => {
        const MIN_DISTANCE = 140; // Minimum distance between nodes
        const MAX_ITERATIONS = 15;
        const DAMPING = 0.8; // Damping factor for smoother convergence

        // Group nodes by level for better collision resolution
        const nodesByLevel = {};
        nodes.forEach(node => {
            if (!nodesByLevel[node.level]) {
                nodesByLevel[node.level] = [];
            }
            nodesByLevel[node.level].push(node);
        });

        // Resolve collisions level by level
        Object.keys(nodesByLevel).forEach(levelStr => {
            const level = parseInt(levelStr);
            const levelNodes = nodesByLevel[level];

            for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
                let hasCollisions = false;

                for (let i = 0; i < levelNodes.length; i++) {
                    for (let j = i + 1; j < levelNodes.length; j++) {
                        const node1 = levelNodes[i];
                        const node2 = levelNodes[j];

                        // Calculate distance between nodes
                        const dx = node2.x - node1.x;
                        const dy = node2.y - node1.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < MIN_DISTANCE && distance > 0) {
                            hasCollisions = true;

                            // Calculate separation vector
                            const separation = MIN_DISTANCE - distance;
                            const normalizedDx = dx / distance;
                            const normalizedDy = dy / distance;

                            // Apply separation with damping
                            const moveX = normalizedDx * separation * DAMPING / 2;
                            const moveY = normalizedDy * separation * DAMPING / 2;

                            // Move nodes apart
                            node1.x -= moveX;
                            node1.y -= moveY;
                            node2.x += moveX;
                            node2.y += moveY;
                        }
                    }
                }

                if (!hasCollisions) break;
            }
        });

        // Final pass: ensure nodes don't go outside reasonable bounds
        const MARGIN = 50;
        const MIN_Y = MARGIN;
        const MAX_Y = containerSize.height - MARGIN;

        nodes.forEach(node => {
            node.y = Math.max(MIN_Y, Math.min(MAX_Y, node.y));
        });

        return nodes;
    }, [containerSize.height]);

    /**
     * Generate curved Bezier paths for connections with natural flow
     * @param {Array} positionedNodes - Array of positioned nodes
     * @returns {Array} Array of connection paths
     */
    const generateConnections = useCallback((positionedNodes) => {
        const connections = [];

        positionedNodes.forEach(node => {
            if (node.level > 0 && node.parentId) {
                const parentNode = positionedNodes.find(n => n.id === node.parentId);

                if (parentNode) {
                    // Calculate connection points
                    const parentX = parentNode.x + (parentNode.width || 150) / 2;
                    const parentY = parentNode.y;
                    const childX = node.x - (node.width || 150) / 2;
                    const childY = node.y;

                    // Create smooth Bezier curve with natural control points
                    const horizontalDistance = childX - parentX;
                    const verticalDistance = childY - parentY;

                    // Natural curve intensity based on distance
                    const curveIntensity = Math.min(0.5, Math.max(0.2, horizontalDistance / 300));
                    const controlPoint1X = parentX + horizontalDistance * curveIntensity;
                    const controlPoint1Y = parentY;
                    const controlPoint2X = childX - horizontalDistance * curveIntensity;
                    const controlPoint2Y = childY;

                    connections.push({
                        id: `${parentNode.id}-${node.id}`,
                        parentId: parentNode.id,
                        childId: node.id,
                        path: `M ${parentX} ${parentY} C ${controlPoint1X} ${controlPoint1Y}, ${controlPoint2X} ${controlPoint2Y}, ${childX} ${childY}`,
                        startX: parentX,
                        startY: parentY,
                        endX: childX,
                        endY: childY,
                        level: parentNode.level
                    });
                }
            }
        });

        return connections;
    }, []);

    // Memoized layout calculation
    const layout = useMemo(() => {
        if (!data) return { nodes: [], connections: [] };

        const visibleNodes = getVisibleNodes(data);
        const positionedNodes = calculatePositions(visibleNodes);
        const connections = generateConnections(positionedNodes);

        return {
            nodes: positionedNodes,
            connections
        };
    }, [data, getVisibleNodes, calculatePositions, generateConnections, expandedNodes]);

    return {
        layout,
        expandedNodes,
        toggleNode,
        isNodeVisible
    };
};
