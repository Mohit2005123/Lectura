'use client';
import { useState } from 'react';
import MindMap from '../../components/MindMap/MindMap';
import MindMapModal from '../../components/MindMap/MindMapModal';

const MindMapDemo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sample data matching the specifications
  const sampleData = {
    id: "root",
    title: "Computer Networking Architecture and Protocols",
    children: [
      {
        id: "overview",
        title: "Computer Networking Overview (ACN)",
        children: [
          {
            id: "osi",
            title: "OSI/ISO 7-Layer Architecture",
            children: [
              {
                id: "model",
                title: "Model Details",
                children: [
                  { id: "layer7", title: "Application Layer" },
                  { id: "layer6", title: "Presentation Layer" },
                  { id: "layer5", title: "Session Layer" }
                ]
              },
              {
                id: "dataflow",
                title: "Data Flow (Layers 7 to 1)",
                children: [
                  { id: "encapsulation", title: "Data Encapsulation" },
                  { id: "decapsulation", title: "Data Decapsulation" }
                ]
              },
              {
                id: "host",
                title: "Host Layers (L7, L6, L5, L4)",
                children: [
                  { id: "application", title: "Application Services" },
                  { id: "transport", title: "Transport Services" }
                ]
              },
              {
                id: "media",
                title: "Media Layers (L3, L2, L1)",
                children: [
                  { id: "network", title: "Network Layer" },
                  { id: "datalink", title: "Data Link Layer" },
                  { id: "physical", title: "Physical Layer" }
                ]
              }
            ]
          },
          {
            id: "tcpip",
            title: "TCP/IP Protocol Suite",
            children: [
              {
                id: "tcp",
                title: "Transmission Control Protocol",
                children: [
                  { id: "tcp-features", title: "TCP Features" },
                  { id: "tcp-connection", title: "Connection Management" }
                ]
              },
              {
                id: "ip",
                title: "Internet Protocol",
                children: [
                  { id: "ipv4", title: "IPv4" },
                  { id: "ipv6", title: "IPv6" }
                ]
              }
            ]
          }
        ]
      },
      {
        id: "network-technologies",
        title: "Network Technologies",
        children: [
          {
            id: "fddi",
            title: "Fiber Distributed Data Interface (FDDI)",
            children: []
          },
          {
            id: "ethernet",
            title: "Ethernet Technologies",
            children: [
              { id: "fast-ethernet", title: "Fast Ethernet (100 Mbps)" },
              { id: "gigabit-ethernet", title: "Gigabit Ethernet (1Gbps+)" }
            ]
          },
          {
            id: "wireless",
            title: "Wireless Technologies",
            children: [
              { id: "wifi", title: "Wi-Fi (IEEE 802.11 family)" },
              { id: "wimax", title: "WiMAX (IEEE 802.16)" }
            ]
          }
        ]
      },
      {
        id: "routing",
        title: "Routing Techniques",
        children: [
          { id: "static-routing", title: "Static Routing" },
          { id: "dynamic-routing", title: "Dynamic Routing" },
          { id: "routing-protocols", title: "Routing Protocols" }
        ]
      }
    ]
  };

  return (
    <div className="w-full h-screen bg-gray-900">
      <div className="p-4">
        <h1 className="text-3xl font-bold text-white mb-4">New Mind Map Demo</h1>
        <p className="text-gray-300 mb-6">
          This demonstrates the new mindmap component with all the advanced features:
          hierarchical layout, smooth animations, curved connections, search, zoom, pan, and more.
        </p>
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
          >
            Open in Modal
          </button>
        </div>
      </div>

      <div className="h-[calc(100vh-200px)]">
        <MindMap
          data={sampleData}
          containerSize={{ width: 1200, height: 600 }}
          showControls={true}
        />
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

export default MindMapDemo;