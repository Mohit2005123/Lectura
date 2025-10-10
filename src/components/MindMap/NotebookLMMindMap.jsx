'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExpand, FaDownload, FaArrowsAlt, FaPlus, FaMinus, FaSearch, FaUndo, FaRedo } from 'react-icons/fa';
import NotebookLMNode from './NotebookLMNode';
import { useSimpleTidyLayout } from './useSimpleTidyLayout';
import { useSimpleSmoothLinks } from './useSimpleSmoothLinks';
import { useSimplePanZoom } from './useSimplePanZoom';

/**
 * NotebookLM-style MindMap component
 * Features: tidy tree layout, smooth Bezier connections, pan/zoom, smooth transitions
 */
const NotebookLMMindMap = ({
    data,
    onNodeClick,
    containerSize = { width: 1200, height: 800 },
    showControls = true
}) => {
    const [expandedNodes, setExpandedNodes] = useState(new Set(['root']));
    const [hoveredNode, setHoveredNode] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const svgRef = useRef(null);
    const containerRef = useRef(null);

    // Use custom hooks
    const { layout, getBoundingBox, isNodeVisible } = useSimpleTidyLayout(data, expandedNodes);
    const { links } = useSimpleSmoothLinks(layout.links);
    const {
        transform,
        isDragging,
        zoomToFit,
        centerOn,
        resetView,
        zoomIn,
        zoomOut
    } = useSimplePanZoom(containerRef, layout.nodes, containerSize);

    // Filter nodes based on search
    const filteredNodes = layout.nodes.filter(node => {
        if (!searchTerm) return true;
        const nodeText = node.title.toLowerCase();
        return nodeText.includes(searchTerm.toLowerCase());
    });

    // Toggle node expansion
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

        // Save to history
        saveToHistory({ expandedNodes: new Set(expandedNodes) });
    }, [expandedNodes]);

    // Remove all descendant nodes from expanded set
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

    // Save state to history
    const saveToHistory = useCallback((state) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(state);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    }, [history, historyIndex]);

    // Undo/Redo functionality
    const undo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            const state = history[historyIndex - 1];
            if (state.expandedNodes) {
                setExpandedNodes(state.expandedNodes);
            }
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            const state = history[historyIndex + 1];
            if (state.expandedNodes) {
                setExpandedNodes(state.expandedNodes);
            }
        }
    }, [history, historyIndex]);

    // Auto-fit on first render
    useEffect(() => {
        if (data && layout.nodes.length > 0) {
            setTimeout(() => {
                zoomToFit();
            }, 100);
        }
    }, [data, layout.nodes.length, zoomToFit]);

    // Download as image
    const downloadAsImage = useCallback(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = containerSize.width;
        canvas.height = containerSize.height;

        // Fill background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        links.forEach(link => {
            const path = new Path2D(link.path);
            ctx.strokeStyle = '#cbd5e0';
            ctx.lineWidth = 2;
            ctx.stroke(path);
        });

        // Draw nodes
        layout.nodes.forEach(node => {
            const x = node.x * transform.k + transform.x;
            const y = node.y * transform.k + transform.y;
            const width = node.width * transform.k;
            const height = node.height * transform.k;

            // Draw node background
            const gradient = ctx.createLinearGradient(x - width / 2, y - height / 2, x + width / 2, y + height / 2);
            gradient.addColorStop(0, '#e2e8f0');
            gradient.addColorStop(1, '#cbd5e0');

            ctx.fillStyle = gradient;
            ctx.fillRect(x - width / 2, y - height / 2, width, height);

            // Draw text
            ctx.fillStyle = '#2d3748';
            ctx.font = `${14 * transform.k}px Inter, system-ui, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.title, x, y);
        });

        // Download
        const link = document.createElement('a');
        link.download = 'notebooklm-mindmap.png';
        link.href = canvas.toDataURL();
        link.click();
    }, [layout, links, transform, containerSize]);

    // Handle node click
    const handleNodeClick = useCallback((nodeId) => {
        if (onNodeClick) {
            onNodeClick(nodeId);
        }
        toggleNode(nodeId);
    }, [onNodeClick, toggleNode]);

    if (!data) {
        return (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <div className="text-4xl mb-4">🧠</div>
                    <div className="text-lg">No mind map data available</div>
                </div>
            </div>
        );
    }

    // Validate data structure
    if (!data.id || (!data.title && !data.text)) {
        return (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                <div className="text-center text-gray-500">
                    <div className="text-4xl mb-4">⚠️</div>
                    <div className="text-lg">Invalid mind map data structure</div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 relative overflow-hidden"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            {/* Control Panel */}
            {showControls && (
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-48 px-4 py-2 pr-10 bg-gray-800/90 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none backdrop-blur-sm shadow-lg"
                        />
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex gap-2">
                        <button
                            onClick={zoomOut}
                            className="control-button p-3 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-600"
                            title="Zoom out"
                        >
                            <FaMinus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={zoomIn}
                            className="control-button p-3 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-600"
                            title="Zoom in"
                        >
                            <FaPlus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={resetView}
                            className="control-button p-3 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-600"
                            title="Reset view"
                        >
                            <FaArrowsAlt className="w-4 h-4" />
                        </button>
                    </div>

                    {/* History Controls */}
                    <div className="flex gap-2">
                        <button
                            onClick={undo}
                            disabled={historyIndex <= 0}
                            className="control-button p-3 bg-white/90 hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Undo"
                        >
                            <FaUndo className="w-4 h-4" />
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            className="control-button p-3 bg-white/90 hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Redo"
                        >
                            <FaRedo className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Action Controls */}
                    <div className="flex gap-2">
                        <button
                            onClick={zoomToFit}
                            className="control-button p-3 bg-blue-500/90 hover:bg-blue-600/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-blue-400/50"
                            title="Fit to content"
                        >
                            <FaExpand className="w-4 h-4" />
                        </button>
                        <button
                            onClick={downloadAsImage}
                            className="control-button p-3 bg-green-500/90 hover:bg-green-600/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-green-400/50"
                            title="Download as image"
                        >
                            <FaDownload className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Unified container for both nodes and connections */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
                    transformOrigin: 'center center'
                }}
            >
                {/* SVG for connections */}
                <svg
                    ref={svgRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 1 }}
                    viewBox="-100 -200 2000 1000"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        {/* Gradient for connections */}
                        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#cbd5e0" stopOpacity="0.8" />
                            <stop offset="50%" stopColor="#a0aec0" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#cbd5e0" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>

                    <g>
                        {links.map((link, index) => (
                            <g key={`${link.source.id}-${link.target.id}-${index}`}>
                                {/* Main connection line - more visible */}
                                <path
                                    d={link.path}
                                    stroke="#ffffff"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    opacity="1.0"
                                    style={{
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))'
                                    }}
                                />

                                {/* Invisible hit target for easier interaction */}
                                <path
                                    d={link.hitPath}
                                    stroke="transparent"
                                    strokeWidth="12"
                                    fill="none"
                                    className="pointer-events-auto cursor-pointer"
                                    onClick={() => {
                                        // Optional: handle link clicks
                                    }}
                                />
                            </g>
                        ))}
                    </g>
                </svg>

                {/* Nodes */}
                <div
                    className="absolute inset-0 w-full h-full"
                    style={{ zIndex: 2 }}
                >
                    <AnimatePresence>
                        {filteredNodes.map((node) => (
                            <NotebookLMNode
                                key={node.id}
                                node={node}
                                onToggle={handleNodeClick}
                                isHovered={hoveredNode === node.id}
                                onHover={setHoveredNode}
                                transform={{ x: 0, y: 0, k: 1 }} // No additional transform needed
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Loading overlay */}
            {isDragging && (
                <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-30 pointer-events-none">
                    <div className="bg-white/90 text-gray-700 px-4 py-2 rounded-lg backdrop-blur-sm shadow-lg">
                        Panning...
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotebookLMMindMap;
