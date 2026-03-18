import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './KnowledgeGraph.css';

const KnowledgeGraph = ({ data, initialSelectedId }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const simulationRef = useRef();
  const nodesGroupRef = useRef();
  const linksGroupRef = useRef();
  
  const [hoveredNode, setHoveredNode] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState(null);
  const zoomRef = useRef();

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

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('class', 'main-group');
    
    // Zoom behavior
    const zoom = d3.zoom()
      .extent([[0, 0], [width, height]])
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    svg.on('click', (event) => {
      if (event.target.tagName === 'svg') {
        setSelectedNode(null);
      }
    });

    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.links).id(d => d.id).distance(d => {
        if (d.type === 'Semantic') return 200;
        if (d.type === 'Hard') return 120;
        return 90;
      }).strength(0.5))
      .force('charge', d3.forceManyBody().strength(d => d.type === 'Topic' ? -600 : -350))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => {
        const base = d.type === 'Topic' ? 28 : 18;
        const degreeImpact = Math.min((d.degree || 0) * 2, 20);
        // Add extra padding for potential labels to prevent cluster overlap
        return base + degreeImpact + 30; 
      }).strength(0.7));

    simulationRef.current = simulation;

    linksGroupRef.current = g.append('g')
      .attr('class', 'links-group')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('class', d => `link ${d.type?.toLowerCase() || 'hard'}`);

    nodesGroupRef.current = g.append('g')
      .attr('class', 'nodes-group')
      .selectAll('g')
      .data(data.nodes)
      .join('g')
      .attr('class', d => `node ${d.type.toLowerCase()}`)
      .call(drag(simulation));

    nodesGroupRef.current.append('circle')
      .attr('r', d => {
        const base = d.type === 'Topic' ? 12 : d.type === 'Item' ? 8 : 5;
        return base + Math.min((d.degree || 0) * 0.4, 8);
      });

    nodesGroupRef.current.insert('circle', ':first-child')
      .attr('class', 'node-halo')
      .attr('r', d => {
        const base = d.type === 'Topic' ? 18 : d.type === 'Item' ? 14 : 10;
        return base + Math.min((d.degree || 0) * 0.4, 8) + 4;
      });

    // 🏷️ Smart Labels
    const labels = nodesGroupRef.current.append('text')
      .attr('class', 'node-label')
      .attr('dy', d => d.type === 'Topic' ? -22 : -18)
      .attr('text-anchor', 'middle')
      .text(d => d.title || d.name);

    // Initial label visibility
    labels.attr('opacity', d => {
      if (d.type === 'Topic') return 1;
      if (d.degree > 4) return 0.8; // Important items
      return 0; // Hide others by default
    });

    nodesGroupRef.current.on('mouseenter', (event, d) => {
      setHoveredNode(d);
      updateTooltipPos(event);
      d3.select(event.currentTarget).classed('hovered', true);
      // Show label on hover
      d3.select(event.currentTarget).select('.node-label').transition().duration(200).attr('opacity', 1);
    })
    .on('mousemove', (event) => {
      updateTooltipPos(event);
    })
    .on('mouseleave', (event, d) => {
      setHoveredNode(null);
      d3.select(event.currentTarget).classed('hovered', false);
      // Revert label visibility
      if (d.type !== 'Topic' && d.degree <= 4 && (!selectedNode || selectedNode.id !== d.id)) {
        d3.select(event.currentTarget).select('.node-label').transition().duration(200).attr('opacity', 0);
      }
    })
    .on('click', (event, d) => {
      event.stopPropagation();
      setSelectedNode(prev => prev?.id === d.id ? null : d);
    });

    simulation.on('tick', () => {
      linksGroupRef.current
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      nodesGroupRef.current
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function updateTooltipPos(event) {
      setTooltipPos({ x: event.clientX + 15, y: event.clientY + 15 });
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

    if (!selectedNode) {
      node.classed('dimmed', false).classed('highlighted', false).classed('selected', false);
      link.classed('dimmed', false).classed('highlighted', false);
      return;
    }

    // Highlighting Logic
    const connectedNodeIds = new Set();
    connectedNodeIds.add(selectedNode.id);
    
    data.links.forEach(l => {
      const sourceId = l.source.id || l.source;
      const targetId = l.target.id || l.target;
      if (sourceId === selectedNode.id) connectedNodeIds.add(targetId);
      if (targetId === selectedNode.id) connectedNodeIds.add(sourceId);
    });

    node.classed('highlighted', d => connectedNodeIds.has(d.id))
        .classed('dimmed', d => !connectedNodeIds.has(d.id))
        .classed('selected', d => d.id === selectedNode.id);

    link.classed('highlighted', l => {
      const sourceId = l.source.id || l.source;
      const targetId = l.target.id || l.target;
      return sourceId === selectedNode.id || targetId === selectedNode.id;
    })
    .classed('dimmed', l => {
      const sourceId = l.source.id || l.source;
      const targetId = l.target.id || l.target;
      return sourceId !== selectedNode.id && targetId !== selectedNode.id;
    });

    // ✨ Focus & Zoom Logic
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    // Find the current coordinates of the selected node
    const targetNode = data.nodes.find(n => n.id === selectedNode.id);
    if (targetNode && targetNode.x !== undefined) {
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(1.5) // Focus scale
        .translate(-targetNode.x, -targetNode.y);

      svg.transition()
        .duration(1000)
        .ease(d3.easeCubicInOut)
        .call(zoom.transform, transform);
    }

  }, [selectedNode, data]);

  return (
    <div className="knowledge-graph-container" ref={containerRef}>
      <svg ref={svgRef}></svg>
      
      {hoveredNode && (
        <div 
          className="graph-tooltip glass"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="tooltip-header">
            <span className={`type-badge ${hoveredNode.type.toLowerCase()}`}>
              {hoveredNode.type}
            </span>
            <h4>{hoveredNode.title || hoveredNode.name}</h4>
          </div>
          {hoveredNode.summary && <p className="tooltip-summary">{hoveredNode.summary}</p>}
          <div className="tooltip-footer">
             {hoveredNode.date && <span>{hoveredNode.date}</span>}
             {hoveredNode.source && <span>• {hoveredNode.source}</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default KnowledgeGraph;
