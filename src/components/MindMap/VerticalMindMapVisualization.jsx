'use client';
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { 
  FaExpand, 
  FaDownload, 
  FaThumbsUp, 
  FaThumbsDown, 
  FaArrowsAlt, 
  FaPlus, 
  FaMinus,
  FaChevronRight
} from 'react-icons/fa';

const HorizontalMindMapVisualization = forwardRef(({ data }, ref) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 1400, height: 1000 });
  const containerRef = useRef(null);
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [hasUserScale, setHasUserScale] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState(new Set(['root'])); // Track which nodes are expanded
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });
  

  // Initialize expanded nodes - root and level 1 children should be expanded initially
  useEffect(() => {
    if (data) {
      // Use the actual root node ID or fallback to 'root'
      const rootId = data.id || 'root';
      const initialExpanded = new Set([rootId]);
      
      // Also expand level 1 children by default
      if (data.children && Array.isArray(data.children)) {
        data.children.forEach(child => {
          const childId = child.id || `node-${Math.random()}`;
          initialExpanded.add(childId);
        });
      }
      
      setExpandedNodes(initialExpanded);
    }
  }, [data]);

  // Toggle node expansion
  const toggleNodeExpansion = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Check if a node should be visible (all parents must be expanded)
  const isNodeVisible = (node, level) => {
    if (level === 0) return true; // Root is always visible
    if (level === 1) return expandedNodes.has('root'); // Level 1 depends on root
    return expandedNodes.has(node.parentId); // Other levels depend on parent
  };
  
  // Observe the actual container size
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({
          width: Math.max(1200, width),
          height: Math.max(800, height),
        });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  // Wheel to zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const zoomIntensity = 0.001;
      const delta = -e.deltaY * zoomIntensity;
      setHasUserScale(true);
      setScale((prev) => {
        const next = Math.min(3, Math.max(0.2, prev * (1 + delta)));
        return next;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Drag to pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleMouseDown = (e) => {
      if (e.target.closest('.control-button')) return;
      if (e.target.closest('button')) return; // Don't start drag on button clicks
      dragState.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y,
      };
      el.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e) => {
      if (!dragState.current.dragging) return;
      e.preventDefault();
      const deltaX = e.clientX - dragState.current.startX;
      const deltaY = e.clientY - dragState.current.startY;
      setPan({
        x: dragState.current.startPanX + deltaX,
        y: dragState.current.startPanY + deltaY,
      });
    };

    const handleMouseUp = () => {
      dragState.current.dragging = false;
      el.style.cursor = 'grab';
    };

    el.addEventListener('mousedown', handleMouseDown);
    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseup', handleMouseUp);
    el.addEventListener('mouseleave', handleMouseUp);

    return () => {
      el.removeEventListener('mousedown', handleMouseDown);
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseup', handleMouseUp);
      el.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [pan]);

  // Expose imperative actions
  useImperativeHandle(ref, () => ({
    fitToWidth: () => {
      setHasUserScale(false);
      setPan({ x: 0, y: 0 });
    },
    zoomIn: () => {
      setHasUserScale(true);
      setScale(prev => Math.min(3, prev * 1.2));
    },
    zoomOut: () => {
      setHasUserScale(true);
      setScale(prev => Math.max(0.2, prev / 1.2));
    },
    resetView: () => {
      setHasUserScale(false);
      setPan({ x: 0, y: 0 });
    }
  }));

  // Modern professional node styling with enhanced gradients
  const getNodeColors = (level) => {
    const colorSchemes = [
      // Root node - premium purple with glass effect
      {
        bg: 'bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700',
        border: 'border-purple-300/60',
        shadow: 'shadow-2xl shadow-purple-500/25',
        text: 'text-white font-semibold',
        hover: 'hover:from-purple-400 hover:via-purple-500 hover:to-purple-600',
        glow: 'hover:shadow-purple-400/40',
        backdrop: 'backdrop-blur-sm'
      },
      // Level 1 - professional blue with depth
      {
        bg: 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700',
        border: 'border-blue-300/60',
        shadow: 'shadow-xl shadow-blue-500/20',
        text: 'text-white font-medium',
        hover: 'hover:from-blue-400 hover:via-blue-500 hover:to-blue-600',
        glow: 'hover:shadow-blue-400/35',
        backdrop: 'backdrop-blur-sm'
      },
      // Level 2 - fresh emerald with modern look
      {
        bg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700',
        border: 'border-emerald-300/60',
        shadow: 'shadow-lg shadow-emerald-500/20',
        text: 'text-white font-medium',
        hover: 'hover:from-emerald-400 hover:via-emerald-500 hover:to-emerald-600',
        glow: 'hover:shadow-emerald-400/30',
        backdrop: 'backdrop-blur-sm'
      },
      // Level 3 - vibrant orange with energy
      {
        bg: 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700',
        border: 'border-orange-300/60',
        shadow: 'shadow-lg shadow-orange-500/20',
        text: 'text-white font-medium',
        hover: 'hover:from-orange-400 hover:via-orange-500 hover:to-orange-600',
        glow: 'hover:shadow-orange-400/30',
        backdrop: 'backdrop-blur-sm'
      },
      // Level 4+ - sophisticated indigo with elegance
      {
        bg: 'bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700',
        border: 'border-indigo-300/60',
        shadow: 'shadow-lg shadow-indigo-500/20',
        text: 'text-white font-medium',
        hover: 'hover:from-indigo-400 hover:via-indigo-500 hover:to-indigo-600',
        glow: 'hover:shadow-indigo-400/30',
        backdrop: 'backdrop-blur-sm'
      }
    ];
    return colorSchemes[Math.min(level, colorSchemes.length - 1)];
  };

  const getNodeSize = (level) => {
    const sizes = [
      'text-xl px-8 py-4 font-bold', // Root - larger and bolder
      'text-lg px-6 py-3 font-semibold', // Level 1 - prominent
      'text-base px-5 py-2.5 font-medium', // Level 2 - balanced
      'text-sm px-4 py-2 font-medium', // Level 3 - compact
      'text-sm px-3 py-1.5 font-normal' // Level 4+ - minimal
    ];
    return sizes[Math.min(level, sizes.length - 1)];
  };

  const getNodeShape = (level) => {
    return level === 0 ? 'rounded-2xl' : 'rounded-xl'; // More rounded for modern look
  };

  // Dynamic layout with collapsible nodes and proper spacing
  const buildHorizontalLayout = (root) => {
    if (!root) return { nodes: [], edges: [] };
    
    const nodes = [];
    const edges = [];
    const nodePositions = new Map();
    
    // Layout constants - improved spacing
    const LEVEL_WIDTH = 500; // Increased for better horizontal spacing
    const MIN_VERTICAL_SPACING = 140; // Increased vertical spacing
    const START_X = 100;
    const CENTER_Y = containerSize.height / 2;
    const NODE_HEIGHT = 65; // Slightly increased height
    
    // Get all visible nodes first
    const getVisibleNodes = (node, level = 0, parentId = null) => {
      const visibleNodes = [];
      const nodeId = node.id || `node-${Math.random()}`;
      
      // Root node is always visible
      if (level === 0) {
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        visibleNodes.push({
          ...node,
          id: nodeId,
          level,
          parentId,
          hasChildren: hasChildren,
          isExpanded: expandedNodes.has(nodeId),
          children: node.children // Preserve children for button detection
        });
        
        // Add children only if root is expanded
        if (hasChildren && expandedNodes.has(nodeId)) {
          node.children.forEach(child => {
            const childVisibleNodes = getVisibleNodes(child, level + 1, nodeId);
            visibleNodes.push(...childVisibleNodes);
          });
        }
      } else {
        // Child nodes are only visible if their parent is expanded
        if (expandedNodes.has(parentId)) {
          const hasChildren = Array.isArray(node.children) && node.children.length > 0;
          visibleNodes.push({
            ...node,
            id: nodeId,
            level,
            parentId,
            hasChildren: hasChildren,
            isExpanded: expandedNodes.has(nodeId),
            children: node.children // Preserve children for button detection
          });
          
          
          // Add children only if this node is expanded
          if (hasChildren && expandedNodes.has(nodeId)) {
            node.children.forEach(child => {
              const childVisibleNodes = getVisibleNodes(child, level + 1, nodeId);
              visibleNodes.push(...childVisibleNodes);
            });
          }
        }
      }
      
      return visibleNodes;
    };
    
    const visibleNodes = getVisibleNodes(root);
    
    // Group nodes by level for better positioning
    const nodesByLevel = {};
    visibleNodes.forEach(node => {
      if (!nodesByLevel[node.level]) {
        nodesByLevel[node.level] = [];
      }
      nodesByLevel[node.level].push(node);
    });
    
    // Position nodes level by level
    Object.keys(nodesByLevel).forEach(levelStr => {
      const level = parseInt(levelStr);
      const levelNodes = nodesByLevel[level];
      
      levelNodes.forEach((node, index) => {
        const nodeId = node.id;
        const nodeText = node.text || 'Untitled';
        
        // Calculate node dimensions - ensure proper text display
        const textWidth = Math.max(nodeText.length * 9, 120);
        const nodeWidth = Math.min(Math.max(textWidth + 100, 150), 400); // Ensure minimum width of 150px
        
        let nodeX, nodeY;
        
        if (level === 0) {
          // Root node
          nodeX = START_X;
          nodeY = CENTER_Y;
        } else {
          // Child nodes
          nodeX = START_X + (level * LEVEL_WIDTH);
          
          if (level === 1) {
            // First level - distribute around center
            const totalHeight = Math.max((levelNodes.length - 1) * MIN_VERTICAL_SPACING, 400);
            const startY = CENTER_Y - totalHeight / 2;
            nodeY = startY + index * MIN_VERTICAL_SPACING;
          } else {
            // Deeper levels - find parent and position relative to it
            const parentNode = visibleNodes.find(n => n.id === node.parentId);
            if (parentNode && isFinite(parentNode.y)) {
              // Get all siblings at this level with the same parent
              const siblingsAtLevel = levelNodes.filter(n => n.parentId === node.parentId);
              const siblingIndex = siblingsAtLevel.findIndex(n => n.id === nodeId);
              
              // Calculate spacing based on number of siblings
              const availableHeight = containerSize.height - 200; // Leave more margin
              const minSpacing = 80; // Minimum spacing between nodes
              const maxSpacing = 200; // Maximum spacing for better readability
              
              let siblingSpacing;
              if (siblingsAtLevel.length === 1) {
                // Single child - position directly below parent
                siblingSpacing = 0;
                nodeY = parentNode.y;
              } else if (siblingsAtLevel.length <= 3) {
                // Few siblings - use generous spacing
                siblingSpacing = Math.max(minSpacing, availableHeight / Math.max(siblingsAtLevel.length, 2));
              } else {
                // Many siblings - use calculated spacing but ensure minimum
                siblingSpacing = Math.max(minSpacing, Math.min(maxSpacing, availableHeight / siblingsAtLevel.length));
              }
              
              // Calculate total height needed for all siblings
              const totalSiblingHeight = (siblingsAtLevel.length - 1) * siblingSpacing;
              const startY = parentNode.y - totalSiblingHeight / 2;
              
              nodeY = startY + siblingIndex * siblingSpacing;
              
              // Ensure the node is positioned within reasonable bounds
              const minY = 100; // Minimum Y position from top
              const maxY = containerSize.height - 100; // Maximum Y position from bottom
              nodeY = Math.max(minY, Math.min(maxY, nodeY));
            } else {
              // Fallback positioning - distribute around center
              const totalHeight = Math.max((levelNodes.length - 1) * MIN_VERTICAL_SPACING, 400);
              const startY = CENTER_Y - totalHeight / 2;
              nodeY = startY + index * MIN_VERTICAL_SPACING;
            }
          }
        }
        
        // Ensure coordinates are valid numbers
        nodeX = isFinite(nodeX) ? nodeX : START_X + (level * LEVEL_WIDTH);
        nodeY = isFinite(nodeY) ? nodeY : CENTER_Y;
      
        // Add node to list
        const nodeColors = getNodeColors(level);
        const hasChildren = Array.isArray(node.children) && node.children.length > 0;
        const nodeData = {
          id: nodeId,
          text: nodeText,
          level: level,
          x: nodeX,
          y: nodeY,
          colors: nodeColors,
          size: getNodeSize(level),
          shape: getNodeShape(level),
          width: nodeWidth,
          height: NODE_HEIGHT,
          hasChildren: hasChildren,
          isExpanded: node.isExpanded,
          parentId: node.parentId
        };
        
        nodes.push(nodeData);
        nodePositions.set(nodeId, { x: nodeX, y: nodeY, width: nodeWidth, height: NODE_HEIGHT });
      });
    });
    
    // Create hierarchical edge routing with proper spacing
    const createHierarchicalEdges = (parentNode, childNodes) => {
      if (!childNodes || childNodes.length === 0) return;
      
      // Sort children by their Y position for consistent ordering
      const sortedChildren = childNodes.sort((a, b) => a.y - b.y);
      
      // Validate parent node coordinates
      if (!isFinite(parentNode.x) || !isFinite(parentNode.y)) {
        console.log(`Skipping edge creation for parent ${parentNode.text} due to invalid coordinates:`, { 
          x: parentNode.x, 
          y: parentNode.y 
        });
        return;
      }
      
      // Calculate branching points
      const parentX = parentNode.x;
      const parentY = parentNode.y;
      const parentWidth = parentNode.width || 200;
      
      // Main trunk extends from right edge of parent node
      const trunkLength = 100; // Distance for better spacing
      
      // Calculate the vertical spread of children
      const validChildren = sortedChildren.filter(child => isFinite(child.x) && isFinite(child.y));
      
      if (validChildren.length === 0) {
        console.log(`No valid children found for parent ${parentNode.text}`);
        return;
      }
      
      const minChildY = Math.min(...validChildren.map(child => child.y));
      const maxChildY = Math.max(...validChildren.map(child => child.y));
      const childSpread = Math.max(maxChildY - minChildY, 150); // Minimum spread for better layout
      
      // Calculate proper connection points
      const parentRightEdge = parentX + parentWidth / 2; // Right edge of parent node
      const trunkEndX = parentRightEdge + trunkLength; // End of horizontal trunk
      
      // For single child, connect directly without vertical trunk
      if (validChildren.length === 1) {
        const child = validChildren[0];
        const childLeftEdge = child.x - (child.width || 200) / 2;
        const childY = child.y;
        
        if (isFinite(parentRightEdge) && isFinite(childLeftEdge) && isFinite(childY)) {
          edges.push({
            x1: parentRightEdge,
            y1: parentY,
            x2: childLeftEdge,
            y2: childY,
            level: parentNode.level,
            parentId: parentNode.id,
            childId: child.id,
            isChildConnection: true
          });
        }
      } else {
        // For multiple children, use hierarchical trunk system
        
        // Horizontal trunk line from parent to vertical trunk
        edges.push({
          x1: parentRightEdge,
          y1: parentY,
          x2: trunkEndX,
          y2: parentY,
          level: parentNode.level,
          parentId: parentNode.id,
          childId: 'trunk-horizontal',
          isTrunk: true
        });
        
        // Add vertical trunk line - spans the full range of children
        // Ensure the vertical trunk covers the full range from topmost to bottommost child
        const trunkTopY = Math.min(minChildY, parentY) - 20; // Extend slightly above
        const trunkBottomY = Math.max(maxChildY, parentY) + 20; // Extend slightly below
        
        edges.push({
          x1: trunkEndX,
          y1: trunkTopY,
          x2: trunkEndX,
          y2: trunkBottomY,
          level: parentNode.level,
          parentId: parentNode.id,
          childId: 'trunk-vertical',
          isTrunk: true
        });
        
        // Add individual connections from vertical trunk to each child
        validChildren.forEach((child, index) => {
          const childLeftEdge = child.x - (child.width || 200) / 2;
          const childY = child.y;
          
          // Validate all coordinates before creating edge
          if (isFinite(trunkEndX) && isFinite(childY) && isFinite(childLeftEdge)) {
            // Create horizontal connection from vertical trunk to child
            edges.push({
              x1: trunkEndX, // Start from vertical trunk X position
              y1: childY, // Start from vertical trunk at child's Y level
              x2: childLeftEdge, // End at child's left edge
              y2: childY, // End at child's Y level (horizontal line)
              level: parentNode.level,
              parentId: parentNode.id,
              childId: child.id,
              isChildConnection: true
            });
          } else {
            console.log(`Skipping edge creation for child ${child.text} due to invalid coordinates:`, {
              trunkEndX, childY, childLeftEdge, childCoords: { x: child.x, y: child.y, width: child.width }
            });
          }
        });
      }
    };
    
    // Group nodes by parent and create hierarchical edges
    const nodesByParent = {};
    nodes.forEach(node => {
      if (node.parentId && node.level > 0) {
        if (!nodesByParent[node.parentId]) {
          nodesByParent[node.parentId] = [];
        }
        nodesByParent[node.parentId].push(node);
      }
    });
    
    // Create edges for each parent-child group
    Object.keys(nodesByParent).forEach(parentId => {
      const parentNode = nodes.find(n => n.id === parentId);
      const childNodes = nodesByParent[parentId];
      
      // Validate parent node exists and has valid coordinates
      if (parentNode && childNodes.length > 0 && 
          isFinite(parentNode.x) && isFinite(parentNode.y)) {
        
        // Filter out children with invalid coordinates
        const validChildren = childNodes.filter(child => 
          isFinite(child.x) && isFinite(child.y)
        );
        
        if (validChildren.length > 0) {
          createHierarchicalEdges(parentNode, validChildren);
        }
      }
    });
    
    
    return { nodes, edges };
  };

  // Control handlers
  const handleZoomIn = () => {
    setHasUserScale(true);
    setScale(prev => Math.min(3, prev * 1.2));
  };

  const handleZoomOut = () => {
    setHasUserScale(true);
    setScale(prev => Math.max(0.2, prev / 1.2));
  };

  const handleResetView = () => {
    setHasUserScale(false);
    setPan({ x: 0, y: 0 });
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleDownload = () => {
    // Create a canvas to render the mind map
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { nodes, edges } = buildHorizontalLayout(data);
    
    // Set canvas size
    canvas.width = containerSize.width;
    canvas.height = containerSize.height;
    
    // Fill background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw edges with level-based colors (NotebookLM style)
    edges.forEach(edge => {
      // Get color based on parent level
      const getEdgeColor = (level) => {
        const colors = [
          '#8b5cf6', // Purple for root level
          '#3b82f6', // Blue for level 1
          '#10b981', // Emerald for level 2
          '#f97316', // Orange for level 3
          '#6366f1'  // Indigo for level 4+
        ];
        return colors[Math.min(level, colors.length - 1)];
      };
      
      ctx.strokeStyle = getEdgeColor(edge.level);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(edge.x1, edge.y1);
      ctx.lineTo(edge.x2, edge.y2);
      ctx.stroke();
    });
    
    // Draw nodes with new color scheme
    nodes.forEach(node => {
      const nodeColors = getNodeColors(node.level);
      const gradient = ctx.createLinearGradient(node.x - node.width/2, node.y - node.height/2, node.x + node.width/2, node.y + node.height/2);
      
      // Apply gradient based on level
      if (node.level === 0) {
        gradient.addColorStop(0, '#8b5cf6'); // purple-500
        gradient.addColorStop(1, '#7c3aed'); // purple-600
      } else if (node.level === 1) {
        gradient.addColorStop(0, '#3b82f6'); // blue-500
        gradient.addColorStop(1, '#2563eb'); // blue-600
      } else if (node.level === 2) {
        gradient.addColorStop(0, '#10b981'); // emerald-500
        gradient.addColorStop(1, '#059669'); // emerald-600
      } else if (node.level === 3) {
        gradient.addColorStop(0, '#f97316'); // orange-500
        gradient.addColorStop(1, '#ea580c'); // orange-600
      } else {
        gradient.addColorStop(0, '#6366f1'); // indigo-500
        gradient.addColorStop(1, '#4f46e5'); // indigo-600
      }
      
      // Draw rounded rectangle
      const radius = node.level === 0 ? 12 : 8;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(node.x - node.width/2, node.y - node.height/2, node.width, node.height, radius);
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = node.level === 0 ? '#a78bfa' : '#60a5fa';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw text
      ctx.fillStyle = '#ffffff';
      ctx.font = node.level === 0 ? 'bold 16px Arial' : '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.text, node.x, node.y);
    });
    
    // Download
    const link = document.createElement('a');
    link.download = 'mind-map.png';
    link.href = canvas.toDataURL();
    link.click();
  };


  if (!data) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400 text-lg">No mind map data available</div>
      </div>
    );
  }

  const { nodes, edges } = buildHorizontalLayout(data);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900 relative overflow-hidden cursor-grab"
      style={{ cursor: dragState.current.dragging ? 'grabbing' : 'grab' }}
    >

      {/* Controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={handleFullscreen}
          className="control-button p-3 bg-gray-800/95 hover:bg-gray-700/95 text-white rounded-xl transition-all duration-300 backdrop-blur-md shadow-xl hover:shadow-2xl border border-gray-600/60 hover:border-gray-500/80"
          title="Fullscreen"
        >
          <FaExpand className="w-4 h-4" />
        </button>
        <button
          onClick={handleDownload}
          className="control-button p-3 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-xl transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-600/50"
          title="Download"
        >
          <FaDownload className="w-4 h-4" />
        </button>
      </div>


      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        <button
          onClick={handleZoomIn}
          className="control-button p-3 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-xl transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-600/50"
          title="Zoom in"
        >
          <FaPlus className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="control-button p-3 bg-gray-800/90 hover:bg-gray-700/90 text-white rounded-xl transition-all duration-200 backdrop-blur-sm shadow-lg hover:shadow-xl border border-gray-600/50"
          title="Zoom out"
        >
          <FaMinus className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="control-button p-3 bg-gray-800/95 hover:bg-gray-700/95 text-white rounded-xl transition-all duration-300 backdrop-blur-md shadow-xl hover:shadow-2xl border border-gray-600/60 hover:border-gray-500/80"
          title="Reset view"
        >
          <FaArrowsAlt className="w-4 h-4" />
        </button>
      </div>

      {/* Mind Map Content */}
      <div
        ref={viewportRef}
        className="w-full h-full relative"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* SVG for edges */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {edges.map((edge, index) => {
            // Modern edge color scheme with better contrast
            const getEdgeColor = (level, edge) => {
              // Use different colors for different edge types
              if (edge.isChildConnection) {
                return '#fbbf24'; // Bright yellow for child connections
              }
              
              if (edge.isTrunk) {
                // Use level-based colors for trunk lines with better contrast
                const colors = [
                  '#a855f7', // Purple for root level - brighter
                  '#3b82f6', // Blue for level 1
                  '#10b981', // Emerald for level 2
                  '#f97316', // Orange for level 3
                  '#6366f1'  // Indigo for level 4+
                ];
                return colors[Math.min(level, colors.length - 1)];
              }
              
              // Default color for other edge types
              return '#fbbf24';
            };
            
            // Validate edge coordinates to prevent NaN - strict validation
            const x1 = Number(edge.x1);
            const y1 = Number(edge.y1);
            const x2 = Number(edge.x2);
            const y2 = Number(edge.y2);
            
            // Skip rendering if coordinates are invalid
            if (!isFinite(x1) || !isFinite(y1) || !isFinite(x2) || !isFinite(y2)) {
              return null;
            }
            
            // Additional check for very short edges that might not be visible
            const edgeLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
            if (edgeLength < 3) {
              return null;
            }
            
            // Check for reasonable coordinate bounds
            if (x1 < -1000 || x1 > 10000 || y1 < -1000 || y1 > 10000 || 
                x2 < -1000 || x2 > 10000 || y2 < -1000 || y2 > 10000) {
              return null;
            }
            
            const edgeColor = getEdgeColor(edge.level, edge);
            
            // Enhanced styling for different edge types with better visual hierarchy
            const getEdgeStyle = (edge) => {
              if (edge.isTrunk) {
                return {
                  strokeWidth: 5,
                  opacity: 0.9,
                  strokeDasharray: 'none',
                  strokeLinecap: 'round'
                };
              } else if (edge.isChildConnection) {
                return {
                  strokeWidth: 3.5,
                  opacity: 0.85,
                  strokeDasharray: 'none',
                  strokeLinecap: 'round'
                };
              }
              return {
                strokeWidth: 3,
                opacity: 0.8,
                strokeDasharray: 'none',
                strokeLinecap: 'round'
              };
            };
            
            const edgeStyle = getEdgeStyle(edge);
            
            return (
              <g key={`${edge.parentId}-${edge.childId}-${index}`}>
                {/* Glow effect for main trunk only */}
                {edge.isTrunk && (
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={edgeColor}
                    strokeWidth="6"
                    opacity="0.2"
                    filter="blur(3px)"
                  />
                )}
                {/* Main line - use straight lines for all connections */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={edgeColor}
                  strokeWidth={edgeStyle.strokeWidth}
                  strokeLinecap="round"
                  opacity={edgeStyle.opacity}
                  strokeDasharray={edgeStyle.strokeDasharray}
                  style={{
                    filter: edge.isTrunk ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))' : 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => {
          const isHovered = hoveredNode === node.id;
          
          // Validate node coordinates to prevent NaN
          const nodeX = isFinite(node.x) ? node.x : 0;
          const nodeY = isFinite(node.y) ? node.y : 0;
          
          // Skip rendering if coordinates are invalid
          if (!isFinite(node.x) || !isFinite(node.y)) {
            return null;
          }
          
          return (
            <div
              key={node.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ 
                left: `${nodeX}px`, 
                top: `${nodeY}px`, 
                zIndex: 10 - node.level
              }}
            >
              <div
                className={`
                  ${node.colors.bg} 
                  ${node.colors.border} 
                  ${node.colors.shadow} 
                  ${node.colors.hover}
                  ${node.colors.glow}
                  ${node.colors.backdrop}
                  ${node.size} 
                  ${node.shape} 
                  border-2 
                  transition-all duration-500 ease-out
                  flex items-center justify-between 
                  hover:scale-110 hover:shadow-2xl 
                  cursor-pointer 
                  ${isHovered ? 'scale-110 shadow-2xl' : ''} 
                  group
                  relative
                  overflow-hidden
                  transform-gpu
                  will-change-transform
                `}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                style={{ 
                  filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3)) drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                  width: `${node.width}px`, 
                  maxWidth: `${node.width}px`,
                  minHeight: `${node.height}px`,
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)'
                }}
              >
                <span className={`px-3 text-center leading-tight ${node.colors.text} font-medium flex-1 break-words`}>
                  {node.text}
                </span>
                {node.hasChildren && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleNodeExpansion(node.id);
                    }}
                    className="ml-3 p-2.5 rounded-full transition-all duration-300 bg-white/25 hover:bg-white/40 text-white hover:scale-125 shadow-xl border border-white/40 backdrop-blur-sm hover:shadow-white/20"
                    title={node.isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {node.isExpanded ? (
                      <FaMinus className="w-3 h-3" />
                    ) : (
                      <FaPlus className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
});

HorizontalMindMapVisualization.displayName = 'HorizontalMindMapVisualization';

export default HorizontalMindMapVisualization;
