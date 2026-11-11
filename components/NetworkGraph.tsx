'use client';

import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import type { Graph, Group } from '../lib/network';
import Portrait from './Portrait';

type Mode = 'explore' | 'connect' | 'unlink' | 'delete';
type Layout = 'free' | 'clusters' | 'orbit';
type Point = { x: number; y: number };
type Gesture = {
  kind: 'node' | 'pan';
  pointerId: number;
  nodeId?: string;
  start: Point;
  origin: Point;
  moved: boolean;
};

const WIDTH = 1000;
const HEIGHT = 620;
const round = (n: number) => Math.round(n * 1000) / 1000;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const groupColor: Record<Group, string> = {
  AI: '#729d91',
  Platforms: '#7797bb',
  Founders: '#c29b66',
  Community: '#a78eb4',
  You: '#357b5c',
};
const centers: Record<Group, [number, number]> = {
  AI: [255, 170],
  Platforms: [750, 175],
  Founders: [730, 445],
  Community: [265, 450],
  You: [500, 310],
};

export default function NetworkGraph({
  graph, scores, selected, onSelect, onMove, mode, onLink, layout,
}: {
  graph: Graph;
  scores: Map<string, number>;
  selected: string;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  mode: Mode;
  onLink: (id: string) => void;
  layout: Layout;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gestureRef = useRef<Gesture | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Point>({ x: 0, y: 0 });

  const ranked = [...graph.nodes].sort(
    (a, b) => (scores.get(b.id) ?? 0) - (scores.get(a.id) ?? 0)
  );
  const positions = new Map<string, Point>();

  for (const node of graph.nodes) {
    if (layout === 'free') {
      positions.set(node.id, { x: round(node.x), y: round(node.y) });
    } else if (layout === 'orbit') {
      const index = ranked.findIndex((person) => person.id === node.id);
      const radius = 35 + Math.sqrt(index / Math.max(1, graph.nodes.length - 1)) * 245;
      const angle = index * 2.39996;
      positions.set(node.id, {
        x: round(500 + radius * Math.cos(angle)),
        y: round(310 + radius * Math.sin(angle)),
      });
    } else {
      const members = graph.nodes.filter((person) => person.group === node.group);
      const index = members.findIndex((person) => person.id === node.id);
      const angle = index * 2.39996;
      const radius = node.group === 'You' ? 0 : Math.min(150, 50 + 12 * Math.sqrt(index));
      positions.set(node.id, {
        x: round(centers[node.group][0] + radius * Math.cos(angle)),
        y: round(centers[node.group][1] + radius * Math.sin(angle)),
      });
    }
  }

  const nodeRadius = (id: string) => round(19 + Math.sqrt(scores.get(id) ?? 0) * 48);

  // SVG's inverse screen transform handles responsive sizing, zoom and panning.
  const pointerPoint = (event: ReactPointerEvent): Point => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
    return { x: point.x, y: point.y };
  };

  const choose = (id: string) => {
    if (mode === 'explore') onSelect(id);
    else onLink(id);
  };

  const startNodeGesture = (event: ReactPointerEvent<SVGGElement>, id: string) => {
    event.stopPropagation();
    if (mode !== 'explore' || layout !== 'free') return;
    const node = graph.nodes.find((person) => person.id === id);
    if (!node) return;
    gestureRef.current = {
      kind: 'node', pointerId: event.pointerId, nodeId: id,
      start: pointerPoint(event), origin: { x: node.x, y: node.y }, moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const startCanvasGesture = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (mode !== 'explore' || gestureRef.current) return;
    gestureRef.current = {
      kind: 'pan', pointerId: event.pointerId,
      start: pointerPoint(event), origin: { ...pan }, moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveGesture = (event: ReactPointerEvent) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;
    const p = pointerPoint(event);
    const dx = p.x - gesture.start.x;
    const dy = p.y - gesture.start.y;
    if (Math.hypot(dx, dy) > 3) gesture.moved = true;
    if (!gesture.moved) return;
    if (gesture.kind === 'pan') {
      setPan({ x: round(gesture.origin.x + dx), y: round(gesture.origin.y + dy) });
    } else if (gesture.nodeId) {
      onMove(
        gesture.nodeId,
        round(clamp(gesture.origin.x + dx / zoom, 35, 965)),
        round(clamp(gesture.origin.y + dy / zoom, 35, 585))
      );
    }
  };

  const finishGesture = (event: ReactPointerEvent, nodeId?: string) => {
    const gesture = gestureRef.current;
    if (gesture?.pointerId === event.pointerId) {
      gestureRef.current = null;
      if (nodeId && gesture.kind === 'node' && !gesture.moved) choose(nodeId);
      return;
    }
    // In connect/unlink/delete modes, clicks do not initiate dragging.
    if (nodeId && mode !== 'explore') choose(nodeId);
    else if (nodeId && layout !== 'free') choose(nodeId);
  };

  const transform = `translate(${round(500 * (1 - zoom) + pan.x)} ${round(310 * (1 - zoom) + pan.y)}) scale(${zoom})`;

  return (
    <div className="network-wrap">
      <div className="network-toolbar">
        <span>DRAG · SELECT · CONNECT</span>
        <div>
          <button type="button" onClick={() => setZoom((z) => round(Math.max(0.65, z - 0.15)))} aria-label="Zoom out">−</button>
          <button type="button" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset view</button>
          <button type="button" onClick={() => setZoom((z) => round(Math.min(2, z + 0.15)))} aria-label="Zoom in">+</button>
        </div>
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="network-svg"
        aria-label="Interactive directed social graph"
        style={{ touchAction: 'none' }}
        onPointerDown={startCanvasGesture}
        onPointerMove={moveGesture}
        onPointerUp={(event) => finishGesture(event)}
        onPointerCancel={() => { gestureRef.current = null; }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="12" refY="3" orient="auto">
            <path d="M0 0L6 3L0 6" fill="#9ba7a2" />
          </marker>
          <marker id="arrowgreen" markerWidth="6" markerHeight="6" refX="12" refY="3" orient="auto">
            <path d="M0 0L6 3L0 6" fill="#3c9470" />
          </marker>
        </defs>
        <g transform={transform}>
          {layout === 'clusters' && (['AI', 'Platforms', 'Founders', 'Community'] as Group[]).map((group) => {
            const points = graph.nodes.filter((node) => node.group === group).map((node) => positions.get(node.id)!);
            if (!points.length) return null;
            const x = round(points.reduce((sum, p) => sum + p.x, 0) / points.length);
            const y = round(points.reduce((sum, p) => sum + p.y, 0) / points.length);
            return (
              <g key={group}>
                <circle cx={x} cy={y} r={165} fill={groupColor[group]} opacity={0.08} />
                <text x={x} y={round(y - 157)} textAnchor="middle" fontSize={17} fill={groupColor[group]} fontWeight={700}>{group}</text>
              </g>
            );
          })}
          {layout === 'orbit' && [95, 185, 275].map((r) => (
            <circle key={r} cx={500} cy={310} r={r} fill="none" stroke="#d7d7d0" strokeDasharray="5 8" />
          ))}
          {graph.edges.map((edge, index) => {
            const a = positions.get(edge.from);
            const b = positions.get(edge.to);
            if (!a || !b) return null;
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const length = Math.hypot(dx, dy) || 1;
            const ux = dx / length;
            const uy = dy / length;
            const r1 = nodeRadius(edge.from);
            const r2 = nodeRadius(edge.to);
            const highlighted = edge.from === selected || edge.to === selected;
            return (
              <line
                key={`${edge.from}-${edge.to}-${index}`}
                x1={round(a.x + ux * (r1 + 2))}
                y1={round(a.y + uy * (r1 + 2))}
                x2={round(b.x - ux * (r2 + 10))}
                y2={round(b.y - uy * (r2 + 10))}
                stroke={highlighted ? '#3c9470' : '#9ba7a2'}
                strokeWidth={highlighted ? 2.8 : 1.5}
                opacity={highlighted ? 0.9 : 0.36}
                markerEnd={highlighted ? 'url(#arrowgreen)' : 'url(#arrowhead)'}
              />
            );
          })}
          {graph.nodes.map((node) => {
            const p = positions.get(node.id)!;
            const radius = nodeRadius(node.id);
            return (
              <g
                key={node.id}
                transform={`translate(${p.x},${p.y})`}
                style={{ cursor: mode === 'explore' && layout === 'free' ? 'grab' : 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`Select ${node.name}`}
                onPointerDown={(event) => startNodeGesture(event, node.id)}
                onPointerMove={moveGesture}
                onPointerUp={(event) => { event.stopPropagation(); finishGesture(event, node.id); }}
                onPointerCancel={() => { gestureRef.current = null; }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    choose(node.id);
                  }
                }}
              >
                <circle r={round(radius + 6)} fill={selected === node.id ? '#e4c77e' : node.id === 'you' ? '#85b69a' : 'transparent'} opacity={0.8} />
                <circle r={round(radius + 2)} fill="#fff" />
                <foreignObject x={-radius} y={-radius} width={round(radius * 2)} height={round(radius * 2)}>
                  <div xmlns="http://www.w3.org/1999/xhtml" style={{ width: '100%', height: '100%' }}>
                    <Portrait person={node} size={round(radius * 2)} />
                  </div>
                </foreignObject>
                <text y={round(radius + 19)} textAnchor="middle" fontSize={13} fill="#25322c" fontWeight={node.id === 'you' ? 800 : 500}>{node.name}</text>
                {node.id === 'you' && (
                  <text y={round(-radius - 12)} textAnchor="middle" fontSize={12} fill="#327a5b" fontWeight={800}>YOU</text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      <div className="network-footer">
        Portrait size = PageRank score
        <span>Arrow = endorsement received by destination</span>
      </div>
    </div>
  );
}

