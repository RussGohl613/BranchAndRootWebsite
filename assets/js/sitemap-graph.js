/* ==========================================================================
   Branch and Root Consulting — Sitemap Graph Interactions
   Handles hover/focus highlighting, cluster toggles, and tooltip.
   Precomputed radial SVG; this file only wires up behaviour.
   ========================================================================== */

(function () {
  'use strict';

  const svg = document.getElementById('site-graph');
  if (!svg) return;                        // not on this page, or mobile hidden

  // --- Adjacency map from edge data-attrs --------------------------------
  const adjMap = {};   // id -> Set of connected ids (bidirectional)
  svg.querySelectorAll('.sg-edge').forEach((line) => {
    const a = line.dataset.from;
    const b = line.dataset.to;
    if (!a || !b) return;
    if (!adjMap[a]) adjMap[a] = new Set();
    if (!adjMap[b]) adjMap[b] = new Set();
    adjMap[a].add(b);
    adjMap[b].add(a);
  });

  const nodesLayer = svg.querySelector('.sg-nodes');
  const allNodeEls = Array.from(svg.querySelectorAll('.sg-node'));
  const allEdgeEls = Array.from(svg.querySelectorAll('.sg-edge'));

  // --- Tooltip -----------------------------------------------------------
  const tooltip = document.createElement('div');
  tooltip.className = 'sg-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(tooltip);

  let tooltipVisible = false;
  let mouseX = 0, mouseY = 0;

  function showTooltip(text, x, y) {
    tooltip.textContent = text;
    tooltip.setAttribute('aria-hidden', 'false');
    positionTooltip(x, y);
    tooltipVisible = true;
    tooltip.classList.add('sg-tooltip--visible');
  }

  function hideTooltip() {
    tooltipVisible = false;
    tooltip.classList.remove('sg-tooltip--visible');
    tooltip.setAttribute('aria-hidden', 'true');
  }

  function positionTooltip(x, y) {
    const margin = 12;
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    let lx = x + margin;
    let ly = y - th / 2;
    if (lx + tw > window.innerWidth - 8) lx = x - tw - margin;
    if (ly < 8) ly = 8;
    if (ly + th > window.innerHeight - 8) ly = window.innerHeight - th - 8;
    tooltip.style.left = lx + 'px';
    tooltip.style.top  = ly + 'px';
  }

  svg.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (tooltipVisible) positionTooltip(mouseX, mouseY);
  });

  // --- Hover / focus highlight -------------------------------------------
  function activateNode(nodeEl) {
    const id = nodeEl.dataset.id;
    const neighbors = adjMap[id] || new Set();

    nodesLayer && nodesLayer.classList.add('sg-has-active');

    allNodeEls.forEach((el) => {
      el.classList.remove('sg-active', 'sg-neighbor', 'sg-dim');
      if (el === nodeEl) {
        el.classList.add('sg-active');
      } else if (neighbors.has(el.dataset.id)) {
        el.classList.add('sg-neighbor');
      } else {
        el.classList.add('sg-dim');
      }
    });

    allEdgeEls.forEach((line) => {
      line.classList.remove('sg-related', 'sg-edge-dim');
      if (line.dataset.from === id || line.dataset.to === id) {
        line.classList.add('sg-related');
      } else {
        line.classList.add('sg-edge-dim');
      }
    });
  }

  function clearHighlight() {
    nodesLayer && nodesLayer.classList.remove('sg-has-active');
    allNodeEls.forEach((el) => el.classList.remove('sg-active', 'sg-neighbor', 'sg-dim'));
    allEdgeEls.forEach((line) => line.classList.remove('sg-related', 'sg-edge-dim'));
    hideTooltip();
  }

  allNodeEls.forEach((nodeEl) => {
    // Tooltip text
    const titleEl = nodeEl.querySelector('title');
    const labelEl = nodeEl.querySelector('text.sg-label');
    const tipText = (titleEl && titleEl.textContent)
      || (labelEl && labelEl.textContent)
      || nodeEl.dataset.id;

    nodeEl.addEventListener('mouseenter', (e) => {
      activateNode(nodeEl);
      showTooltip(tipText, e.clientX, e.clientY);
    });
    nodeEl.addEventListener('mouseleave', () => {
      clearHighlight();
    });
    nodeEl.addEventListener('focusin', () => {
      activateNode(nodeEl);
    });
    nodeEl.addEventListener('focusout', (e) => {
      // Only clear if focus leaves this node entirely
      if (!nodeEl.contains(e.relatedTarget)) clearHighlight();
    });
  });

  // --- Category cluster toggle -------------------------------------------
  const clusters = {};  // cat-id -> { btn, postEls }
  const hiddenPosts = new Set();
  const xlinkEdges = allEdgeEls.filter((e) => e.classList.contains('sg-edge--xlink'));

  // Related-article curves disappear when either endpoint's cluster is closed
  function refreshXlinks() {
    xlinkEdges.forEach((e) => {
      const hidden = hiddenPosts.has(e.dataset.from) || hiddenPosts.has(e.dataset.to);
      e.classList.toggle('sg-cluster-hidden', hidden);
    });
  }

  svg.querySelectorAll('.sg-node--cat').forEach((catEl) => {
    const catId = catEl.dataset.id;
    const postEls = allNodeEls.filter((n) => n.dataset.parent === catId);
    const postEdgeEls = allEdgeEls.filter((e) => e.dataset.from === catId);
    const btn = catEl.querySelector('[role="button"]');
    if (!btn) return;

    clusters[catId] = { btn, postEls, postEdgeEls, open: true };

    function setOpen(open) {
      clusters[catId].open = open;
      btn.setAttribute('aria-expanded', String(open));
      postEls.forEach((p) => {
        p.classList.toggle('sg-cluster-hidden', !open);
        if (open) hiddenPosts.delete(p.dataset.id);
        else hiddenPosts.add(p.dataset.id);
      });
      postEdgeEls.forEach((e) => {
        e.classList.toggle('sg-cluster-hidden', !open);
      });
      refreshXlinks();
    }

    // Start open
    setOpen(true);

    const toggle = () => setOpen(!clusters[catId].open);

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle();
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        toggle();
      }
    });
  });

  // --- Dismiss tooltip on SVG mouseleave ---------------------------------
  svg.addEventListener('mouseleave', () => {
    clearHighlight();
  });

  // --- prefers-reduced-motion: disable scale transitions -----------------
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    svg.classList.add('sg-no-motion');
  }

  // --- Keyboard: Escape clears highlight ---------------------------------
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') clearHighlight();
  });

})();
