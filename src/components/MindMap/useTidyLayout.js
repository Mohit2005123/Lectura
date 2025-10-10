'use client';
import { useMemo, useCallback } from 'react';
import { hierarchy, tree } from 'd3';
import { calculateNodeDimensions, getNodeFont } from './textUtils';

/**
 * Custom hook for tidy tree layout using D3
 * Implements Reingold-Tilford algorithm with proper spacing
 */
export const useTidyLayout = (data, expandedNodes) => {
    // Layout constants matching NotebookLM style
    const NODE_X = 120; // Horizontal gap between levels
    const NODE_Y = 36; // Minimum vertical gap between siblings
    const SUBTREE_SEPARATION = 16; // Minimum separation between subtrees
    const SIBLING_SEPARATION = 12; // Minimum separation between siblings

    /**
     * Create D3 hierarchy and apply tidy tree layout
     */
    const layout = useMemo(() => {
        if (!data) return { nodes: [], links: [] };

        // Create D3 hierarchy
        const root = hierarchy(data, d => d.children);

        // Configure tidy tree layout
        const treeLayout = tree()
            .nodeSize([NODE_Y, NODE_X])
            .separation((a, b) => {
                // Custom separation function for better spacing
                if (a.parent === b.parent) {
                    return SIBLING_SEPARATION / NODE_Y;
                }
                return SUBTREE_SEPARATION / NODE_Y;
            });

        // Apply layout
        treeLayout(root);

        // Process nodes and calculate dimensions
        const nodes = [];
        const links = [];

        // Traverse the tree and collect nodes
        root.eachBefore((d) => {
            const level = d.depth;
            const isExpanded = expandedNodes.has(d.data.id);
            const hasChildren = d.children && d.children.length > 0;

            // Calculate node dimensions
            const font = getNodeFont(level);
            const dimensions = calculateNodeDimensions(
                d.data.title || d.data.text || 'Untitled',
                260, // max width
                font
            );

            nodes.push({
                id: d.data.id,
                title: d.data.title || d.data.text || 'Untitled',
                level: level,
                x: d.x,
                y: d.y,
                width: dimensions.width,
                height: dimensions.height,
                lines: dimensions.lines,
                isExpanded: isExpanded,
                hasChildren: hasChildren,
                parentId: d.parent ? d.parent.data.id : null,
                data: d.data
            });
        });

        // Generate links
        root.links().forEach((link) => {
            const source = link.source;
            const target = link.target;

            links.push({
                id: `${source.data.id}-${target.data.id}`,
                source: {
                    id: source.data.id,
                    x: source.x,
                    y: source.y,
                    width: nodes.find(n => n.id === source.data.id)?.width || 160,
                    height: nodes.find(n => n.id === source.data.id)?.height || 40
                },
                target: {
                    id: target.data.id,
                    x: target.x,
                    y: target.y,
                    width: nodes.find(n => n.id === target.data.id)?.width || 160,
                    height: nodes.find(n => n.id === target.data.id)?.height || 40
                }
            });
        });

        return { nodes, links };
    }, [data, expandedNodes]);

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
