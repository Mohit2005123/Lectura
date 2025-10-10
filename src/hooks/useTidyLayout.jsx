/**
 * Tidy tree layout hook using D3 hierarchy
 * Handles text measurement, layout calculation, and collision prevention
 */

import { useMemo, useCallback } from 'react';
import { hierarchy, tree } from 'd3-hierarchy';
import { measureText, getNodeFont } from '../utils/measureText';

export function useTidyLayout(data, expandedNodes) {
    // Layout constants
    const BASE_NODE_X = 280; // base horizontal gap between levels
    const NODE_Y = 28;  // baseline vertical gap between nodes
    const SPACING_SCALE_FACTOR = 0.15; // scaling factor for continuous spacing increase
    const MAX_SPACING_MULTIPLIER = 4; // maximum spacing multiplier to prevent excessive spacing

    /**
     * Measure and prepare node data with box dimensions
     */
    const prepareNodeData = useCallback((nodeData, level = 0) => {
        const font = getNodeFont(level);
        const hasChildren = nodeData.children && nodeData.children.length > 0;
        const { lines, boxWidth, boxHeight } = measureText(nodeData.title || nodeData.text, font, 220, hasChildren);

        return {
            ...nodeData,
            boxWidth,
            boxHeight,
            lines,
            collapsed: !expandedNodes.has(nodeData.id),
            level,
            hasChildren
        };
    }, [expandedNodes]);

    /**
     * Build hierarchy with measured dimensions
     */
    const buildHierarchy = useCallback((nodeData, level = 0) => {
        const prepared = prepareNodeData(nodeData, level);

        if (prepared.children && !prepared.collapsed) {
            prepared.children = prepared.children.map(child =>
                buildHierarchy(child, level + 1)
            );
        } else {
            prepared.children = undefined; // Remove children if collapsed
        }

        return prepared;
    }, [prepareNodeData]);

    /**
     * Calculate dynamic spacing based on node count per level
     * Continuously increases spacing based on node count without threshold
     */
    const calculateDynamicSpacing = useCallback((nodes) => {
        // Count nodes per level
        const nodesByLevel = {};
        nodes.forEach(node => {
            if (!nodesByLevel[node.depth]) {
                nodesByLevel[node.depth] = 0;
            }
            nodesByLevel[node.depth]++;
        });

        // Calculate spacing multipliers for each level
        const levelSpacing = {};
        Object.entries(nodesByLevel).forEach(([depth, count]) => {
            // Continuous scaling: multiplier = 1 + (count * scale_factor)
            // This ensures spacing increases smoothly with node count
            const multiplier = 1 + (count * SPACING_SCALE_FACTOR);
            levelSpacing[depth] = Math.min(multiplier, MAX_SPACING_MULTIPLIER);
        });

        return levelSpacing;
    }, [SPACING_SCALE_FACTOR, MAX_SPACING_MULTIPLIER]);

    /**
     * Apply dynamic spacing to nodes
     */
    const applyDynamicSpacing = useCallback((nodes) => {
        const levelSpacing = calculateDynamicSpacing(nodes);

        // Apply spacing adjustments to nodes
        nodes.forEach(node => {
            const spacingMultiplier = levelSpacing[node.depth] || 1;
            if (spacingMultiplier > 1) {
                // Adjust horizontal position based on spacing multiplier
                const baseOffset = (spacingMultiplier - 1) * BASE_NODE_X * 0.5;
                node.y += baseOffset;

                // Propagate to children
                const propagateSpacing = (childNode, offset) => {
                    childNode.y += offset;
                    if (childNode.children) {
                        childNode.children.forEach(child => propagateSpacing(child, offset));
                    }
                };

                if (node.children) {
                    node.children.forEach(child => propagateSpacing(child, baseOffset));
                }
            }
        });

        return nodes;
    }, [calculateDynamicSpacing, BASE_NODE_X]);

    /**
     * Apply scanline collision prevention
     */
    const applyCollisionPrevention = useCallback((nodes) => {
        // Group nodes by depth level
        const nodesByLevel = {};
        nodes.forEach(node => {
            if (!nodesByLevel[node.depth]) {
                nodesByLevel[node.depth] = [];
            }
            nodesByLevel[node.depth].push(node);
        });

        // Apply collision prevention level by level
        Object.values(nodesByLevel).forEach(levelNodes => {
            // Sort nodes by x position (vertical position in our layout)
            levelNodes.sort((a, b) => a.x - b.x);

            // Check for overlaps and adjust positions
            for (let i = 1; i < levelNodes.length; i++) {
                const prevNode = levelNodes[i - 1];
                const currentNode = levelNodes[i];

                const prevBottom = prevNode.x + (prevNode.data.boxHeight || 40) / 2;
                const currentTop = currentNode.x - (currentNode.data.boxHeight || 40) / 2;

                // If nodes overlap, push current node down
                if (currentTop < prevBottom + 8) { // 8px minimum gap
                    const delta = prevBottom + 8 - currentTop;
                    currentNode.x += delta;

                    // Propagate delta to all descendants
                    const propagateDelta = (node, offset) => {
                        node.x += offset;
                        if (node.children) {
                            node.children.forEach(child => propagateDelta(child, offset));
                        }
                    };

                    if (currentNode.children) {
                        currentNode.children.forEach(child => propagateDelta(child, delta));
                    }
                }
            }
        });

        return nodes;
    }, []);

    /**
     * Calculate layout using D3 tidy tree
     */
    const layout = useMemo(() => {
        if (!data) return { nodes: [], links: [], bbox: { x: 0, y: 0, width: 0, height: 0 } };

        // Build hierarchy with measured dimensions
        const preparedData = buildHierarchy(data);
        const hierarchyData = hierarchy(preparedData);

        // Create tidy tree layout
        const treeLayout = tree()
            .nodeSize([NODE_Y, BASE_NODE_X])
            .separation((a, b) => {
                const ah = a.data.boxHeight || 40;
                const bh = b.data.boxHeight || 40;
                const base = (ah + bh) / 2 / NODE_Y + 0.5;
                return (a.parent === b.parent ? 1 : 1.25) * base;
            });

        // Apply layout
        const root = treeLayout(hierarchyData);

        // Flatten nodes and apply dynamic spacing and collision prevention
        const nodes = [];
        root.each(node => {
            nodes.push(node);
        });

        // Apply dynamic spacing first
        const spacedNodes = applyDynamicSpacing(nodes);

        // Then apply collision prevention
        const adjustedNodes = applyCollisionPrevention(spacedNodes);

        // Generate links
        const links = [];
        adjustedNodes.forEach(node => {
            if (node.parent) {
                links.push({
                    source: node.parent,
                    target: node
                });
            }
        });

        // Calculate bounding box
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        adjustedNodes.forEach(node => {
            const halfWidth = (node.data.boxWidth || 160) / 2;
            const halfHeight = (node.data.boxHeight || 40) / 2;

            minX = Math.min(minX, node.y - halfWidth);
            minY = Math.min(minY, node.x - halfHeight);
            maxX = Math.max(maxX, node.y + halfWidth);
            maxY = Math.max(maxY, node.x + halfHeight);
        });

        const bbox = {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
        };

        return {
            nodes: adjustedNodes,
            links,
            bbox
        };
    }, [data, buildHierarchy, applyDynamicSpacing, applyCollisionPrevention]);

    return layout;
}
