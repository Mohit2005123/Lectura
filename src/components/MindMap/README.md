# Dynamic Mindmap Component

A modern, interactive mindmap component built with React and JavaScript, featuring hierarchical tree layout, smooth animations, and advanced user interactions.

## Features

### Core Functionality
- **Hierarchical Tree Layout**: Automatic positioning with proper spacing and collision detection
- **Dynamic Expansion/Collapse**: Click nodes to expand or collapse branches with smooth animations
- **Curved Bezier Connections**: Beautiful curved lines connecting parent and child nodes
- **Modern Dark Theme**: Professional dark UI with gradient effects and glass morphism

### Advanced Features
- **Search Functionality**: Real-time search across all nodes
- **Zoom & Pan**: Mouse wheel zoom and drag-to-pan navigation
- **Undo/Redo**: Full history management for all interactions
- **Export**: Download mindmap as PNG image
- **Responsive Design**: Adapts to different screen sizes
- **Keyboard Navigation**: Full keyboard support for accessibility

### Visual Design
- **Level-based Styling**: Different colors and sizes for each hierarchy level
- **Hover Effects**: Smooth scale and glow effects on interaction
- **Smooth Animations**: 300-500ms transitions with easing functions
- **Professional Typography**: Clear, readable fonts with proper sizing

## Components

### MindMap.jsx
Main component that orchestrates the entire mindmap experience.

**Props:**
- `data` (Object): Mindmap data structure
- `onNodeClick` (Function): Node click callback
- `containerSize` (Object): Container dimensions `{width, height}`
- `showControls` (Boolean): Whether to show control panel

### Node.jsx
Individual node component with modern styling and interactions.

**Props:**
- `node` (Object): Node data object
- `onToggle` (Function): Toggle expansion callback
- `position` (Object): Node position `{x, y}`
- `isHovered` (Boolean): Whether node is being hovered
- `onHover` (Function): Hover state callback
- `isExpanded` (Boolean): Whether node is expanded
- `level` (Number): Node depth level

### useLayout.js
Custom hook for layout calculations and state management.

**Exports:**
- `layout`: Current layout state with nodes and connections
- `expandedNodes`: Set of expanded node IDs
- `toggleNode`: Function to toggle node expansion
- `isNodeVisible`: Function to check node visibility

### utils.js
Utility functions for calculations and animations.

**Key Functions:**
- `generateBezierPath()`: Create curved connection paths
- `calculateTextDimensions()`: Measure text for proper sizing
- `animate()`: Smooth animation helper
- `easing`: Collection of easing functions

## Data Structure

The mindmap expects data in the following format:

```javascript
{
  id: "root",
  title: "Main Topic",
  children: [
    {
      id: "child1",
      title: "Sub-topic 1",
      children: [
        {
          id: "child1-1",
          title: "Detail 1",
          children: []
        }
      ]
    }
  ]
}
```

## Usage

### Basic Usage
```jsx
import MindMap from './components/MindMap/MindMap';

const MyComponent = () => {
  const data = {
    id: "root",
    title: "My Mind Map",
    children: [
      { id: "node1", title: "Node 1", children: [] },
      { id: "node2", title: "Node 2", children: [] }
    ]
  };

  return (
    <MindMap 
      data={data}
      containerSize={{ width: 800, height: 600 }}
      showControls={true}
    />
  );
};
```

### With Modal
```jsx
import MindMapModal from './components/MindMap/MindMapModal';

const MyComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <MindMapModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      mindMapData={data}
      title="My Mind Map"
    />
  );
};
```

## Styling

The component uses Tailwind CSS classes and can be customized by modifying the color schemes in the component files:

### Color Schemes
- **Root (Level 0)**: Purple gradient with premium styling
- **Level 1**: Blue gradient with professional look
- **Level 2**: Emerald gradient for fresh appearance
- **Level 3+**: Indigo gradient for sophisticated look

### Customization
To customize colors, modify the `getNodeStyle` function in `Node.jsx` or the color arrays in the layout hook.

## Performance

The component is optimized for performance with:
- **Memoization**: React.memo and useMemo for expensive calculations
- **Virtualization**: Only renders visible nodes (future enhancement)
- **Smooth Animations**: 60fps animations using requestAnimationFrame
- **Efficient Layout**: Optimized positioning algorithms

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Accessibility

- **ARIA Labels**: Proper accessibility attributes
- **Keyboard Navigation**: Full keyboard support
- **Focus Management**: Clear focus indicators
- **Screen Reader**: Compatible with screen readers

## Development

### Running the Demo
```bash
npm run dev
# Navigate to /mindmap-demo
```

### Testing
The component includes comprehensive testing for:
- Node expansion/collapse
- Layout calculations
- Animation performance
- User interactions

## Future Enhancements

- **Virtualization**: For very large mindmaps (>100 nodes)
- **Minimap**: Overview of entire structure
- **Export Options**: SVG, PDF export formats
- **Collaborative Features**: Real-time editing
- **Templates**: Pre-built mindmap templates
- **Themes**: Multiple color themes

## License

This component is part of the Lectura project and follows the same licensing terms.
