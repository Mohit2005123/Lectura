'use client';
import { useState } from 'react';
import HorizontalMindMapVisualization from './VerticalMindMapVisualization';
import MindMapModal from './MindMapModal';

const VerticalMindMapDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Sample data matching the image structure
  const sampleData = {
    id: "root",
    text: "ACN Notes",
    children: [
      {
        id: "computer-network-overview",
        text: "Computer Network Overview",
        children: [
          {
            id: "definition-purpose",
            text: "Definition and purpose",
            children: []
          },
          {
            id: "tcp-ip-protocol",
            text: "TCP/IP protocol suite",
            children: []
          }
        ]
      },
      {
        id: "osi-model",
        text: "OSI Model",
        children: []
      },
      {
        id: "data-frame-structure",
        text: "Data Frame Structure",
        children: []
      },
      {
        id: "network-technologies",
        text: "Network Technologies",
        children: [
          {
            id: "fddi",
            text: "Fiber Distributed Data Interface (FDDI)",
            children: []
          },
          {
            id: "dqdb",
            text: "Distributed Queue Dual Bus (DQDB)",
            children: []
          },
          {
            id: "fast-ethernet",
            text: "Fast Ethernet (100 Mbps)",
            children: []
          },
          {
            id: "gigabit-ethernet",
            text: "Gigabit Ethernet (1Gbps+)",
            children: []
          },
          {
            id: "wifi",
            text: "Wi-Fi (IEEE 802.11 family)",
            children: []
          },
          {
            id: "wimax",
            text: "WiMAX (IEEE 802.16)",
            children: []
          }
        ]
      },
      {
        id: "routing-techniques",
        text: "Routing Techniques",
        children: []
      }
    ]
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Vertical Mind Map Demo</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Open Mind Map Modal
        </button>
      </div>
      
      <div className="h-[calc(100vh-120px)]">
        <HorizontalMindMapVisualization data={sampleData} />
      </div>
      
      <MindMapModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mindMapData={sampleData}
        title="Computer Networking Architecture and Protocols"
      />
    </div>
  );
};

export default VerticalMindMapDemo;
