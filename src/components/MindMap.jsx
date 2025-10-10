/**
 * Main MindMap component with unified coordinate space
 * Renders SVG with nodes and links in the same transformed group
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTidyLayout } from '../hooks/useTidyLayout';
import { useBezierLinks } from '../hooks/useBezierLinks';
import { calculateZoomToFit, calculateCenterOnNode } from '../utils/zoomToFit';

// Utility function to ensure unique IDs
const ensureUniqueIds = (data, prefix = 'node') => {
    const idMap = new Map();
    let counter = 0;

    const processNode = (node, path = []) => {
        const currentPath = [...path, node.text || node.title || 'untitled'];
        const pathKey = currentPath.join('-');

        // Check if this ID already exists
        if (idMap.has(node.id)) {
            // Generate a unique ID based on path and counter
            const uniqueId = `${node.id}-${pathKey.replace(/[^a-zA-Z0-9]/g, '-')}-${counter++}`;
            idMap.set(uniqueId, true);
            node.id = uniqueId;
        } else {
            idMap.set(node.id, true);
        }

        // Process children
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => processNode(child, currentPath));
        }
    };

    processNode(data);
    return data;
};

/**
 * Get node color based on depth level (matching reference image)
 */
function getNodeColor(depth, isHovered = false, hasChildren = false) {
    const colors = {
        0: { fill: '#8B5CF6', stroke: '#7C3AED' }, // Deep purple for root
        1: { fill: '#3B82F6', stroke: '#2563EB' }, // Royal blue for level 1
        2: { fill: '#10B981', stroke: '#059669' }, // Lime green for level 2
        3: { fill: '#6366F1', stroke: '#4F46E5' }, // Steel blue for level 3+
        4: { fill: '#6366F1', stroke: '#4F46E5' }, // Steel blue for level 4+
    };

    const level = Math.min(depth, 4);
    const color = colors[level];

    // Only apply hover effect if node has children (is expandable)
    if (isHovered && hasChildren) {
        // Slightly lighter for hover effect
        return {
            fill: level === 0 ? '#A78BFA' :
                level === 1 ? '#60A5FA' :
                    level === 2 ? '#34D399' : '#818CF8',
            stroke: level === 0 ? '#8B5CF6' :
                level === 1 ? '#3B82F6' :
                    level === 2 ? '#10B981' : '#6366F1'
        };
    }

    return color;
}

/**
 * Node component with proper anchoring
 */
function Node({ node, onToggle, isHovered, onHover }) {
    const handleClick = useCallback(() => {
        onToggle(node.data.id);
    }, [node.data.id, onToggle]);

    const handleMouseEnter = useCallback(() => {
        onHover(node.data.id);
    }, [node.data.id, onHover]);

    const handleMouseLeave = useCallback(() => {
        onHover(null);
    }, [onHover]);

    const boxWidth = node.data.boxWidth || 160;
    const boxHeight = node.data.boxHeight || 40;
    const isExpanded = !node.data.collapsed;
    const hasChildren = node.children && node.children.length > 0;

    return (
        <motion.g
            initial={{
                opacity: 0,
                scale: 0.3,
                x: node.parent ? node.parent.y : node.y - 200, // Start from parent position
                y: node.parent ? node.parent.x : node.x
            }}
            animate={{
                opacity: 1,
                scale: 1,
                x: node.y, // Move to final position
                y: node.x
            }}
            exit={{
                opacity: 0,
                scale: 0.3,
                x: node.parent ? node.parent.y : node.y - 200 // Exit back to parent position
            }}
            transition={{
                duration: 0.5,
                ease: "easeInOut",
                type: "spring",
                stiffness: 60,
                damping: 10
            }}
            className="node-group"
            style={{ cursor: hasChildren ? 'pointer' : 'default' }}
        >
            {/* Node background with level-based colors */}
            <rect
                x={-boxWidth / 2}
                y={-boxHeight / 2}
                width={boxWidth}
                height={boxHeight}
                rx="8"
                ry="8"
                fill={getNodeColor(node.depth, isHovered, hasChildren).fill}
                stroke={getNodeColor(node.depth, isHovered, hasChildren).stroke}
                strokeWidth={isHovered && hasChildren ? '2' : '1'}
                style={{
                    filter: isHovered && hasChildren
                        ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                        : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                }}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            />

            {/* Node text - centered when no symbol, offset when symbol present */}
            <text
                x={hasChildren ? -8 : 0}
                y="0"
                textAnchor="middle"
                dominantBaseline="central"
                fill="white"
                fontSize={node.depth === 0 ? '16' : '14'}
                fontWeight="600"
                fontFamily="'Lexend', sans-serif"
                style={{
                    pointerEvents: 'none',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    MozUserSelect: 'none',
                    msUserSelect: 'none'
                }}
            >
                {node.data.lines && node.data.lines.length > 0 ? (
                    node.data.lines.map((line, index) => {
                        // Calculate the vertical offset to center the entire text block
                        const totalLines = node.data.lines.length;
                        const lineHeight = 1.3; // em units
                        const totalHeight = (totalLines - 1) * lineHeight;
                        const startOffset = -totalHeight / 2;

                        return (
                            <tspan
                                key={index}
                                x={hasChildren ? -8 : 0}
                                dy={index === 0 ? `${startOffset}em` : `${lineHeight}em`}
                                textAnchor="middle"
                                dominantBaseline="central"
                            >
                                {line}
                            </tspan>
                        );
                    })
                ) : (
                    node.data.title || node.data.text
                )}
            </text>

            {/* Expand/collapse indicator - positioned on the right */}
            {hasChildren && (
                <text
                    x={boxWidth / 2 - 20}
                    y="0"
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="white"
                    fontSize="14"
                    fontWeight="600"
                    fontFamily="'Lexend', sans-serif"
                    style={{
                        pointerEvents: 'none',
                        textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none'
                    }}
                >
                    {isExpanded ? '▼' : '▶'}
                </text>
            )}
        </motion.g>
    );
}

/**
 * Main MindMap component
 */
export default function MindMap({
    data,
    onNodeClick,
    containerSize = { width: 1200, height: 800 },
    showControls = true
}) {
    // Ensure unique IDs in the data
    const processedData = useMemo(() => {
        if (!data) return null;
        return ensureUniqueIds(JSON.parse(JSON.stringify(data))); // Deep clone and ensure unique IDs
    }, [data]);

    const [expandedNodes, setExpandedNodes] = useState(new Set([processedData?.id]));
    const [hoveredNode, setHoveredNode] = useState(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Store previous expansion states for each node
    const [previousExpansionStates, setPreviousExpansionStates] = useState(new Map());

    const svgRef = useRef(null);
    const containerRef = useRef(null);

    // Helper function to get all descendant node IDs
    const getAllDescendantIds = useCallback((nodeData, nodeId) => {
        const descendants = new Set();

        const findDescendants = (node) => {
            if (node.id === nodeId) {
                if (node.children) {
                    node.children.forEach(child => {
                        descendants.add(child.id);
                        findDescendants(child);
                    });
                }
            } else if (node.children) {
                node.children.forEach(child => findDescendants(child));
            }
        };

        findDescendants(nodeData);
        return descendants;
    }, []);

    // Get layout and links
    const layout = useTidyLayout(processedData, expandedNodes);
    const { links } = useBezierLinks(layout.links);

    // Handle node toggle with previous state memory
    const handleNodeToggle = useCallback((nodeId) => {
        setExpandedNodes(prev => {
            const newSet = new Set(prev);

            if (newSet.has(nodeId)) {
                // Node is currently expanded - collapse it
                // Store current expansion state before collapsing
                const currentExpanded = new Set();
                newSet.forEach(id => {
                    currentExpanded.add(id);
                });

                setPreviousExpansionStates(prevStates => {
                    const newStates = new Map(prevStates);
                    newStates.set(nodeId, currentExpanded);
                    return newStates;
                });

                // Remove this node and all its descendants
                const descendants = getAllDescendantIds(processedData, nodeId);
                descendants.forEach(descId => newSet.delete(descId));
                newSet.delete(nodeId);
            } else {
                // Node is currently collapsed - expand it
                newSet.add(nodeId);

                // Restore previous expansion state if it exists
                const previousState = previousExpansionStates.get(nodeId);
                if (previousState) {
                    previousState.forEach(id => newSet.add(id));
                }
            }

            return newSet;
        });
    }, [processedData, getAllDescendantIds, previousExpansionStates]);

    // Pan and zoom handlers
    const handleMouseDown = useCallback((e) => {
        if (e.target.closest('.node-group')) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX - transform.x,
            y: e.clientY - transform.y
        });
    }, [transform]);

    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return;
        setTransform(prev => ({
            ...prev,
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        }));
    }, [isDragging, dragStart]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleWheel = useCallback((e) => {
        e.preventDefault();
        const scaleAmount = 1.1;
        const rect = svgRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let newScale = transform.k;
        if (e.deltaY < 0) {
            newScale *= scaleAmount;
        } else {
            newScale /= scaleAmount;
        }

        newScale = Math.max(0.2, Math.min(newScale, 3.0));

        const newX = mouseX - ((mouseX - transform.x) / transform.k) * newScale;
        const newY = mouseY - ((mouseY - transform.y) / transform.k) * newScale;

        setTransform({ x: newX, y: newY, k: newScale });
    }, [transform]);

    // Zoom to fit
    const zoomToFit = useCallback(() => {
        const newTransform = calculateZoomToFit(
            layout.bbox,
            containerSize.width,
            containerSize.height
        );
        setTransform(newTransform);
    }, [layout.bbox, containerSize]);

    // Center on node
    const centerOnNode = useCallback((nodeId) => {
        const node = layout.nodes.find(n => n.data.id === nodeId);
        if (node) {
            const newTransform = calculateCenterOnNode(
                node,
                containerSize.width,
                containerSize.height,
                transform.k
            );
            setTransform(newTransform);
        }
    }, [layout.nodes, containerSize, transform.k]);

    // Helper function to get all node IDs recursively
    const getAllNodeIds = useCallback((nodeData) => {
        const allIds = new Set();

        const collectIds = (node) => {
            allIds.add(node.id);
            if (node.children) {
                node.children.forEach(child => collectIds(child));
            }
        };

        collectIds(nodeData);
        return allIds;
    }, []);

    // Expand all nodes
    const expandAll = useCallback(() => {
        if (!processedData) return;

        const allIds = getAllNodeIds(processedData);
        setExpandedNodes(allIds);

        // Clear previous states since we're expanding everything
        setPreviousExpansionStates(new Map());
    }, [processedData, getAllNodeIds]);

    // Compress all and forget state
    const compressAndForgetState = useCallback(() => {
        // Only keep the root node expanded
        setExpandedNodes(new Set([processedData?.id]));

        // Clear all previous states
        setPreviousExpansionStates(new Map());
    }, [processedData?.id]);

    // Auto zoom to fit on data change
    useEffect(() => {
        if (layout.nodes.length > 0) {
            zoomToFit();
        }
    }, [layout.nodes.length, zoomToFit]);

    // Event listeners
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('mousedown', handleMouseDown);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseup', handleMouseUp);
        container.addEventListener('mouseleave', handleMouseUp);
        container.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            container.removeEventListener('mousedown', handleMouseDown);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseup', handleMouseUp);
            container.removeEventListener('mouseleave', handleMouseUp);
            container.removeEventListener('wheel', handleWheel);
        };
    }, [handleMouseDown, handleMouseMove, handleMouseUp, handleWheel]);

    if (!processedData) {
        return (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <div className="text-4xl mb-4">🧠</div>
                    <div className="text-lg">No mind map data available</div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden"
            style={{
                cursor: isDragging ? 'grabbing' : 'grab',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
            }}
        >
            {/* Control Panel */}
            {showControls && (
                <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                    <button
                        onClick={expandAll}
                        className="group relative px-4 py-2 bg-gradient-to-b from-blue-400 to-blue-600 text-white rounded-full text-xs shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        style={{ fontFamily: "'Lexend', sans-serif", fontWeight: '600' }}
                        title="Expand all nodes"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                        <span className="relative z-10 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                            Expand All
                        </span>
                    </button>
                    <button
                        onClick={compressAndForgetState}
                        className="group relative px-4 py-2 bg-gradient-to-b from-red-400 to-red-600 text-white rounded-full text-xs shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        style={{ fontFamily: "'Lexend', sans-serif", fontWeight: '600' }}
                        title="Compress all and forget previous states"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                        <span className="relative z-10 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            Compress & Forget
                        </span>
                    </button>
                    <button
                        onClick={zoomToFit}
                        className="group relative px-4 py-2 bg-gradient-to-b from-orange-400 to-orange-600 text-white rounded-full text-xs shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                        style={{ fontFamily: "'Lexend', sans-serif", fontWeight: '600' }}
                        title="Fit to content"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                        <span className="relative z-10 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Fit to View
                        </span>
                    </button>
                </div>
            )}

            {/* Mini-map Visualization */}
            {showControls && layout.bbox && layout.bbox.width > 0 && layout.bbox.height > 0 && (
                <div className="absolute bottom-4 right-4 z-20 bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-600 shadow-xl p-3">
                    <div className="text-xs text-gray-300 mb-2 font-medium" style={{ fontFamily: "'Lexend', sans-serif" }}>
                        Canvas Overview
                    </div>
                    <div className="relative w-40 h-24 bg-gray-900 rounded border border-gray-700 overflow-hidden">
                        {/* Mini-map SVG */}
                        <svg
                            width="160"
                            height="96"
                            viewBox={`${layout.bbox.x} ${layout.bbox.y} ${layout.bbox.width} ${layout.bbox.height}`}
                            className="absolute inset-0"
                        >
                            {/* Mini-map nodes */}
                            {layout.nodes.map((node, index) => (
                                <rect
                                    key={`minimap-${node.data.id}-${index}`}
                                    x={node.y - (node.data.boxWidth || 160) / 2}
                                    y={node.x - (node.data.boxHeight || 40) / 2}
                                    width={node.data.boxWidth || 160}
                                    height={node.data.boxHeight || 40}
                                    rx="4"
                                    fill={getNodeColor(node.depth).fill}
                                    stroke={getNodeColor(node.depth).stroke}
                                    strokeWidth="0.5"
                                    opacity="0.8"
                                />
                            ))}

                            {/* Mini-map connections */}
                            {layout.links.map((link, index) => (
                                <path
                                    key={`minimap-link-${index}`}
                                    d={`M ${link.source.y} ${link.source.x} C ${(link.source.y + link.target.y) / 2} ${link.source.x} ${(link.source.y + link.target.y) / 2} ${link.target.x} ${link.target.y} ${link.target.x}`}
                                    stroke="#ffffff"
                                    strokeWidth="0.5"
                                    fill="none"
                                    opacity="0.6"
                                />
                            ))}

                            {/* Enhanced viewport indicator with fill */}
                            <rect
                                x={-transform.x / transform.k}
                                y={-transform.y / transform.k}
                                width={containerSize.width / transform.k}
                                height={containerSize.height / transform.k}
                                fill="#3B82F6"
                                fillOpacity="0.2"
                                stroke="#3B82F6"
                                strokeWidth="1.5"
                                strokeDasharray="3,2"
                                opacity="0.9"
                            />

                            {/* Viewport center indicator */}
                            <circle
                                cx={-transform.x / transform.k + (containerSize.width / transform.k) / 2}
                                cy={-transform.y / transform.k + (containerSize.height / transform.k) / 2}
                                r="2"
                                fill="#60A5FA"
                                opacity="1"
                            />
                        </svg>
                    </div>

                    {/* Enhanced info panel */}
                    <div className="mt-2 space-y-1">
                        <div className="text-xs text-gray-400" style={{ fontFamily: "'Lexend', sans-serif" }}>
                            Zoom: {Math.round(transform.k * 100)}%
                        </div>
                        <div className="text-xs text-gray-500" style={{ fontFamily: "'Lexend', sans-serif" }}>
                            Position: {Math.round(-transform.x)}, {Math.round(-transform.y)}
                        </div>
                        <div className="text-xs text-gray-500" style={{ fontFamily: "'Lexend', sans-serif" }}>
                            Canvas: {Math.round(layout.bbox.width)} × {Math.round(layout.bbox.height)}
                        </div>
                    </div>
                </div>
            )}

            {/* SVG with unified coordinate space */}
            <svg
                ref={svgRef}
                className="w-full h-full"
                viewBox={`0 0 ${containerSize.width} ${containerSize.height}`}
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    {/* Gradient removed - using solid white lines */}
                </defs>

                {/* Unified viewport group - single coordinate space */}
                <g
                    className="viewport"
                    transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}
                >
                    {/* Links layer */}
                    <g className="links">
                        <AnimatePresence mode="popLayout">
                            {links.map((link, index) => (
                                <g key={`${link.source.data.id}-${link.target.data.id}-${index}`}>
                                    {/* Invisible hit target for easier interaction */}
                                    <path
                                        d={link.hitPath}
                                        stroke="transparent"
                                        strokeWidth="12"
                                        fill="none"
                                        className="pointer-events-auto cursor-pointer"
                                    />

                                    {/* Animated connection line */}
                                    <motion.path
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 0.9 }}
                                        exit={{ pathLength: 0, opacity: 0 }}
                                        transition={{
                                            duration: 0.6,
                                            ease: "easeInOut",
                                            delay: 0.1
                                        }}
                                        d={link.path}
                                        stroke="#ffffff"
                                        strokeWidth="2"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </g>
                            ))}
                        </AnimatePresence>
                    </g>

                    {/* Nodes layer */}
                    <g className="nodes">
                        <AnimatePresence mode="popLayout">
                            {layout.nodes.map((node, index) => (
                                <Node
                                    key={`${node.data.id}-${index}-${node.level}`}
                                    node={node}
                                    onToggle={handleNodeToggle}
                                    isHovered={hoveredNode === node.data.id}
                                    onHover={setHoveredNode}
                                />
                            ))}
                        </AnimatePresence>
                    </g>
                </g>
            </svg>

        </div>
    );
}
