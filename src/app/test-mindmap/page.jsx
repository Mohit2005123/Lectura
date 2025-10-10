'use client';
import { useState } from 'react';
import MindMap from '../../components/MindMap';

// Sample mindmap data for testing
const sampleData = {
    id: 'root',
    title: 'Data Science Fundamentals',
    children: [
        {
            id: 'overview',
            title: 'Overview',
            children: [
                {
                    id: 'what-is-ds',
                    title: 'What is Data Science?',
                    children: [
                        {
                            id: 'ds-definition',
                            title: 'Definition and Scope'
                        },
                        {
                            id: 'ds-applications',
                            title: 'Real-world Applications'
                        }
                    ]
                },
                {
                    id: 'ds-process',
                    title: 'Data Science Process',
                    children: [
                        {
                            id: 'problem-definition',
                            title: 'Problem Definition'
                        },
                        {
                            id: 'data-collection',
                            title: 'Data Collection'
                        },
                        {
                            id: 'data-analysis',
                            title: 'Data Analysis'
                        },
                        {
                            id: 'model-building',
                            title: 'Model Building'
                        }
                    ]
                }
            ]
        },
        {
            id: 'tools',
            title: 'Tools & Technologies',
            children: [
                {
                    id: 'programming',
                    title: 'Programming Languages',
                    children: [
                        {
                            id: 'python',
                            title: 'Python'
                        },
                        {
                            id: 'r',
                            title: 'R'
                        },
                        {
                            id: 'sql',
                            title: 'SQL'
                        }
                    ]
                },
                {
                    id: 'libraries',
                    title: 'Libraries & Frameworks',
                    children: [
                        {
                            id: 'pandas',
                            title: 'Pandas'
                        },
                        {
                            id: 'numpy',
                            title: 'NumPy'
                        },
                        {
                            id: 'scikit-learn',
                            title: 'Scikit-learn'
                        },
                        {
                            id: 'tensorflow',
                            title: 'TensorFlow'
                        }
                    ]
                }
            ]
        },
        {
            id: 'machine-learning',
            title: 'Machine Learning',
            children: [
                {
                    id: 'supervised',
                    title: 'Supervised Learning',
                    children: [
                        {
                            id: 'classification',
                            title: 'Classification'
                        },
                        {
                            id: 'regression',
                            title: 'Regression'
                        }
                    ]
                },
                {
                    id: 'unsupervised',
                    title: 'Unsupervised Learning',
                    children: [
                        {
                            id: 'clustering',
                            title: 'Clustering'
                        },
                        {
                            id: 'dimensionality',
                            title: 'Dimensionality Reduction'
                        }
                    ]
                }
            ]
        }
    ]
};

export default function TestMindMapPage() {
    const [containerSize, setContainerSize] = useState({ width: 1200, height: 800 });

    // Update container size on mount
    useState(() => {
        const updateSize = () => {
            setContainerSize({
                width: Math.max(800, window.innerWidth * 0.9),
                height: Math.max(600, window.innerHeight * 0.8)
            });
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 relative z-10">
                    NotebookLM-Style MindMap Test
                </h1>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden relative" style={{ height: '80vh', zIndex: 1 }}>
                    <MindMap
                        data={sampleData}
                        containerSize={containerSize}
                        showControls={true}
                    />
                </div>
            </div>
        </div>
    );
}
