'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    FaExpand,
    FaDownload,
    FaArrowsAlt,
    FaPlus,
    FaMinus,
    FaSearch,
    FaUndo,
    FaRedo
} from 'react-icons/fa';
import Node from './Node';
import { useLayout } from './useLayout';
import { useAnimatedLayout } from './useAnimatedLayout';
import { generateBezierPath, calculateBoundingBox, animate, easing } from './utils';

/**
 * Main MindMap component with advanced features
 * @param {Object} props
 * @param {Object} props.data - Mindmap data structure
 * @param {Function} props.onNodeClick - Node click callback
 * @param {Object} props.containerSize - Container dimensions
 * @param {boolean} props.showControls - Whether to show control panel
 */
const MindMap = ({
    data,
    onNodeClick,
    containerSize = { width: 1200, height: 800 },
    showControls = true
}) => {
    const [hoveredNode, setHoveredNode] = useState(null);
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [hasUserScale, setHasUserScale] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);

    const containerRef = useRef(null);
    const viewportRef = useRef(null);
    const dragState = useRef({
        dragging: false,
        startX: 0,
        startY: 0,
        startPanX: 0,
        startPanY: 0
    });


    // Use custom layout hook
    const { layout, expandedNodes, toggleNode, isNodeVisible } = useLayout(data, containerSize);

    // Use animated layout for smooth transitions
    const { animatedNodes, animatedConnections, isAnimating } = useAnimatedLayout(layout, 400);

    // Debug connection rendering
    useEffect(() => {
        if (animatedConnections.length > 0) {
            console.log(`Rendering ${animatedConnections.length} animated connections`);
        }
    }, [animatedConnections]);

    // Debug data structure
    useEffect(() => {
        if (data) {
            console.log('MindMap data structure:', JSON.stringify(data, null, 2));
        }
    }, [data]);


    // Auto-fit to content when data changes (for infinite canvas)
    useEffect(() => {
        if (data && layout.nodes.length > 0) {
            // Center the mindmap in the viewport instead of fitting to container
            centerMindMap();
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
            setScale(state.scale);
            setPan(state.pan);
        }
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            const state = history[historyIndex + 1];
            setScale(state.scale);
            setPan(state.pan);
        }
    }, [history, historyIndex]);

    // Fit content to viewport
    const fitToContent = useCallback(() => {
        if (!layout.nodes.length) return;

        const boundingBox = calculateBoundingBox(layout.nodes);
        const padding = 100;

        const contentWidth = boundingBox.width + padding * 2;
        const contentHeight = boundingBox.height + padding * 2;

        const scaleX = containerSize.width / contentWidth;
        const scaleY = containerSize.height / contentHeight;
        const fitScale = Math.min(scaleX, scaleY, 1);

        const centerX = containerSize.width / 2;
        const centerY = containerSize.height / 2;
        const contentCenterX = boundingBox.minX + boundingBox.width / 2;
        const contentCenterY = boundingBox.minY + boundingBox.height / 2;

        const newPan = {
            x: centerX - contentCenterX * fitScale,
            y: centerY - contentCenterY * fitScale
        };

        setScale(fitScale);
        setPan(newPan);
        setHasUserScale(false);

        saveToHistory({ scale: fitScale, pan: newPan });
    }, [layout.nodes, containerSize, saveToHistory]);

    // Center mindmap in viewport (for infinite canvas)
    const centerMindMap = useCallback(() => {
        if (!layout.nodes.length) return;

        const boundingBox = calculateBoundingBox(layout.nodes);

        // Calculate center of content
        const contentCenterX = boundingBox.minX + boundingBox.width / 2;
        const contentCenterY = boundingBox.minY + boundingBox.height / 2;

        // Center in viewport
        const newPan = {
            x: containerSize.width / 2 - contentCenterX,
            y: containerSize.height / 2 - contentCenterY
        };

        setPan(newPan);
        setScale(1); // Start with normal scale
        setHasUserScale(false);

        saveToHistory({ scale: 1, pan: newPan });
    }, [layout.nodes, containerSize, saveToHistory]);

    // Zoom controls
    const zoomIn = useCallback(() => {
        const newScale = Math.min(scale * 1.2, 3);
        setScale(newScale);
        setHasUserScale(true);
        saveToHistory({ scale: newScale, pan });
    }, [scale, pan, saveToHistory]);

    const zoomOut = useCallback(() => {
        const newScale = Math.max(scale / 1.2, 0.1);
        setScale(newScale);
        setHasUserScale(true);
        saveToHistory({ scale: newScale, pan });
    }, [scale, pan, saveToHistory]);

    const resetView = useCallback(() => {
        setScale(1);
        setPan({ x: 0, y: 0 });
        setHasUserScale(false);
        saveToHistory({ scale: 1, pan: { x: 0, y: 0 } });
    }, [saveToHistory]);

    // Pan and zoom handlers
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            e.preventDefault();
            const zoomIntensity = 0.001;
            const delta = -e.deltaY * zoomIntensity;
            const newScale = Math.min(3, Math.max(0.1, scale * (1 + delta)));
            setScale(newScale);
            setHasUserScale(true);
        };

        const handleMouseDown = (e) => {
            if (e.target.closest('.control-button') || e.target.closest('button')) return;

            dragState.current = {
                dragging: true,
                startX: e.clientX,
                startY: e.clientY,
                startPanX: pan.x,
                startPanY: pan.y
            };
            container.style.cursor = 'grabbing';
        };

        const handleMouseMove = (e) => {
            if (!dragState.current.dragging) return;

            const deltaX = e.clientX - dragState.current.startX;
            const deltaY = e.clientY - dragState.current.startY;

            setPan({
                x: dragState.current.startPanX + deltaX,
                y: dragState.current.startPanY + deltaY
            });
        };

        const handleMouseUp = () => {
            if (dragState.current.dragging) {
                dragState.current.dragging = false;
                container.style.cursor = 'grab';
                saveToHistory({ scale, pan });
            }
        };

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
    }, [scale, pan, saveToHistory]);

    // Search functionality
    const filteredNodes = useMemo(() => {
        if (!searchTerm) return animatedNodes;

        return animatedNodes.filter(node => {
            const nodeText = node.title || node.text || '';
            return nodeText.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [animatedNodes, searchTerm]);

    // Download functionality
    const downloadAsImage = useCallback(() => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas size
        canvas.width = containerSize.width;
        canvas.height = containerSize.height;

        // Fill background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw connections
        layout.connections.forEach(connection => {
            const path = new Path2D(connection.path);
            ctx.strokeStyle = '#4a4a5a';
            ctx.lineWidth = 2;
            ctx.stroke(path);
        });

        // Draw nodes
        layout.nodes.forEach(node => {
            const x = node.x * scale + pan.x;
            const y = node.y * scale + pan.y;
            const width = (node.width || 150) * scale;
            const height = 50 * scale;

            // Draw node background
            const gradient = ctx.createLinearGradient(x - width / 2, y - height / 2, x + width / 2, y + height / 2);
            gradient.addColorStop(0, '#2a2a3a');
            gradient.addColorStop(1, '#1a1a2a');

            ctx.fillStyle = gradient;
            ctx.fillRect(x - width / 2, y - height / 2, width, height);

            // Draw text
            ctx.fillStyle = '#e0e0e0';
            ctx.font = `${16 * scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(node.title || node.text || 'Untitled', x, y);
        });

        // Download
        const link = document.createElement('a');
        link.download = 'mindmap.png';
        link.href = canvas.toDataURL();
        link.click();
    }, [layout, scale, pan, containerSize]);

    // Handle node click with animation
    const handleNodeClick = useCallback((nodeId) => {
        if (isAnimating) return;

        // Simply toggle the node - the animated layout will handle the animation
        toggleNode(nodeId);
    }, [toggleNode, isAnimating]);


    if (!data) {
        return (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <div className="text-4xl mb-4">🧠</div>
                    <div className="text-lg">No mind map data available</div>
                </div>
            </div>
        );
    }

    // Validate data structure
    if (!data.id || (!data.title && !data.text)) {
        return (
            <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                <div className="text-center text-gray-400">
                    <div className="text-4xl mb-4">⚠️</div>
                    <div className="text-lg">Invalid mind map data structure</div>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden cursor-grab"
            style={{ cursor: dragState.current.dragging ? 'grabbing' : 'grab' }}
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
                            className="w-48 px-4 py-2 pr-10 bg-gray-800/90 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none backdrop-blur-sm"
                        />
                        <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex gap-2">
                        <button
                            onClick={zoomOut}
                            className="control-button p-3 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-600/50"
                            title="Zoom out"
                        >
                            <FaMinus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={zoomIn}
                            className="control-button p-3 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-600/50"
                            title="Zoom in"
                        >
                            <FaPlus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={resetView}
                            className="control-button p-3 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-600/50"
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
                            className="control-button p-3 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Undo"
                        >
                            <FaUndo className="w-4 h-4" />
                        </button>
                        <button
                            onClick={redo}
                            disabled={historyIndex >= history.length - 1}
                            className="control-button p-3 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Redo"
                        >
                            <FaRedo className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Action Controls */}
                    <div className="flex gap-2">
                        <button
                            onClick={fitToContent}
                            className="control-button p-3 bg-blue-600/90 hover:bg-blue-700/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-blue-500/50"
                            title="Fit to content"
                        >
                            <FaExpand className="w-4 h-4" />
                        </button>
                        <button
                            onClick={downloadAsImage}
                            className="control-button p-3 bg-green-600/90 hover:bg-green-700/90 text-white rounded-lg transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-green-500/50"
                            title="Download as image"
                        >
                            <FaDownload className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Mind Map Content */}
            <div
                ref={viewportRef}
                className="w-full h-full relative"
                style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                    transformOrigin: 'center center',
                }}
            >
                {/* SVG for connections */}
                <svg
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    style={{ zIndex: 1 }}
                >
                    {animatedConnections.map((connection, index) => (
                        <g key={`${connection.parentId}-${connection.childId}-${index}`}>
                            {/* Shadow for depth */}
                            <path
                                d={connection.path}
                                stroke="#000000"
                                strokeWidth="4"
                                fill="none"
                                strokeLinecap="round"
                                opacity="0.4"
                                style={{
                                    filter: 'blur(1px)'
                                }}
                            />

                            {/* Main connection line - white with slight grayish tint */}
                            <path
                                d={connection.path}
                                stroke="#f0f0f0"
                                strokeWidth="3"
                                fill="none"
                                strokeLinecap="round"
                                opacity="0.9"
                                style={{
                                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))'
                                }}
                            />
                        </g>
                    ))}
                </svg>

                {/* Nodes */}
                {filteredNodes.map((node) => (
                    <Node
                        key={node.id}
                        node={node}
                        onToggle={handleNodeClick}
                        position={{ x: node.x, y: node.y }}
                        isHovered={hoveredNode === node.id}
                        onHover={setHoveredNode}
                        isExpanded={expandedNodes.has(node.id)}
                        level={node.level}
                    />
                ))}
            </div>

            {/* Loading overlay */}
            {isAnimating && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center z-30 pointer-events-none">
                    <div className="bg-gray-800/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
                        Updating layout...
                    </div>
                </div>
            )}
        </div>
    );
};

export default MindMap;
