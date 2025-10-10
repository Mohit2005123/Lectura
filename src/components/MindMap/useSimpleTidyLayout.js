'use client';
import { useMemo, useCallback } from 'react';
import { calculateNodeDimensions, getNodeFont } from './textUtils';

/**
 * Simple tidy tree layout implementation without D3
 * Implements Reingold-Tilford algorithm with proper spacing
 */
export const useSimpleTidyLayout = (data, expandedNodes) => {
    // Layout constants matching NotebookLM style
    const NODE_X = 300; // Horizontal gap between levels - significantly increased for better spacing
    const NODE_Y = 80; // Minimum vertical gap between siblings - increased for better spacing
    const SUBTREE_SEPARATION = 30; // Minimum separation between subtrees
    const SIBLING_SEPARATION = 20; // Minimum separation between siblings

    /**
     * Calculate tidy tree positions
     */
    const calculateTidyPositions = useCallback((nodes, nodeX, nodeY) => {
        if (!nodes.length) return [];

        // Group nodes by level
        const nodesByLevel = {};
        nodes.forEach(node => {
            if (!nodesByLevel[node.level]) {
                nodesByLevel[node.level] = [];
            }
            nodesByLevel[node.level].push(node);
        });

        const positionedNodes = [];
        const levels = Object.keys(nodesByLevel).map(Number).sort((a, b) => a - b);

        // Position root node
        if (nodesByLevel[0] && nodesByLevel[0].length > 0) {
            const rootNode = nodesByLevel[0][0];
            rootNode.x = 0;
            rootNode.y = 0; // Keep root at Y=0 for now
            positionedNodes.push(rootNode);
        }

        // Position nodes level by level
        for (const level of levels) {
            if (level === 0) continue;

            const levelNodes = nodesByLevel[level];

            // Group nodes by parent
            const nodesByParent = {};
            levelNodes.forEach(node => {
                if (!nodesByParent[node.parentId]) {
                    nodesByParent[node.parentId] = [];
                }
                nodesByParent[node.parentId].push(node);
            });

            // Position each parent's children
            Object.keys(nodesByParent).forEach(parentId => {
                const parentNode = positionedNodes.find(n => n.id === parentId);
                if (!parentNode) return;

                const children = nodesByParent[parentId];
                const x = parentNode.x + nodeX;

                // Calculate positions for children
                children.forEach((child, index) => {
                    let y;

                    if (children.length === 1) {
                        // Single child - align with parent
                        y = parentNode.y;
                    } else {
                        // Multiple children - distribute vertically
                        const totalSpacing = (children.length - 1) * nodeY;
                        const startY = parentNode.y - totalSpacing / 2;
                        y = startY + index * nodeY;
                    }

                    child.x = x;
                    child.y = y;
                    positionedNodes.push(child);
                });
            });
        }

        // Apply collision resolution
        return resolveCollisions(positionedNodes);
    }, []);

    /**
     * Resolve collisions between nodes
     */
    const resolveCollisions = useCallback((nodes) => {
        const MIN_DISTANCE = 60; // Increased minimum distance
        const MAX_ITERATIONS = 8; // More iterations for better spacing
        const DAMPING = 0.7; // Slightly less damping for more movement

        // Group nodes by level
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

        return nodes;
    }, []);

    /**
     * Simple tidy tree layout algorithm
     */
    const layout = useMemo(() => {
        if (!data) return { nodes: [], links: [] };

        // Convert data to flat structure with hierarchy info
        const nodes = [];
        const links = [];
        const nodeMap = new Map();

        // First pass: create all nodes with dimensions
        const processNode = (node, level = 0, parentId = null) => {
            const isExpanded = expandedNodes.has(node.id);
            const hasChildren = node.children && node.children.length > 0;

            // Calculate node dimensions
            const font = getNodeFont(level);
            const dimensions = calculateNodeDimensions(
                node.title || node.text || 'Untitled',
                260, // max width
                font
            );

            const nodeData = {
                id: node.id,
                title: node.title || node.text || 'Untitled',
                level: level,
                x: 0, // Will be calculated
                y: 0, // Will be calculated
                width: dimensions.width,
                height: dimensions.height,
                lines: dimensions.lines,
                isExpanded: isExpanded,
                hasChildren: hasChildren,
                parentId: parentId,
                data: node,
                children: hasChildren && isExpanded ? node.children : []
            };

            nodes.push(nodeData);
            nodeMap.set(node.id, nodeData);

            // Add children if expanded
            if (hasChildren && isExpanded) {
                node.children.forEach(child => {
                    processNode(child, level + 1, node.id);
                });
            }
        };

        processNode(data);

        // Second pass: calculate positions using simple tidy tree algorithm
        const positionedNodes = calculateTidyPositions(nodes, NODE_X, NODE_Y);

        // Update nodeMap with positioned nodes
        positionedNodes.forEach(node => {
            nodeMap.set(node.id, node);
        });

        // Third pass: generate links
        positionedNodes.forEach(node => {
            if (node.level > 0 && node.parentId) {
                const parent = nodeMap.get(node.parentId);
                if (parent) {
                    const link = {
                        id: `${parent.id}-${node.id}`,
                        source: {
                            id: parent.id,
                            x: parent.x,
                            y: parent.y,
                            width: parent.width,
                            height: parent.height
                        },
                        target: {
                            id: node.id,
                            x: node.x,
                            y: node.y,
                            width: node.width,
                            height: node.height
                        }
                    };
                    links.push(link);
                } else {
                    console.warn('Parent not found for node:', node.title, 'parentId:', node.parentId);
                }
            }
        });

        return { nodes: positionedNodes, links };
    }, [data, expandedNodes, calculateTidyPositions, resolveCollisions]);

    /**
     * Calculate bounding box of all visible nodes
     */
    const getBoundingBox = useCallback(() => {
        if (!layout.nodes.length) return { x: 0, y: 0, width: 0, height: 0 };

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        layout.nodes.forEach(node => {
            const halfWidth = node.width / 2;
            const halfHeight = node.height / 2;

            minX = Math.min(minX, node.x - halfWidth);
            minY = Math.min(minY, node.y - halfHeight);
            maxX = Math.max(maxX, node.x + halfWidth);
            maxY = Math.max(maxY, node.y + halfHeight);
        });

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };
    }, [layout.nodes]);

    /**
     * Check if a node should be visible (all parents expanded)
     */
    const isNodeVisible = useCallback((nodeId, parentId) => {
        if (!parentId) return true; // Root node
        return expandedNodes.has(parentId);
    }, [expandedNodes]);

    return {
        layout,
        getBoundingBox,
        isNodeVisible
    };
};
