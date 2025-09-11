'use client';
import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const MindMapVisualization = forwardRef(({ data }, ref) => {
  const [hoveredNode, setHoveredNode] = useState(null);
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef(null);
  const viewportRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [hasUserScale, setHasUserScale] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });
  
  // Debug: Log the data structure
  useEffect(() => {
    console.log('Mind Map Data:', data);
  }, [data]);
  
  // Observe the actual container size to keep nodes in view
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setContainerSize({
          width: Math.max(600, width),
          height: Math.max(500, height),
        });
      }
    });

    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, []);

  // Wheel to zoom (Ctrl/Cmd+wheel for precise; otherwise also allow wheel)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const zoomIntensity = 0.0012; // lower is slower
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
    const onMouseDown = (e) => {
      dragState.current = {
        dragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startPanX: pan.x,
        startPanY: pan.y
      };
      document.body.style.cursor = 'grabbing';
    };
    const onMouseMove = (e) => {
      if (!dragState.current.dragging) return;
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      setPan({ x: dragState.current.startPanX + dx, y: dragState.current.startPanY + dy });
    };
    const onMouseUp = () => {
      dragState.current.dragging = false;
      document.body.style.cursor = '';
    };
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [pan.x, pan.y]);
  
  // Level-based color palette (same color for all nodes at a given level)
  const getNodeColors = (level) => {
    const palette = [
      ['bg-purple-200', 'text-purple-800', 'border-purple-300'],  // level 0
      ['bg-rose-200', 'text-rose-800', 'border-rose-300'],        // level 1
      ['bg-blue-200', 'text-blue-800', 'border-blue-300'],        // level 2
      ['bg-amber-200', 'text-amber-800', 'border-amber-300'],     // level 3
      ['bg-emerald-200', 'text-emerald-800', 'border-emerald-300'],// level 4
      ['bg-indigo-200', 'text-indigo-800', 'border-indigo-300'],  // level 5
      ['bg-cyan-200', 'text-cyan-800', 'border-cyan-300'],        // level 6
      ['bg-pink-200', 'text-pink-800', 'border-pink-300'],        // level 7
      ['bg-lime-200', 'text-lime-800', 'border-lime-300'],        // level 8
      ['bg-orange-200', 'text-orange-800', 'border-orange-300']   // level 9
    ];
    return palette[level % palette.length];
  };

  const getNodeSize = (level) => {
    if (level === 0) return 'h-16 text-lg';
    if (level === 1) return 'h-12 text-base';
    return 'h-10 text-sm';
  };

  const getNodeShape = (level, index) => {
    if (level === 0) return 'rounded-2xl';
    if (level === 1) return 'rounded-xl';
    return index % 2 === 0 ? 'rounded-xl' : 'rounded-full';
  };

  const calculateNodePosition = (level, index, totalChildren, parentX = 0, parentY = 0) => {
    const centerX = containerSize.width / 2;
    const centerY = containerSize.height / 2;
    
    if (level === 0) return { x: centerX, y: centerY };
    
    // Ring radius for main branches based on container size
    const radius = Math.min(centerX, centerY) * 0.6;
    
    if (level === 1) {
      // Distribute children evenly around a full circle
      const safeTotal = Math.max(totalChildren, 1);
      const angleStep = (Math.PI * 2) / safeTotal;
      const startAngle = -Math.PI / 2; // start from top
      const angle = startAngle + angleStep * index;
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    }
    
    // Level 2+ - position relative to parent
    const parentAngle = Math.atan2(parentY - centerY, parentX - centerX);
    const spread = Math.PI / 2; // 90° sector around the parent direction
    const safeTotal = Math.max(totalChildren, 1);
    const angleOffset = spread * ((index + 1) / (safeTotal + 1) - 0.5);
    const childAngle = parentAngle + angleOffset;
    const childRadius = Math.min(centerX, centerY) * 0.35;
    
    return {
      x: parentX + Math.cos(childAngle) * childRadius,
      y: parentY + Math.sin(childAngle) * childRadius
    };
  };

  // --- Tree (top-down) layout that avoids overlap ---
  // Layout tuning
  const LEVEL_GAP = 140;       // vertical gap between levels
  const TOP_MARGIN = 110;
  const SIBLING_GAP = 40;      // minimum gap between siblings to avoid overlap

  // Roughly estimate node visual width from its text so siblings don't overlap
  const estimateNodeWidth = (text) => {
    const safe = typeof text === 'string' ? text : '';
    const longestWord = safe.split(/\s+/).reduce((m, w) => Math.max(m, w.length), 0);
    const avg = Math.min(40, Math.ceil(safe.length / 1.8));
    const base = Math.max(longestWord * 9, avg * 7); // px estimate
    return Math.max(140, Math.min(320, base + 60));  // clamp and add padding
  };

  const getLeafCount = (n) => {
    if (!n || !Array.isArray(n.children) || n.children.length === 0) return 1;
    return n.children.reduce((sum, c) => sum + getLeafCount(c), 0);
  };

  const buildLayout = (root) => {
    const nodes = [];
    const edges = [];
    if (!root) return { nodes, edges };

    // First pass: measure subtree widths from leaves up (ensures no overlap)
    const measure = (n) => {
      const children = Array.isArray(n.children) ? n.children : [];
      const selfWidth = estimateNodeWidth(n.text);
      if (children.length === 0) return selfWidth;
      const childWidths = children.map(measure);
      const sumChildren = childWidths.reduce((a, b) => a + b, 0) + SIBLING_GAP * (childWidths.length - 1);
      return Math.max(selfWidth, sumChildren);
    };
    const totalWidth = measure(root);

    const layoutNode = (n, depth, xLeft) => {
      const children = Array.isArray(n.children) ? n.children : [];
      // measure widths for children to allocate exact spans
      const childWidths = children.map(measure);
      const subtreeWidthPx = measure(n);
      const centerX = xLeft + subtreeWidthPx / 2;
      const centerY = TOP_MARGIN + depth * LEVEL_GAP;

      const visualWidth = estimateNodeWidth(n.text);
      const current = {
        id: n.id,
        text: n.text,
        level: depth,
        x: centerX,
        y: centerY,
        colors: getNodeColors(depth),
        size: getNodeSize(depth),
        shape: getNodeShape(depth, 0),
        width: visualWidth
      };
      nodes.push(current);

      // Layout children from left to right within this subtree span
      let cursor = xLeft + (subtreeWidthPx - (childWidths.reduce((a, b) => a + b, 0) + SIBLING_GAP * Math.max(children.length - 1, 0))) / 2;
      children.forEach((child, idx) => {
        const childWidthPx = childWidths[idx];
        const childCenterX = cursor + childWidthPx / 2;
        const childCenterY = TOP_MARGIN + (depth + 1) * LEVEL_GAP;

        // Edge (verticalish bezier)
        const c1x = centerX;
        const c1y = centerY + LEVEL_GAP * 0.3;
        const c2x = childCenterX;
        const c2y = childCenterY - LEVEL_GAP * 0.3;
        edges.push({ x1: centerX, y1: centerY, x2: childCenterX, y2: childCenterY, c1x, c1y, c2x, c2y });

        // Recurse into child with its allocated left bound
        layoutNode(child, depth + 1, cursor);
        cursor += childWidthPx + SIBLING_GAP;
      });

      return subtreeWidthPx;
    };

    // Layout centered using measured width
    layoutNode(root, 0, 0);
    const offsetX = Math.max(20, (containerSize.width - totalWidth) / 2);

    nodes.forEach((n) => (n.x += offsetX));
    edges.forEach((e) => {
      e.x1 += offsetX; e.x2 += offsetX; e.c1x += offsetX; e.c2x += offsetX;
    });

    return { nodes, edges };
  };

  // Expose imperative actions (fit to width)
  useImperativeHandle(ref, () => ({
    fitToWidth: () => {
      if (!data) return;
      const PADDING = 80;
      const { nodes } = buildLayout(data);
      if (!nodes || nodes.length === 0) return;
      const minX = Math.min(...nodes.map((n) => n.x), 0);
      const maxX = Math.max(...nodes.map((n) => n.x), 0);
      const contentW = maxX - minX + PADDING * 2;
      const availableW = containerSize.width;
      const scaleX = (availableW - 20) / contentW;
      const fitScale = Math.max(0.2, Math.min(3, scaleX * 0.98));
      setHasUserScale(true);
      setScale(fitScale);
      setPan({ x: 0, y: 0 });
    }
  }), [data, containerSize.width]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">🧠</div>
          <div>No mind map data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mind-map-container bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-full relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-100 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-blue-100 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-pink-100 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 bg-orange-100 rounded-full opacity-20 blur-xl"></div>
      </div>
      
      <div 
        ref={containerRef}
        className="relative w-full h-full"
        style={{ 
          minHeight: `${containerSize.height}px`,
          width: `${containerSize.width}px`,
          margin: '0 auto'
        }}
      >
        {(() => {
          const PADDING = 80;
          const { nodes, edges } = buildLayout(data);

          // Compute content bounds
          const minX = Math.min(...nodes.map((n) => n.x), 0);
          const maxX = Math.max(...nodes.map((n) => n.x), 0);
          const minY = Math.min(...nodes.map((n) => n.y), 0);
          const maxY = Math.max(...nodes.map((n) => n.y), 0);
          const contentW = maxX - minX + PADDING * 2;
          const contentH = maxY - minY + PADDING * 2;

          // Scale to fit available container while preserving aspect
          const availableW = containerSize.width;
          const availableH = containerSize.height;
          // Compute scale to utilize canvas (allow scaling up to 2x for presence)
          const scaleX = (availableW - 20) / contentW;
          const scaleY = (availableH - 20) / contentH;
          const fitScale = Math.min(scaleX, scaleY);
          const autoScale = Math.max(0.5, Math.min(2.0, fitScale * 0.95));
          const currentScale = hasUserScale ? Math.min(3, Math.max(0.2, scale)) : autoScale;

          const offsetX = PADDING - minX;
          const offsetY = PADDING - minY;

          return (
            <div
              ref={viewportRef}
              className="absolute cursor-grab"
              style={{
                width: `${contentW}px`,
                height: `${contentH}px`,
                left: '50%',
                top: '50%',
                transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px)) scale(${currentScale})`,
                transformOrigin: 'center center',
              }}
            >
              {/* Single SVG sized to the content for all paths */}
              <svg
                width={contentW}
                height={contentH}
                className="absolute inset-0 pointer-events-none"
                preserveAspectRatio="none"
                style={{ zIndex: 1 }}
              >
                {edges.map((e, i) => (
                  <g key={`edge-${i}`}>
                    <path
                      d={`M ${e.x1 + offsetX} ${e.y1 + offsetY} C ${e.c1x + offsetX} ${e.c1y + offsetY}, ${e.c2x + offsetX} ${e.c2y + offsetY}, ${e.x2 + offsetX} ${e.y2 + offsetY}`}
                      stroke="#6b7280"
                      strokeWidth="2.5"
                      fill="none"
                      className="opacity-70"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${e.x1 + offsetX} ${e.y1 + offsetY} C ${e.c1x + offsetX} ${e.c1y + offsetY}, ${e.c2x + offsetX} ${e.c2y + offsetY}, ${e.x2 + offsetX} ${e.y2 + offsetY}`}
                      stroke="#ffffff"
                      strokeWidth="1"
                      fill="none"
                      className="opacity-40"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${e.x2 - 6 + offsetX} ${e.y2 - 6 + offsetY} L ${e.x2 + offsetX} ${e.y2 + offsetY} L ${e.x2 + 6 + offsetX} ${e.y2 - 6 + offsetY}`}
                      stroke="#6b7280"
                      strokeWidth="2.5"
                      fill="none"
                      className="opacity-70"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                ))}
              </svg>

              {/* Render positioned nodes above the SVG */}
              {nodes.map((n) => {
                const isHovered = hoveredNode === n.id;
                return (
                  <div
                    key={n.id}
                    className="mind-map-node absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${n.x + offsetX}px`, top: `${n.y + offsetY}px`, zIndex: 10 - n.level }}
                  >
                    <div
                      className={`${n.colors[0]} ${n.colors[1]} ${n.colors[2]} ${n.size} ${n.shape} border-2 shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center font-semibold px-4 py-2 hover:scale-110 hover:shadow-xl cursor-pointer ${isHovered ? 'scale-110 shadow-xl' : ''} transform-gpu`}
                      onMouseEnter={() => setHoveredNode(n.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))', backdropFilter: 'blur(1px)', width: `${n.width}px`, maxWidth: `${n.width}px` }}
                    >
                      <span className="px-1 text-center leading-tight whitespace-pre-wrap break-words">{n.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
    </div>
  );
});

export default MindMapVisualization;
