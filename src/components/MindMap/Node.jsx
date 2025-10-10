'use client';
import { useState } from 'react';
import { FaChevronRight, FaChevronDown, FaPlus, FaMinus } from 'react-icons/fa';

/**
 * Individual mindmap node component with modern design and interactions
 * @param {Object} props
 * @param {Object} props.node - Node data object
 * @param {Function} props.onToggle - Toggle expansion callback
 * @param {Object} props.position - Node position {x, y}
 * @param {boolean} props.isHovered - Whether node is being hovered
 * @param {Function} props.onHover - Hover state callback
 * @param {boolean} props.isExpanded - Whether node is expanded
 * @param {number} props.level - Node depth level
 */
const Node = ({
    node,
    onToggle,
    position,
    isHovered,
    onHover,
    isExpanded,
    level
}) => {
    const [isPressed, setIsPressed] = useState(false);

    const hasChildren = node.children && node.children.length > 0;

    // Modern color scheme based on level
    const getNodeStyle = (level) => {
        const styles = [
            // Root node - premium purple
            {
                bg: 'bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800',
                border: 'border-purple-400/60',
                shadow: 'shadow-2xl shadow-purple-500/30',
                text: 'text-white font-bold',
                hover: 'hover:from-purple-500 hover:via-purple-600 hover:to-purple-700',
                glow: 'hover:shadow-purple-400/50',
                size: 'text-xl px-8 py-4',
                shape: 'rounded-2xl'
            },
            // Level 1 - professional blue
            {
                bg: 'bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800',
                border: 'border-blue-400/60',
                shadow: 'shadow-xl shadow-blue-500/25',
                text: 'text-white font-semibold',
                hover: 'hover:from-blue-500 hover:via-blue-600 hover:to-blue-700',
                glow: 'hover:shadow-blue-400/40',
                size: 'text-lg px-6 py-3',
                shape: 'rounded-xl'
            },
            // Level 2 - fresh emerald
            {
                bg: 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800',
                border: 'border-emerald-400/60',
                shadow: 'shadow-lg shadow-emerald-500/25',
                text: 'text-white font-medium',
                hover: 'hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700',
                glow: 'hover:shadow-emerald-400/35',
                size: 'text-base px-5 py-2.5',
                shape: 'rounded-xl'
            },
            // Level 3+ - sophisticated indigo
            {
                bg: 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-800',
                border: 'border-indigo-400/60',
                shadow: 'shadow-lg shadow-indigo-500/25',
                text: 'text-white font-medium',
                hover: 'hover:from-indigo-500 hover:via-indigo-600 hover:to-indigo-700',
                glow: 'hover:shadow-indigo-400/35',
                size: 'text-sm px-4 py-2',
                shape: 'rounded-lg'
            }
        ];
        return styles[Math.min(level, styles.length - 1)];
    };

    const nodeStyle = getNodeStyle(level);

    const handleClick = (e) => {
        e.stopPropagation();
        if (hasChildren) {
            onToggle(node.id);
        }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => {
        setIsPressed(false);
        onHover(null);
    };

    return (
        <div
            className={`
        absolute transform -translate-x-1/2 -translate-y-1/2
        transition-all duration-300 ease-out
        ${isHovered ? 'z-50' : 'z-10'}
      `}
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
            }}
        >
            <div
                className={`
          ${nodeStyle.bg}
          ${nodeStyle.border}
          ${nodeStyle.shadow}
          ${nodeStyle.hover}
          ${nodeStyle.glow}
          ${nodeStyle.text}
          ${nodeStyle.size}
          ${nodeStyle.shape}
          border-2
          backdrop-blur-sm
          transition-all duration-300 ease-out
          flex items-center justify-between
          cursor-pointer
          group
          relative
          overflow-hidden
          transform-gpu
          will-change-transform
          ${isHovered ? 'scale-105' : 'scale-100'}
          ${isPressed ? 'scale-95' : ''}
          ${hasChildren ? 'hover:scale-110' : 'hover:scale-105'}
        `}
                onMouseEnter={() => onHover(node.id)}
                onMouseLeave={handleMouseLeave}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onClick={handleClick}
                style={{
                    filter: 'drop-shadow(0 8px 25px rgba(0,0,0,0.4))',
                    minWidth: '120px',
                    maxWidth: '300px',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}
            >
                {/* Node content */}
                <span className="px-3 text-center leading-tight flex-1 break-words">
                    {node.title || node.text || 'Untitled'}
                </span>

                {/* Expand/collapse indicator */}
                {hasChildren && (
                    <button
                        className={`
              ml-3 p-2 rounded-full
              transition-all duration-300 ease-out
              bg-white/20 hover:bg-white/30
              text-white hover:text-white
              shadow-lg hover:shadow-xl
              border border-white/30 hover:border-white/50
              backdrop-blur-sm
              hover:scale-125
              ${isHovered ? 'scale-110' : 'scale-100'}
            `}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggle(node.id);
                        }}
                        title={isExpanded ? 'Collapse' : 'Expand'}
                        aria-label={isExpanded ? 'Collapse node' : 'Expand node'}
                    >
                        {isExpanded ? (
                            <FaChevronDown className="w-3 h-3" />
                        ) : (
                            <FaChevronRight className="w-3 h-3" />
                        )}
                    </button>
                )}

                {/* Subtle glow effect on hover */}
                {isHovered && (
                    <div
                        className="absolute inset-0 rounded-inherit bg-white/10 pointer-events-none"
                        style={{
                            animation: 'pulse 2s infinite'
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default Node;
