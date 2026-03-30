import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './KnowledgeGraph.css';

const KnowledgeGraph = ({ data, initialSelectedId, onNodeClick }) => {
  // 🚀 Force HMR Sync: getNodeColor reference restored and verified.
  const svgRef = useRef();
  const containerRef = useRef();
  const simulationRef = useRef();
  const nodesGroupRef = useRef();
  const linksGroupRef = useRef();

  const [hoveredNode, setHoveredNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [level, setLevel] = useState('topics'); // "topics", "items", "entities"
  const zoomRef = useRef();
  const tooltipRef = useRef();
  const zoomTransformRef = useRef(d3.zoomIdentity);

  // 🚀 Dynamic Premium Color Logic
  const getNodeColor = (d, isHull = false) => {
    let h = 255; // Topic (Purple)
    if (d.type === 'Item') h = 210; // Item (Blue)
    if (d.type === 'Entity') h = 330; // Entity (Pink)

    // Cluster-specific hue shift
    let shift = 0;
    if (d.clusterId) {
      let hash = 0;
      for (let i = 0; i < d.clusterId.length; i++) {
        hash = d.clusterId.charCodeAt(i) + ((hash << 5) - hash);
      }
      shift = (Math.abs(hash) % 30) - 15;
    }

    return `hsl(${h + shift}, 75%, ${isHull ? 60 : 65}%)`;
  };

  useEffect(() => {
    if (initialSelectedId && data?.nodes) {
      const node = data.nodes.find(n => n.id === initialSelectedId);
      if (node) setSelectedNode(node);
    }
  }, [initialSelectedId, data]);

  // 1. Initial Setup and Simulation Creation
  useEffect(() => {
    if (!data || !svgRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Ensure main group exists
    let g = svg.select('.main-group');
    if (g.empty()) {
      g = svg.append('g').attr('class', 'main-group');
      
      // 🏹 Define Arrowheads once
      svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '-0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('orient', 'auto')
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#94a3b8');

      // Zoom behavior
      const zoom = d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
          zoomTransformRef.current = event.transform;
          
          // 🚀 Show/Hide labels based on zoom level (threshold: 1.15)
          svg.classed('zoom-high', event.transform.k > 1.15);
          updateTooltipDynamic();
        });

      svg.call(zoom);
      zoomRef.current = zoom;

      svg.on('click', (event) => {
        if (event.target.tagName === 'svg') {
          setSelectedNode(null);
        }
      });
    }

    // 1. Simulation Setup
    let simulation = simulationRef.current;
    if (!simulation) {
      simulation = d3.forceSimulation(data.nodes)
        .force('link', d3.forceLink(data.links).id(d => d.id).distance(d => {
          // 🚀 Clustering Logic: Tighter links within the same cluster
          const sourceCluster = typeof d.source === 'object' ? d.source.clusterId : data.nodes.find(n => n.id === d.source)?.clusterId;
          const targetCluster = typeof d.target === 'object' ? d.target.clusterId : data.nodes.find(n => n.id === d.target)?.clusterId;
          const sameCluster = sourceCluster === targetCluster;

          if (d.type === 'topic-link') return sameCluster ? 70 : 150;
          if (d.type === 'item-entity-link') return 50;
          if (d.type === 'relationship-link') return 90;
          if (d.type === 'semantic-link') return 250;
          return 110;
        }).strength(0.6))
        .force('charge', d3.forceManyBody().strength(d => {
          // 🚀 Stronger repulsion for Topics to create space between clusters
          if (d.type === 'Topic') return -1200;
          if (d.type === 'Entity') return -200;
          return -400;
        }))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => {
          const base = d.size || (d.type === 'Topic' ? 30 : 10);
          return base + 30;
        }).strength(0.8));

      // 🚀 Custom Clustering Force: Pull towards cluster centers
      simulation.force('cluster', (alpha) => {
        data.nodes.forEach(d => {
          if (d.type === 'Topic' || !d.clusterId) return;
          
          // Find the cluster center (the parent topic node)
          const clusterCenter = data.nodes.find(n => n.id === d.clusterId);
          if (clusterCenter && clusterCenter !== d) {
            // Apply a small pull towards the cluster center
            d.vx += (clusterCenter.x - d.x) * alpha * 0.15;
            d.vy += (clusterCenter.y - d.y) * alpha * 0.15;
          }
        });
      });

      simulationRef.current = simulation;
    } else {
      // 🚀 Coordinate Inheritance: Ensure new nodes spawn from the parent's position
      if (selectedNode) {
        // Find existing coordinates from the current simulation (real source of truth)
        const currentParent = simulation.nodes().find(n => n.id === selectedNode.id);
        const spawnX = currentParent ? currentParent.x : (selectedNode.x || width / 2);
        const spawnY = currentParent ? currentParent.y : (selectedNode.y || height / 2);

        data.nodes.forEach(n => {
          // If node doesn't have coordinates or is a new entry in this simulation
          if (n.id !== selectedNode.id && !simulation.nodes().find(existing => existing.id === n.id)) {
            n.x = spawnX;
            n.y = spawnY;
          }
        });
      }

      simulation.nodes(data.nodes);
      simulation.force('link').links(data.links);
      simulation.alpha(0.3).restart();
    }

    // 2. Data Joins with Transitions
    const transition = d3.transition().duration(500).ease(d3.easeCubicInOut);

    // Hulls (Blobs) - Background layer
    let hullsGroup = g.select('.hulls-group');
    if (hullsGroup.empty()) {
      // Insert BEFORE links-group if it exists, otherwise append
      const linksG = g.select('.links-group');
      if (!linksG.empty()) {
        hullsGroup = g.insert('g', '.links-group').attr('class', 'hulls-group');
      } else {
        hullsGroup = g.append('g').attr('class', 'hulls-group');
      }
    }

    // Links
    let linksGroup = g.select('.links-group');
    if (linksGroup.empty()) linksGroup = g.append('g').attr('class', 'links-group');

    linksGroupRef.current = linksGroup
      .selectAll('path.link')
      .data(data.links, d => `${d.source.id || d.source}-${d.target.id || d.target}`)
      .join(
        enter => enter.append('path')
          .attr('class', d => `link ${d.type || 'topic-link'}`)
          .attr('marker-end', d => d.type === 'relationship-link' ? 'url(#arrowhead)' : null)
          .attr('fill', 'none')
          .attr('opacity', 0)
          .call(enter => enter.transition(transition).attr('opacity', 1)),
        update => update,
        exit => exit.transition(transition).attr('opacity', 0).remove()
      );

    // Nodes
    let nodesGroup = g.select('.nodes-group');
    if (nodesGroup.empty()) nodesGroup = g.append('g').attr('class', 'nodes-group');

    nodesGroupRef.current = nodesGroup
      .selectAll('g.node')
      .data(data.nodes, d => d.id)
      .join(
        enter => {
          const gNode = enter.append('g')
            .attr('class', d => `node ${d.type.toLowerCase()}${d.isMain ? ' main' : ''}${d.isImportant ? ' important' : ''}`)
            .attr('opacity', 0)
            .call(drag(simulation));

          gNode.append('circle')
            .attr('r', d => {
              const base = d.size || (d.type === 'Topic' ? 30 : 10);
              return d.isImportant ? base * 1.2 : base;
            })
            .attr('fill', d => getNodeColor(d)) // 🚀 Dynamic Premium Color
            .attr('opacity', d => (d.type === 'Item' || d.type === 'Entity') ? 0.9 : 1);

          gNode.insert('circle', ':first-child')
            .attr('class', 'node-halo')
            .attr('r', d => d.haloSize || (d.type === 'Topic' ? 38 : 16));

          gNode.append('text')
            .attr('class', 'node-label')
            .attr('dy', d => d.type === 'Topic' ? -22 : -18)
            .attr('text-anchor', 'middle')
            .text(d => d.title || d.name)
            .attr('opacity', 0); // 🚀 Hidden by default

          gNode.transition(transition).attr('opacity', 1);
          return gNode;
        },
        update => update,
        exit => exit.transition(transition).attr('opacity', 0).remove()
      );

    // Re-attach events because join might have created new elements
    nodesGroupRef.current.on('mouseenter', (event, d) => {
      // Mark node as hovered for the simulation tick to pick up
      data.nodes.forEach(n => n.__hovered = (n.id === d.id));
      setHoveredNode(d);
      d3.select(event.currentTarget).classed('hovered', true);
      d3.select(event.currentTarget).select('.node-label').transition().duration(200).attr('opacity', 1);
      
      // 🚀 Hover highlight: Identify connected links
      linksGroupRef.current.classed('hover-highlight', l => {
        const sourceId = l.source.id || l.source;
        const targetId = l.target.id || l.target;
        return sourceId === d.id || targetId === d.id;
      });

      updateTooltipDynamic();
    })
      .on('mousemove', (event) => {
        // Position handled by tick and zoom for better attachment
      })
      .on('mouseleave', (event, d) => {
        d.__hovered = false;
        setHoveredNode(null);
        d3.select(event.currentTarget).classed('hovered', false);
        
        // Remove hover highlights
        linksGroupRef.current.classed('hover-highlight', false);

        if (d.type !== 'Topic' && d.degree <= 4 && (!selectedNode || selectedNode.id !== d.id)) {
          d3.select(event.currentTarget).select('.node-label').transition().duration(200).attr('opacity', 0);
        }
        
        updateTooltipDynamic();
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedNode(prev => prev?.id === d.id ? null : d);
        if (onNodeClick) onNodeClick(d);
      });

      simulation.on('tick', () => {
        // 🚀 Update Hulls (Blobs)
        const clusterNodes = d3.group(data.nodes, d => d.clusterId);
        const hullData = [];
        const hullLine = d3.line().curve(d3.curveBasisClosed);

        clusterNodes.forEach((nodes, clusterId) => {
          if (!clusterId) return;
          if (nodes.length < 3) {
            // Circle approximation for small clusters
            const cx = d3.mean(nodes, d => d.x);
            const cy = d3.mean(nodes, d => d.y);
            // Padded circle path
            const r = 45;
            hullData.push({ 
              id: clusterId, 
              path: `M ${cx-r},${cy} a ${r},${r} 0 1,0 ${r*2},0 a ${r},${r} 0 1,0 -${r*2},0`,
              color: getNodeColor(nodes[0], true) // 🚀 Consistent Premium Color
            });
          } else {
            const points = nodes.map(d => [d.x, d.y]);
            const hullPoints = d3.polygonHull(points);
            if (hullPoints) {
              // Add padding by expanding points slightly from their centroid
              const centroid = [d3.mean(hullPoints, p => p[0]), d3.mean(hullPoints, p => p[1])];
              const paddedHull = hullPoints.map(p => [
                p[0] + (p[0] - centroid[0]) * 0.3, // 30% padding
                p[1] + (p[1] - centroid[1]) * 0.3
              ]);
              hullData.push({ 
                id: clusterId, 
                path: hullLine(paddedHull), 
                color: getNodeColor(nodes[0], true) // 🚀 Consistent Premium Color
              });
            }
          }
        });

        hullsGroup.selectAll('path')
          .data(hullData, d => d.id)
          .join(
            enter => enter.append('path')
              .attr('class', 'cluster-hull')
              .attr('fill', d => d.color)
              .attr('opacity', 0)
              .call(enter => enter.transition().duration(800).attr('opacity', 0.15)),
            update => update.attr('d', d => d.path),
            exit => exit.remove()
          );

        linksGroupRef.current
          .attr('d', d => {
            const x1 = d.source.x;
            const y1 = d.source.y;
            const x2 = d.target.x;
            const y2 = d.target.y;

            if (d.type === 'topic-link') {
              // 🚀 Subtle Curve logic for Topic Links
              const dx = x2 - x1;
              const dy = y2 - y1;
              const dr = Math.sqrt(dx * dx + dy * dy);
              
              // We want a subtle arc. Quadratic Bezier is perfect.
              // Control point is mid point offset slightly
              const qx = (x1 + x2) / 2 + (dy / dr) * 20; // 20px offset
              const qy = (y1 + y2) / 2 - (dx / dr) * 20;
              
              return `M ${x1},${y1} Q ${qx},${qy} ${x2},${y2}`;
            }

            // Straight line for others
            return `M ${x1},${y1} L ${x2},${y2}`;
          });

        nodesGroupRef.current
          .attr('transform', d => `translate(${d.x},${d.y})`);

        updateTooltipDynamic();
      });

    function updateTooltipDynamic() {
      // Direct DOM manipulation for high-performance tooltip tracking
      if (!tooltipRef.current || !zoomTransformRef.current) return;
      
      // Access the node from the simulation directly to get the current tick's position
      // Using a closure-captured reference or finding it in the simulation nodes
      const currentHovered = simulationRef.current?.nodes().find(n => n.__hovered);
      
      if (!currentHovered) {
        tooltipRef.current.style.opacity = '0';
        tooltipRef.current.style.visibility = 'hidden';
        return;
      }

      const [sx, sy] = zoomTransformRef.current.apply([currentHovered.x, currentHovered.y]);
      
      // Calculate offset based on node size
      const radius = currentHovered.size || (currentHovered.type === 'Topic' ? 30 : 10);
      const offset = radius + 20;

      tooltipRef.current.style.visibility = 'visible';
      tooltipRef.current.style.opacity = '1';
      tooltipRef.current.style.transform = `translate(${sx}px, ${sy - offset}px) translateX(-50%) translateY(-100%)`;
      tooltipRef.current.style.left = '0';
      tooltipRef.current.style.top = '0';
    }

    function updateTooltipPos(event) {
      // Optional: fallback or initial positioning logic
    }

    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.1).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }
      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }
      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }
      return d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended);
    }

    return () => {
      simulation.stop();
      simulationRef.current = null;
    };
  }, [data]);

  // 2. Separate Effect for Highlighting & Zooming
  useEffect(() => {
    if (!nodesGroupRef.current || !linksGroupRef.current || !svgRef.current) return;

    const node = nodesGroupRef.current;
    const link = linksGroupRef.current;
    const svg = d3.select(svgRef.current);
    const zoom = zoomRef.current;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Reset fx/fy for all nodes so they can move, except the main topic if needed
    data.nodes.forEach(n => {
      if (!n.isMain) {
        n.fx = null;
        n.fy = null;
      }
    });

    if (!selectedNode) {
      node.classed('dimmed', false).classed('highlighted', false).classed('selected', false);
      link.classed('dimmed', false).classed('highlighted', false);
      const mainTopic = data.nodes.find(n => n.isMain);
      if (mainTopic) {
        mainTopic.fx = width / 2;
        mainTopic.fy = height / 2;
      }
      return;
    }

    // 🚀 High-Performance Neighbor Detection (1-hop only)
    const neighbors = new Set();
    neighbors.add(selectedNode.id);

    data.links.forEach(l => {
      const sourceId = l.source.id || l.source;
      const targetId = l.target.id || l.target;
      if (sourceId === selectedNode.id) neighbors.add(targetId);
      if (targetId === selectedNode.id) neighbors.add(sourceId);
    });

    // 🚀 Reactive Path Highlighting
    const activeNodeId = hoveredNode?.id || selectedNode?.id;

    node.classed('highlighted', d => neighbors.has(d.id))
      .classed('dimmed', d => activeNodeId && !neighbors.has(d.id))
      .classed('selected', d => d.id === (selectedNode?.id || null));

    link.classed('active-path', l => {
      const sourceId = l.source.id || l.source;
      const targetId = l.target.id || l.target;
      return sourceId === activeNodeId || targetId === activeNodeId;
    })
      .classed('dimmed', l => {
        const sourceId = l.source.id || l.source;
        const targetId = l.target.id || l.target;
        return activeNodeId && sourceId !== activeNodeId && targetId !== activeNodeId;
      });

    // ✨ Focus & Zoom Logic: Move node to center & neighbors follow
    const targetNode = data.nodes.find(n => n.id === selectedNode.id);
    if (targetNode) {
      // Guide simulation to move this node to center
      targetNode.fx = width / 2;
      targetNode.fy = height / 2;
      
      const simulation = simulationRef.current;
      if (simulation) simulation.alpha(0.3).restart();
      
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(level === 'topics' ? 1.1 : 1.3)
        .translate(-(width / 2), -(height / 2)); // Since node is moving to width/2

      svg.transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, transform);
    }
  }, [selectedNode, data]);

  return (
    <div className="knowledge-graph-container" ref={containerRef}>
      <svg ref={svgRef}></svg>

      {/* 🚀 Consolidated Smart Context Tooltip */}
      <div 
        ref={tooltipRef}
        className={`graph-tooltip glass ${hoveredNode?.isImportant ? 'important' : ''}`}
        style={{ 
          position: 'absolute',
          opacity: 0,
          visibility: 'hidden',
          pointerEvents: 'none',
          zIndex: 100,
          transition: 'opacity 0.2s ease'
        }}
      >
        {hoveredNode && (
          <>
            {hoveredNode.isImportant && (
              <div className="important-badge">
                <span>🔥 Key Insight</span>
              </div>
            )}
            
            <div className="tooltip-header">
              <span className="node-type">{hoveredNode.type}</span>
              <h4 className="node-name">{hoveredNode.name || hoveredNode.title}</h4>
            </div>

            <div className="tooltip-body">
              <p className="node-summary">
                {hoveredNode.summary || hoveredNode.description || "Discover connected thoughts and related entities in this cluster."}
              </p>
            </div>

            <div className="tooltip-footer">
              <div className="connection-count">
                <span className="count">{hoveredNode.degree || 0}</span>
                <span className="label">Connections</span>
              </div>
              {hoveredNode.date && <span className="date">{hoveredNode.date}</span>}
              {hoveredNode.source && <span className="source">{hoveredNode.source}</span>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// 🚀 Memoized Export: Prevent unnecessary D3 re-initialization
export default React.memo(KnowledgeGraph, (prev, next) => {
  // Only re-render if data or selected/highlighted context changes
  return (
    prev.data === next.data &&
    prev.initialSelectedId === next.initialSelectedId
  );
});
