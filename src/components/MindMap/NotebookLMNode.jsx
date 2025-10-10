'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * NotebookLM-style node component
 * Features: rounded rect, subtle shadow, text wrapping, expand indicator
 */
const NotebookLMNode = ({
    node,
    onToggle,
    isHovered,
    onHover,
    transform
}) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const nodeRef = useRef(null);

    // Handle node click
    const handleClick = (e) => {
        e.stopPropagation();
        if (node.hasChildren) {
            setIsAnimating(true);
            onToggle(node.id);
            // Reset animation state after transition
            setTimeout(() => setIsAnimating(false), 300);
        }
    };

    // Handle hover
    const handleMouseEnter = () => {
        onHover(node.id);
    };

    const handleMouseLeave = () => {
        onHover(null);
    };

    // Node styling based on level - matching NotebookLM style
    const getNodeStyle = () => {
        const baseStyle = {
            width: node.width,
            height: node.height,
            position: 'absolute',
            left: node.x - node.width / 2,
            top: node.y - node.height / 2,
            // No transform needed - parent container handles it
            cursor: node.hasChildren ? 'pointer' : 'default',
            userSelect: 'none',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
        };

        // Level-specific styling - darker theme like reference images
        if (node.level === 0) {
            return {
                ...baseStyle,
                background: '#2d3748',
                border: '2px solid #4a5568',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                color: '#ffffff'
            };
        } else if (node.level === 1) {
            return {
                ...baseStyle,
                background: '#4a5568',
                border: '2px solid #718096',
                boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
                color: '#ffffff'
            };
        } else {
            return {
                ...baseStyle,
                background: '#718096',
                border: '2px solid #a0aec0',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.15)',
                color: '#ffffff'
            };
        }
    };

    // Text styling - white text for dark nodes
    const getTextStyle = () => {
        const baseStyle = {
            color: '#ffffff',
            fontWeight: node.level === 0 ? '700' : node.level === 1 ? '600' : '500',
            fontSize: node.level === 0 ? '16px' : node.level === 1 ? '15px' : '14px',
            lineHeight: '1.4',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: '12px 16px',
            wordWrap: 'break-word',
            overflow: 'hidden'
        };

        return baseStyle;
    };

    return (
        <motion.div
            ref={nodeRef}
            className="notebooklm-node"
            style={getNodeStyle()}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
                scale: isAnimating ? 1.05 : 1,
                opacity: 1
            }}
            transition={{
                duration: 0.3,
                ease: 'easeOut'
            }}
            whileHover={{
                scale: 1.02,
                boxShadow: '0 8px 40px rgba(0, 0, 0, 0.15)'
            }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Node content */}
            <div style={getTextStyle()}>
                {node.lines && node.lines.length > 0 ? (
                    node.lines.map((line, index) => (
                        <div key={index} style={{ marginBottom: index < node.lines.length - 1 ? '2px' : '0' }}>
                            {line}
                        </div>
                    ))
                ) : (
                    <div>{node.title}</div>
                )}
            </div>

            {/* Expand indicator */}
            {node.hasChildren && (
                <div
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '12px',
                        color: '#4a5568',
                        fontWeight: 'bold',
                        transition: 'transform 0.2s ease',
                        transform: `translateY(-50%) ${node.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'}`
                    }}
                >
                    ▶
                </div>
            )}

            {/* Hover effect overlay */}
            {isHovered && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 'inherit',
                        pointerEvents: 'none'
                    }}
                />
            )}
        </motion.div>
    );
};

export default NotebookLMNode;
