import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const TOOL_TYPES = {
  SELECT: 'select',
  PEN: 'pen',
  RECTANGLE: 'rectangle',
  ELLIPSE: 'ellipse',
  LINE: 'line',
  ARROW: 'arrow',
  TEXT: 'text',
  ERASER: 'eraser',
};

const COLORS = [
  '#000000', '#dc2626', '#f97316', '#eab308', '#22c55e',
  '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280', '#ffffff',
];

const STROKE_WIDTHS = [1, 2, 4, 6, 8, 12];

const FONT_SIZES = [12, 16, 20, 24, 32, 48];

const GRID_SIZE = 20;

const INITIAL_LAYERS = [
  { id: 'layer-1', name: 'Background', visible: true, locked: false, opacity: 100 },
  { id: 'layer-2', name: 'Main', visible: true, locked: false, opacity: 100 },
  { id: 'layer-3', name: 'Annotations', visible: true, locked: false, opacity: 100 },
];

const MOCK_USERS = [
  { id: 'u1', name: 'You', color: '#3b82f6', cursor: { x: 0, y: 0 }, active: true },
  { id: 'u2', name: 'Alice', color: '#ec4899', cursor: { x: 200, y: 150 }, active: true },
  { id: 'u3', name: 'Bob', color: '#22c55e', cursor: { x: 400, y: 300 }, active: false },
  { id: 'u4', name: 'Carol', color: '#f97316', cursor: { x: 100, y: 400 }, active: true },
];

const INITIAL_SHAPES = [
  { id: 's1', type: 'rectangle', x: 50, y: 50, width: 200, height: 120, fill: '#3b82f6', stroke: '#1e40af', strokeWidth: 2, rotation: 0, layerId: 'layer-1', locked: false, opacity: 80, label: 'Header Box' },
  { id: 's2', type: 'ellipse', x: 350, y: 80, width: 150, height: 150, fill: '#22c55e', stroke: '#166534', strokeWidth: 2, rotation: 0, layerId: 'layer-2', locked: false, opacity: 100, label: 'Status Circle' },
  { id: 's3', type: 'rectangle', x: 100, y: 250, width: 300, height: 80, fill: '#f97316', stroke: '#c2410c', strokeWidth: 2, rotation: 0, layerId: 'layer-2', locked: false, opacity: 90, label: 'Content Block' },
  { id: 's4', type: 'line', x: 50, y: 200, width: 450, height: 0, fill: 'transparent', stroke: '#6b7280', strokeWidth: 3, rotation: 0, layerId: 'layer-1', locked: false, opacity: 100, label: 'Divider' },
  { id: 's5', type: 'arrow', x: 425, y: 155, width: 100, height: 130, fill: 'transparent', stroke: '#dc2626', strokeWidth: 2, rotation: 0, layerId: 'layer-2', locked: false, opacity: 100, label: 'Connection Arrow' },
  { id: 's6', type: 'text', x: 80, y: 90, width: 160, height: 40, fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, rotation: 0, layerId: 'layer-3', locked: false, opacity: 100, label: 'Title Text', text: 'Whiteboard Title', fontSize: 24, fontWeight: 'bold' },
  { id: 's7', type: 'text', x: 120, y: 270, width: 260, height: 30, fill: '#000000', stroke: 'transparent', strokeWidth: 0, rotation: 0, layerId: 'layer-3', locked: false, opacity: 100, label: 'Description Text', text: 'This is a collaborative whiteboard', fontSize: 16, fontWeight: 'normal' },
  { id: 's8', type: 'pen', x: 0, y: 0, width: 0, height: 0, fill: 'transparent', stroke: '#8b5cf6', strokeWidth: 3, rotation: 0, layerId: 'layer-2', locked: false, opacity: 100, label: 'Freehand Drawing', points: [{ x: 200, y: 400 }, { x: 210, y: 395 }, { x: 225, y: 390 }, { x: 245, y: 388 }, { x: 270, y: 392 }, { x: 290, y: 400 }, { x: 305, y: 412 }, { x: 310, y: 425 }] },
];

let nextShapeId = 9;
function generateShapeId() {
  return `s${nextShapeId++}`;
}

export default function CollaborativeWhiteboard() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [shapes, setShapes] = useState(INITIAL_SHAPES);
  const [layers, setLayers] = useState(INITIAL_LAYERS);
  const [activeLayerId, setActiveLayerId] = useState('layer-2');
  const [selectedShapeIds, setSelectedShapeIds] = useState([]);
  const [activeTool, setActiveTool] = useState(TOOL_TYPES.SELECT);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#3b82f6');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(16);
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState(null);
  const [currentPenPoints, setCurrentPenPoints] = useState([]);
  const [textEditId, setTextEditId] = useState(null);
  const [textEditValue, setTextEditValue] = useState('');
  const [users] = useState(MOCK_USERS);
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [showPropertyPanel, setShowPropertyPanel] = useState(true);
  const [contextMenu, setContextMenu] = useState(null);
  const [clipboard, setClipboard] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('whiteboardDarkMode') === 'true';
    }
    return false;
  });
  const [sidebarView, setSidebarView] = useState('tools');
  const [searchQuery, setSearchQuery] = useState('');
  const [shapeFilter, setShapeFilter] = useState('all');

  useEffect(() => {
    localStorage.setItem('whiteboardDarkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('whiteboardShapes', JSON.stringify(shapes));
  }, [shapes]);

  useEffect(() => {
    localStorage.setItem('whiteboardLayers', JSON.stringify(layers));
  }, [layers]);

  const pushUndo = useCallback((prevShapes) => {
    setUndoStack((prev) => [...prev.slice(-49), prevShapes]);
    setRedoStack([]);
  }, []);

  const handleUndo = useCallback(() => {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setRedoStack((r) => [...r, shapes]);
    setShapes(prev);
    setUndoStack((u) => u.slice(0, -1));
    setSelectedShapeIds([]);
  }, [undoStack, shapes]);

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((u) => [...u, shapes]);
    setShapes(next);
    setRedoStack((r) => r.slice(0, -1));
    setSelectedShapeIds([]);
  }, [redoStack, shapes]);

  const snapPoint = useCallback((x, y) => {
    if (!snapToGrid) return { x, y };
    return {
      x: Math.round(x / GRID_SIZE) * GRID_SIZE,
      y: Math.round(y / GRID_SIZE) * GRID_SIZE,
    };
  }, [snapToGrid]);

  const getCanvasCoords = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    const scale = zoom / 100;
    const x = (e.clientX - rect.left - panOffset.x) / scale;
    const y = (e.clientY - rect.top - panOffset.y) / scale;
    return snapPoint(x, y);
  }, [zoom, panOffset, snapPoint]);

  const hitTestShape = useCallback((shape, x, y) => {
    if (shape.type === 'pen' && shape.points) {
      return shape.points.some((p) => Math.abs(p.x - x) < 10 && Math.abs(p.y - y) < 10);
    }
    if (shape.type === 'ellipse') {
      const cx = shape.x + shape.width / 2;
      const cy = shape.y + shape.height / 2;
      const rx = shape.width / 2;
      const ry = shape.height / 2;
      return ((x - cx) ** 2) / (rx ** 2) + ((y - cy) ** 2) / (ry ** 2) <= 1;
    }
    return x >= shape.x && x <= shape.x + shape.width && y >= shape.y && y <= shape.y + shape.height;
  }, []);

  const findShapeAtPoint = useCallback((x, y) => {
    const visibleLayerIds = layers.filter((l) => l.visible).map((l) => l.id);
    for (let i = shapes.length - 1; i >= 0; i--) {
      const shape = shapes[i];
      if (!visibleLayerIds.includes(shape.layerId)) continue;
      const layer = layers.find((l) => l.id === shape.layerId);
      if (layer?.locked) continue;
      if (hitTestShape(shape, x, y)) return shape;
    }
    return null;
  }, [shapes, layers, hitTestShape]);

  const handleCanvasMouseDown = useCallback((e) => {
    if (e.button === 2) return;
    const coords = getCanvasCoords(e);
    setContextMenu(null);

    if (activeTool === TOOL_TYPES.SELECT) {
      const shape = findShapeAtPoint(coords.x, coords.y);
      if (shape) {
        if (e.shiftKey) {
          setSelectedShapeIds((prev) =>
            prev.includes(shape.id) ? prev.filter((id) => id !== shape.id) : [...prev, shape.id]
          );
        } else {
          setSelectedShapeIds([shape.id]);
        }
        setDrawStart({ x: coords.x, y: coords.y, shapeX: shape.x, shapeY: shape.y, moving: true, shapeId: shape.id });
      } else {
        setSelectedShapeIds([]);
        setDrawStart({ x: coords.x, y: coords.y, selecting: true });
      }
      setIsDrawing(true);
    } else if (activeTool === TOOL_TYPES.PEN) {
      setIsDrawing(true);
      setCurrentPenPoints([{ x: coords.x, y: coords.y }]);
    } else if (activeTool === TOOL_TYPES.ERASER) {
      const shape = findShapeAtPoint(coords.x, coords.y);
      if (shape) {
        pushUndo(shapes);
        setShapes((prev) => prev.filter((s) => s.id !== shape.id));
      }
    } else if (activeTool === TOOL_TYPES.TEXT) {
      const newShape = {
        id: generateShapeId(),
        type: 'text',
        x: coords.x,
        y: coords.y,
        width: 200,
        height: 30,
        fill: strokeColor,
        stroke: 'transparent',
        strokeWidth: 0,
        rotation: 0,
        layerId: activeLayerId,
        locked: false,
        opacity: 100,
        label: 'New Text',
        text: '',
        fontSize: fontSize,
        fontWeight: 'normal',
      };
      pushUndo(shapes);
      setShapes((prev) => [...prev, newShape]);
      setTextEditId(newShape.id);
      setTextEditValue('');
      setSelectedShapeIds([newShape.id]);
    } else {
      setIsDrawing(true);
      setDrawStart({ x: coords.x, y: coords.y });
    }
  }, [activeTool, getCanvasCoords, findShapeAtPoint, shapes, pushUndo, strokeColor, activeLayerId, fontSize]);

  const handleCanvasMouseMove = useCallback((e) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);

    if (activeTool === TOOL_TYPES.PEN) {
      setCurrentPenPoints((prev) => [...prev, { x: coords.x, y: coords.y }]);
    } else if (activeTool === TOOL_TYPES.SELECT && drawStart?.moving) {
      const dx = coords.x - drawStart.x;
      const dy = coords.y - drawStart.y;
      setShapes((prev) =>
        prev.map((s) => {
          if (selectedShapeIds.includes(s.id)) {
            if (s.type === 'pen' && s.points) {
              return { ...s, points: s.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
            }
            return { ...s, x: s.x + dx, y: s.y + dy };
          }
          return s;
        })
      );
      setDrawStart({ ...drawStart, x: coords.x, y: coords.y });
    }
  }, [isDrawing, activeTool, getCanvasCoords, drawStart, selectedShapeIds]);

  const handleCanvasMouseUp = useCallback((e) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);

    if (activeTool === TOOL_TYPES.PEN && currentPenPoints.length > 1) {
      pushUndo(shapes);
      const newShape = {
        id: generateShapeId(),
        type: 'pen',
        x: 0, y: 0, width: 0, height: 0,
        fill: 'transparent',
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        rotation: 0,
        layerId: activeLayerId,
        locked: false,
        opacity: 100,
        label: 'Freehand Drawing',
        points: currentPenPoints,
      };
      setShapes((prev) => [...prev, newShape]);
      setCurrentPenPoints([]);
    } else if (activeTool === TOOL_TYPES.SELECT && drawStart?.moving) {
      pushUndo(shapes);
    } else if (drawStart && !drawStart.moving && !drawStart.selecting &&
      [TOOL_TYPES.RECTANGLE, TOOL_TYPES.ELLIPSE, TOOL_TYPES.LINE, TOOL_TYPES.ARROW].includes(activeTool)) {
      const x = Math.min(drawStart.x, coords.x);
      const y = Math.min(drawStart.y, coords.y);
      const width = Math.abs(coords.x - drawStart.x);
      const height = Math.abs(coords.y - drawStart.y);
      if (width > 5 || height > 5) {
        pushUndo(shapes);
        const newShape = {
          id: generateShapeId(),
          type: activeTool,
          x, y, width, height,
          fill: activeTool === TOOL_TYPES.LINE || activeTool === TOOL_TYPES.ARROW ? 'transparent' : fillColor,
          stroke: strokeColor,
          strokeWidth: strokeWidth,
          rotation: 0,
          layerId: activeLayerId,
          locked: false,
          opacity: 100,
          label: `New ${activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}`,
        };
        setShapes((prev) => [...prev, newShape]);
        setSelectedShapeIds([newShape.id]);
      }
    }

    setIsDrawing(false);
    setDrawStart(null);
  }, [isDrawing, activeTool, getCanvasCoords, currentPenPoints, shapes, pushUndo, strokeColor, fillColor, strokeWidth, activeLayerId, drawStart]);

  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const shape = findShapeAtPoint(coords.x, coords.y);
    if (shape) {
      setSelectedShapeIds([shape.id]);
    }
    setContextMenu({ x: e.clientX, y: e.clientY, shapeId: shape?.id || null });
  }, [getCanvasCoords, findShapeAtPoint]);

  const handleCopy = useCallback(() => {
    const selected = shapes.filter((s) => selectedShapeIds.includes(s.id));
    setClipboard(selected.map((s) => ({ ...s })));
    setContextMenu(null);
  }, [shapes, selectedShapeIds]);

  const handlePaste = useCallback(() => {
    if (clipboard.length === 0) return;
    pushUndo(shapes);
    const newShapes = clipboard.map((s) => ({
      ...s,
      id: generateShapeId(),
      x: s.x + 20,
      y: s.y + 20,
      layerId: activeLayerId,
    }));
    setShapes((prev) => [...prev, ...newShapes]);
    setSelectedShapeIds(newShapes.map((s) => s.id));
    setContextMenu(null);
  }, [clipboard, shapes, pushUndo, activeLayerId]);

  const handleDelete = useCallback(() => {
    if (selectedShapeIds.length === 0) return;
    pushUndo(shapes);
    setShapes((prev) => prev.filter((s) => !selectedShapeIds.includes(s.id)));
    setSelectedShapeIds([]);
    setContextMenu(null);
  }, [selectedShapeIds, shapes, pushUndo]);

  const handleDuplicate = useCallback(() => {
    const selected = shapes.filter((s) => selectedShapeIds.includes(s.id));
    if (selected.length === 0) return;
    pushUndo(shapes);
    const dupes = selected.map((s) => ({ ...s, id: generateShapeId(), x: s.x + 20, y: s.y + 20, label: `${s.label} (copy)` }));
    setShapes((prev) => [...prev, ...dupes]);
    setSelectedShapeIds(dupes.map((d) => d.id));
    setContextMenu(null);
  }, [shapes, selectedShapeIds, pushUndo]);

  const handleBringToFront = useCallback(() => {
    if (selectedShapeIds.length === 0) return;
    pushUndo(shapes);
    const selected = shapes.filter((s) => selectedShapeIds.includes(s.id));
    const rest = shapes.filter((s) => !selectedShapeIds.includes(s.id));
    setShapes([...rest, ...selected]);
    setContextMenu(null);
  }, [shapes, selectedShapeIds, pushUndo]);

  const handleSendToBack = useCallback(() => {
    if (selectedShapeIds.length === 0) return;
    pushUndo(shapes);
    const selected = shapes.filter((s) => selectedShapeIds.includes(s.id));
    const rest = shapes.filter((s) => !selectedShapeIds.includes(s.id));
    setShapes([...selected, ...rest]);
    setContextMenu(null);
  }, [shapes, selectedShapeIds, pushUndo]);

  const handleLockShape = useCallback(() => {
    if (selectedShapeIds.length === 0) return;
    pushUndo(shapes);
    setShapes((prev) => prev.map((s) => selectedShapeIds.includes(s.id) ? { ...s, locked: !s.locked } : s));
    setContextMenu(null);
  }, [selectedShapeIds, shapes, pushUndo]);

  const handleUpdateShape = useCallback((shapeId, updates) => {
    pushUndo(shapes);
    setShapes((prev) => prev.map((s) => s.id === shapeId ? { ...s, ...updates } : s));
  }, [shapes, pushUndo]);

  const handleTextEditSubmit = useCallback(() => {
    if (textEditId) {
      if (textEditValue.trim() === '') {
        setShapes((prev) => prev.filter((s) => s.id !== textEditId));
      } else {
        setShapes((prev) => prev.map((s) => s.id === textEditId ? { ...s, text: textEditValue, label: textEditValue.substring(0, 20) } : s));
      }
      setTextEditId(null);
      setTextEditValue('');
    }
  }, [textEditId, textEditValue]);

  // Layer management
  const handleAddLayer = useCallback(() => {
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length + 1}`,
      visible: true,
      locked: false,
      opacity: 100,
    };
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
  }, [layers]);

  const handleDeleteLayer = useCallback((layerId) => {
    if (layers.length <= 1) return;
    setLayers((prev) => prev.filter((l) => l.id !== layerId));
    pushUndo(shapes);
    setShapes((prev) => prev.filter((s) => s.layerId !== layerId));
    if (activeLayerId === layerId) {
      setActiveLayerId(layers.find((l) => l.id !== layerId)?.id || layers[0].id);
    }
  }, [layers, activeLayerId, shapes, pushUndo]);

  const handleRenameLayer = useCallback((layerId, newName) => {
    setLayers((prev) => prev.map((l) => l.id === layerId ? { ...l, name: newName } : l));
  }, []);

  const handleToggleLayerVisibility = useCallback((layerId) => {
    setLayers((prev) => prev.map((l) => l.id === layerId ? { ...l, visible: !l.visible } : l));
  }, []);

  const handleToggleLayerLock = useCallback((layerId) => {
    setLayers((prev) => prev.map((l) => l.id === layerId ? { ...l, locked: !l.locked } : l));
  }, []);

  const handleLayerOpacity = useCallback((layerId, opacity) => {
    setLayers((prev) => prev.map((l) => l.id === layerId ? { ...l, opacity } : l));
  }, []);

  const handleMoveLayerUp = useCallback((layerId) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === layerId);
      if (idx >= prev.length - 1) return prev;
      const newLayers = [...prev];
      [newLayers[idx], newLayers[idx + 1]] = [newLayers[idx + 1], newLayers[idx]];
      return newLayers;
    });
  }, []);

  const handleMoveLayerDown = useCallback((layerId) => {
    setLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === layerId);
      if (idx <= 0) return prev;
      const newLayers = [...prev];
      [newLayers[idx], newLayers[idx - 1]] = [newLayers[idx - 1], newLayers[idx]];
      return newLayers;
    });
  }, []);

  // Zoom and pan
  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 10, 300)), []);
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 10, 10)), []);
  const handleZoomReset = useCallback(() => { setZoom(100); setPanOffset({ x: 0, y: 0 }); }, []);

  const handleWheel = useCallback((e) => {
    if (e.ctrlKey) {
      e.preventDefault();
      setZoom((z) => Math.max(10, Math.min(300, z - e.deltaY * 0.5)));
    } else {
      setPanOffset((prev) => ({ x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
    }
  }, []);

  // Export
  const handleExportJSON = useCallback(() => {
    const data = { shapes, layers, zoom, panOffset };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whiteboard.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [shapes, layers, zoom, panOffset]);

  const handleExportSVG = useCallback(() => {
    let svg = '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">';
    shapes.forEach((shape) => {
      const layer = layers.find((l) => l.id === shape.layerId);
      if (!layer?.visible) return;
      const opacity = (shape.opacity / 100) * (layer.opacity / 100);
      if (shape.type === 'rectangle') {
        svg += `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" fill="${shape.fill}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" opacity="${opacity}" />`;
      } else if (shape.type === 'ellipse') {
        svg += `<ellipse cx="${shape.x + shape.width / 2}" cy="${shape.y + shape.height / 2}" rx="${shape.width / 2}" ry="${shape.height / 2}" fill="${shape.fill}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" opacity="${opacity}" />`;
      } else if (shape.type === 'line') {
        svg += `<line x1="${shape.x}" y1="${shape.y}" x2="${shape.x + shape.width}" y2="${shape.y + shape.height}" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" opacity="${opacity}" />`;
      } else if (shape.type === 'text') {
        svg += `<text x="${shape.x}" y="${shape.y + shape.fontSize}" fill="${shape.fill}" font-size="${shape.fontSize}" opacity="${opacity}">${shape.text || ''}</text>`;
      } else if (shape.type === 'pen' && shape.points) {
        const d = shape.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
        svg += `<path d="${d}" fill="none" stroke="${shape.stroke}" stroke-width="${shape.strokeWidth}" opacity="${opacity}" />`;
      }
    });
    svg += '</svg>';
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'whiteboard.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, [shapes, layers]);

  const handleClearCanvas = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all shapes?')) {
      pushUndo(shapes);
      setShapes([]);
      setSelectedShapeIds([]);
    }
  }, [shapes, pushUndo]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (textEditId) return;
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); handleUndo(); }
      else if (isCtrl && e.key === 'z' && e.shiftKey) { e.preventDefault(); handleRedo(); }
      else if (isCtrl && e.key === 'y') { e.preventDefault(); handleRedo(); }
      else if (isCtrl && e.key === 'c') { e.preventDefault(); handleCopy(); }
      else if (isCtrl && e.key === 'v') { e.preventDefault(); handlePaste(); }
      else if (isCtrl && e.key === 'd') { e.preventDefault(); handleDuplicate(); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { handleDelete(); }
      else if (e.key === 'v' || e.key === 'V') { setActiveTool(TOOL_TYPES.SELECT); }
      else if (e.key === 'p' || e.key === 'P') { setActiveTool(TOOL_TYPES.PEN); }
      else if (e.key === 'r' || e.key === 'R') { setActiveTool(TOOL_TYPES.RECTANGLE); }
      else if (e.key === 'o' || e.key === 'O') { setActiveTool(TOOL_TYPES.ELLIPSE); }
      else if (e.key === 'l' || e.key === 'L') { setActiveTool(TOOL_TYPES.LINE); }
      else if (e.key === 'a' || e.key === 'A') { setActiveTool(TOOL_TYPES.ARROW); }
      else if (e.key === 't' || e.key === 'T') { setActiveTool(TOOL_TYPES.TEXT); }
      else if (e.key === 'e' || e.key === 'E') { setActiveTool(TOOL_TYPES.ERASER); }
      else if (e.key === '=' && isCtrl) { e.preventDefault(); handleZoomIn(); }
      else if (e.key === '-' && isCtrl) { e.preventDefault(); handleZoomOut(); }
      else if (e.key === '0' && isCtrl) { e.preventDefault(); handleZoomReset(); }
      else if (e.key === 'g' || e.key === 'G') { setShowGrid((g) => !g); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [textEditId, handleUndo, handleRedo, handleCopy, handlePaste, handleDuplicate, handleDelete, handleZoomIn, handleZoomOut, handleZoomReset]);

  // Filter shapes
  const filteredShapes = useMemo(() => {
    let result = shapes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.label.toLowerCase().includes(q) || s.type.toLowerCase().includes(q));
    }
    if (shapeFilter !== 'all') {
      result = result.filter((s) => s.type === shapeFilter);
    }
    return result;
  }, [shapes, searchQuery, shapeFilter]);

  const selectedShape = selectedShapeIds.length === 1 ? shapes.find((s) => s.id === selectedShapeIds[0]) : null;
  const activeLayer = layers.find((l) => l.id === activeLayerId);
  const activeUsers = users.filter((u) => u.active);
  const shapeCount = shapes.length;
  const layerShapeCount = shapes.filter((s) => s.layerId === activeLayerId).length;

  const bgColor = darkMode ? '#1a1a2e' : '#f0f4f8';
  const textColor = darkMode ? '#e2e8f0' : '#1e293b';
  const panelBg = darkMode ? '#16213e' : '#ffffff';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const hoverBg = darkMode ? '#1e3a5f' : '#f1f5f9';
  const activeBg = darkMode ? '#2563eb' : '#dbeafe';
  const activeFg = darkMode ? '#ffffff' : '#1e40af';

  // Render shapes on canvas
  const renderShape = (shape) => {
    const layer = layers.find((l) => l.id === shape.layerId);
    if (!layer?.visible) return null;
    const isSelected = selectedShapeIds.includes(shape.id);
    const opacity = (shape.opacity / 100) * (layer.opacity / 100);
    const commonStyle = {
      position: 'absolute',
      opacity,
      outline: isSelected ? '2px solid #2563eb' : 'none',
      outlineOffset: '2px',
      cursor: activeTool === TOOL_TYPES.SELECT ? 'move' : 'crosshair',
      pointerEvents: layer.locked ? 'none' : 'auto',
    };

    if (shape.type === 'rectangle') {
      return (
        <div
          key={shape.id}
          data-testid={`shape-${shape.id}`}
          data-shape-type="rectangle"
          style={{
            ...commonStyle,
            left: shape.x, top: shape.y,
            width: shape.width, height: shape.height,
            backgroundColor: shape.fill,
            border: `${shape.strokeWidth}px solid ${shape.stroke}`,
            borderRadius: 4,
          }}
        />
      );
    }
    if (shape.type === 'ellipse') {
      return (
        <div
          key={shape.id}
          data-testid={`shape-${shape.id}`}
          data-shape-type="ellipse"
          style={{
            ...commonStyle,
            left: shape.x, top: shape.y,
            width: shape.width, height: shape.height,
            backgroundColor: shape.fill,
            border: `${shape.strokeWidth}px solid ${shape.stroke}`,
            borderRadius: '50%',
          }}
        />
      );
    }
    if (shape.type === 'line' || shape.type === 'arrow') {
      const len = Math.sqrt(shape.width ** 2 + shape.height ** 2);
      const angle = Math.atan2(shape.height, shape.width) * (180 / Math.PI);
      return (
        <div
          key={shape.id}
          data-testid={`shape-${shape.id}`}
          data-shape-type={shape.type}
          style={{
            ...commonStyle,
            left: shape.x, top: shape.y,
            width: len, height: 0,
            borderTop: `${shape.strokeWidth}px solid ${shape.stroke}`,
            transformOrigin: '0 0',
            transform: `rotate(${angle}deg)`,
          }}
        >
          {shape.type === 'arrow' && (
            <span style={{ position: 'absolute', right: -6, top: -6, fontSize: 12, color: shape.stroke }}>&#9654;</span>
          )}
        </div>
      );
    }
    if (shape.type === 'text') {
      const isEditing = textEditId === shape.id;
      return (
        <div
          key={shape.id}
          data-testid={`shape-${shape.id}`}
          data-shape-type="text"
          style={{
            ...commonStyle,
            left: shape.x, top: shape.y,
            minWidth: shape.width,
            color: shape.fill,
            fontSize: shape.fontSize || 16,
            fontWeight: shape.fontWeight || 'normal',
            whiteSpace: 'nowrap',
          }}
          onDoubleClick={() => {
            if (activeTool === TOOL_TYPES.SELECT) {
              setTextEditId(shape.id);
              setTextEditValue(shape.text || '');
            }
          }}
        >
          {isEditing ? (
            <input
              data-testid={`text-edit-input-${shape.id}`}
              autoFocus
              value={textEditValue}
              onChange={(e) => setTextEditValue(e.target.value)}
              onBlur={handleTextEditSubmit}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTextEditSubmit(); if (e.key === 'Escape') { setTextEditId(null); setTextEditValue(''); } }}
              style={{ fontSize: shape.fontSize || 16, fontWeight: shape.fontWeight || 'normal', border: '1px solid #2563eb', padding: '2px 4px', outline: 'none', background: 'transparent', color: 'inherit', width: '100%' }}
            />
          ) : (
            <span>{shape.text || '(empty)'}</span>
          )}
        </div>
      );
    }
    if (shape.type === 'pen' && shape.points) {
      const minX = Math.min(...shape.points.map((p) => p.x));
      const minY = Math.min(...shape.points.map((p) => p.y));
      const maxX = Math.max(...shape.points.map((p) => p.x));
      const maxY = Math.max(...shape.points.map((p) => p.y));
      return (
        <svg
          key={shape.id}
          data-testid={`shape-${shape.id}`}
          data-shape-type="pen"
          style={{
            position: 'absolute',
            left: minX - 5, top: minY - 5,
            width: maxX - minX + 10, height: maxY - minY + 10,
            opacity,
            overflow: 'visible',
            pointerEvents: layer.locked ? 'none' : 'auto',
            outline: isSelected ? '2px solid #2563eb' : 'none',
          }}
        >
          <polyline
            points={shape.points.map((p) => `${p.x - minX + 5},${p.y - minY + 5}`).join(' ')}
            fill="none"
            stroke={shape.stroke}
            strokeWidth={shape.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif', background: bgColor, color: textColor }} data-testid="whiteboard-app">
      {/* Sidebar */}
      <div style={{ width: 260, borderRight: `1px solid ${borderColor}`, background: panelBg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} data-testid="sidebar">
        {/* Header */}
        <div style={{ padding: '16px', borderBottom: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>WhiteBoard</h1>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Active users */}
            <div style={{ display: 'flex' }} data-testid="active-users">
              {activeUsers.map((user) => (
                <div key={user.id} data-testid={`user-avatar-${user.id}`} title={user.name} style={{ width: 28, height: 28, borderRadius: '50%', background: user.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 600, marginLeft: -4, border: `2px solid ${panelBg}`, cursor: 'pointer' }}>
                  {user.name.charAt(0)}
                </div>
              ))}
            </div>
            <button onClick={() => setDarkMode((d) => !d)} aria-label="Toggle theme" data-testid="theme-toggle" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: textColor }}>
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Sidebar navigation */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${borderColor}` }}>
          {['tools', 'layers', 'shapes'].map((view) => (
            <button
              key={view}
              data-testid={`sidebar-tab-${view}`}
              onClick={() => setSidebarView(view)}
              style={{
                flex: 1, padding: '8px 4px', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, textTransform: 'uppercase',
                background: sidebarView === view ? activeBg : 'transparent',
                color: sidebarView === view ? activeFg : textColor,
                borderBottom: sidebarView === view ? `2px solid ${activeFg}` : '2px solid transparent',
              }}
            >
              {view}
            </button>
          ))}
        </div>

        {/* Sidebar content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
          {sidebarView === 'tools' && (
            <div data-testid="tools-panel">
              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', opacity: 0.7 }}>Drawing Tools</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                  {Object.entries(TOOL_TYPES).map(([key, value]) => (
                    <button
                      key={key}
                      data-testid={`tool-${value}`}
                      onClick={() => setActiveTool(value)}
                      style={{
                        padding: '8px', border: `1px solid ${borderColor}`, borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                        background: activeTool === value ? activeBg : 'transparent',
                        color: activeTool === value ? activeFg : textColor,
                      }}
                    >
                      {key.charAt(0) + key.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', opacity: 0.7 }}>Stroke Color</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {COLORS.map((c) => (
                    <button
                      key={`stroke-${c}`}
                      data-testid={`stroke-color-${c}`}
                      onClick={() => setStrokeColor(c)}
                      style={{
                        width: 24, height: 24, borderRadius: 4, border: strokeColor === c ? '2px solid #2563eb' : `1px solid ${borderColor}`,
                        backgroundColor: c, cursor: 'pointer', padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', opacity: 0.7 }}>Fill Color</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {COLORS.map((c) => (
                    <button
                      key={`fill-${c}`}
                      data-testid={`fill-color-${c}`}
                      onClick={() => setFillColor(c)}
                      style={{
                        width: 24, height: 24, borderRadius: 4, border: fillColor === c ? '2px solid #2563eb' : `1px solid ${borderColor}`,
                        backgroundColor: c, cursor: 'pointer', padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', opacity: 0.7 }}>Stroke Width</h3>
                <div style={{ display: 'flex', gap: 4 }}>
                  {STROKE_WIDTHS.map((w) => (
                    <button
                      key={`sw-${w}`}
                      data-testid={`stroke-width-${w}`}
                      onClick={() => setStrokeWidth(w)}
                      style={{
                        padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 11,
                        background: strokeWidth === w ? activeBg : 'transparent',
                        color: strokeWidth === w ? activeFg : textColor,
                      }}
                    >
                      {w}px
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', opacity: 0.7 }}>Font Size</h3>
                <select
                  data-testid="font-size-select"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px', borderRadius: 4, border: `1px solid ${borderColor}`, background: panelBg, color: textColor }}
                >
                  {FONT_SIZES.map((fs) => (
                    <option key={fs} value={fs}>{fs}px</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <h3 style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', opacity: 0.7 }}>Canvas Options</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" data-testid="toggle-grid" checked={showGrid} onChange={() => setShowGrid((g) => !g)} />
                  Show Grid
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" data-testid="toggle-snap" checked={snapToGrid} onChange={() => setSnapToGrid((s) => !s)} />
                  Snap to Grid
                </label>
              </div>
            </div>
          )}

          {sidebarView === 'layers' && (
            <div data-testid="layers-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>Layers ({layers.length})</h3>
                <button data-testid="add-layer-btn" onClick={handleAddLayer} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 12, background: 'transparent', color: textColor }}>
                  + Add
                </button>
              </div>
              {[...layers].reverse().map((layer) => (
                <div
                  key={layer.id}
                  data-testid={`layer-item-${layer.id}`}
                  style={{
                    padding: '8px', marginBottom: 4, borderRadius: 6, cursor: 'pointer',
                    border: `1px solid ${activeLayerId === layer.id ? activeFg : borderColor}`,
                    background: activeLayerId === layer.id ? activeBg : 'transparent',
                  }}
                  onClick={() => setActiveLayerId(layer.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: activeLayerId === layer.id ? 600 : 400 }}>{layer.name}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button data-testid={`toggle-vis-${layer.id}`} onClick={(e) => { e.stopPropagation(); handleToggleLayerVisibility(layer.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: layer.visible ? 1 : 0.4 }} title={layer.visible ? 'Hide' : 'Show'}>
                        {layer.visible ? '👁️' : '👁️‍🗨️'}
                      </button>
                      <button data-testid={`toggle-lock-${layer.id}`} onClick={(e) => { e.stopPropagation(); handleToggleLayerLock(layer.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }} title={layer.locked ? 'Unlock' : 'Lock'}>
                        {layer.locked ? '🔒' : '🔓'}
                      </button>
                      <button data-testid={`move-layer-up-${layer.id}`} onClick={(e) => { e.stopPropagation(); handleMoveLayerUp(layer.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }} title="Move Up">
                        ▲
                      </button>
                      <button data-testid={`move-layer-down-${layer.id}`} onClick={(e) => { e.stopPropagation(); handleMoveLayerDown(layer.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }} title="Move Down">
                        ▼
                      </button>
                      {layers.length > 1 && (
                        <button data-testid={`delete-layer-${layer.id}`} onClick={(e) => { e.stopPropagation(); handleDeleteLayer(layer.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: '#dc2626' }} title="Delete Layer">
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, opacity: 0.6 }}>Opacity:</span>
                    <input
                      data-testid={`layer-opacity-${layer.id}`}
                      type="range"
                      min="0"
                      max="100"
                      value={layer.opacity}
                      onChange={(e) => handleLayerOpacity(layer.id, Number(e.target.value))}
                      onClick={(e) => e.stopPropagation()}
                      style={{ flex: 1, height: 4 }}
                    />
                    <span style={{ fontSize: 11, minWidth: 30 }}>{layer.opacity}%</span>
                  </div>
                  <div style={{ fontSize: 11, opacity: 0.5, marginTop: 2 }}>
                    {shapes.filter((s) => s.layerId === layer.id).length} shapes
                  </div>
                </div>
              ))}
            </div>
          )}

          {sidebarView === 'shapes' && (
            <div data-testid="shapes-panel">
              <div style={{ marginBottom: 12 }}>
                <input
                  data-testid="shape-search"
                  placeholder="Search shapes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '6px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, background: panelBg, color: textColor, fontSize: 13, boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <select
                  data-testid="shape-type-filter"
                  value={shapeFilter}
                  onChange={(e) => setShapeFilter(e.target.value)}
                  style={{ width: '100%', padding: '6px', border: `1px solid ${borderColor}`, borderRadius: 4, background: panelBg, color: textColor, fontSize: 13 }}
                >
                  <option value="all">All Types</option>
                  {Object.values(TOOL_TYPES).filter((t) => t !== 'select' && t !== 'eraser').map((t) => (
                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: 12, opacity: 0.6, marginBottom: 8 }}>{filteredShapes.length} of {shapes.length} shapes</div>
              {filteredShapes.map((shape) => {
                const layer = layers.find((l) => l.id === shape.layerId);
                return (
                  <div
                    key={shape.id}
                    data-testid={`shape-list-item-${shape.id}`}
                    onClick={() => setSelectedShapeIds([shape.id])}
                    style={{
                      padding: '8px', marginBottom: 4, borderRadius: 6, cursor: 'pointer',
                      border: `1px solid ${selectedShapeIds.includes(shape.id) ? activeFg : borderColor}`,
                      background: selectedShapeIds.includes(shape.id) ? activeBg : 'transparent',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{shape.label}</div>
                      <div style={{ fontSize: 11, opacity: 0.5 }}>{shape.type} &middot; {layer?.name || 'Unknown'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {shape.locked && <span title="Locked">🔒</span>}
                      <div style={{ width: 14, height: 14, borderRadius: 2, background: shape.fill !== 'transparent' ? shape.fill : shape.stroke, border: `1px solid ${borderColor}` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar footer stats */}
        <div style={{ padding: '12px', borderTop: `1px solid ${borderColor}`, fontSize: 11, opacity: 0.6 }} data-testid="sidebar-stats">
          <div>{shapeCount} shapes &middot; {layers.length} layers</div>
          <div>Active layer: {activeLayer?.name} ({layerShapeCount} shapes)</div>
          <div>{activeUsers.length} users online</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '8px 16px', borderBottom: `1px solid ${borderColor}`, background: panelBg, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }} data-testid="main-toolbar">
          <button data-testid="undo-btn" onClick={handleUndo} disabled={undoStack.length === 0} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor, opacity: undoStack.length === 0 ? 0.4 : 1 }} title="Undo (Ctrl+Z)">
            ↩ Undo
          </button>
          <button data-testid="redo-btn" onClick={handleRedo} disabled={redoStack.length === 0} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor, opacity: redoStack.length === 0 ? 0.4 : 1 }} title="Redo (Ctrl+Shift+Z)">
            ↪ Redo
          </button>
          <div style={{ width: 1, height: 20, background: borderColor }} />
          <button data-testid="copy-btn" onClick={handleCopy} disabled={selectedShapeIds.length === 0} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor }}>
            Copy
          </button>
          <button data-testid="paste-btn" onClick={handlePaste} disabled={clipboard.length === 0} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor }}>
            Paste
          </button>
          <button data-testid="duplicate-btn" onClick={handleDuplicate} disabled={selectedShapeIds.length === 0} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor }}>
            Duplicate
          </button>
          <button data-testid="delete-btn" onClick={handleDelete} disabled={selectedShapeIds.length === 0} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor }}>
            Delete
          </button>
          <div style={{ width: 1, height: 20, background: borderColor }} />
          <button data-testid="bring-to-front-btn" onClick={handleBringToFront} disabled={selectedShapeIds.length === 0} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor }}>
            Front
          </button>
          <button data-testid="send-to-back-btn" onClick={handleSendToBack} disabled={selectedShapeIds.length === 0} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor }}>
            Back
          </button>
          <button data-testid="lock-btn" onClick={handleLockShape} disabled={selectedShapeIds.length === 0} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor }}>
            {selectedShape?.locked ? 'Unlock' : 'Lock'}
          </button>
          <div style={{ flex: 1 }} />
          <button data-testid="zoom-out-btn" onClick={handleZoomOut} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor }}>
            −
          </button>
          <span data-testid="zoom-level" style={{ fontSize: 13, fontWeight: 600, minWidth: 40, textAlign: 'center' }}>{zoom}%</span>
          <button data-testid="zoom-in-btn" onClick={handleZoomIn} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor }}>
            +
          </button>
          <button data-testid="zoom-reset-btn" onClick={handleZoomReset} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor }}>
            Reset
          </button>
          <div style={{ width: 1, height: 20, background: borderColor }} />
          <button data-testid="export-json-btn" onClick={handleExportJSON} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor }}>
            JSON
          </button>
          <button data-testid="export-svg-btn" onClick={handleExportSVG} style={{ padding: '4px 8px', border: `1px solid ${borderColor}`, borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: textColor }}>
            SVG
          </button>
          <button data-testid="clear-canvas-btn" onClick={handleClearCanvas} style={{ padding: '4px 8px', border: '1px solid #dc2626', borderRadius: 4, cursor: 'pointer', fontSize: 13, background: 'transparent', color: '#dc2626' }}>
            Clear
          </button>
        </div>

        {/* Canvas area */}
        <div
          ref={containerRef}
          data-testid="canvas-container"
          style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: activeTool === TOOL_TYPES.SELECT ? 'default' : 'crosshair' }}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onContextMenu={handleContextMenu}
          onWheel={handleWheel}
        >
          {/* Grid */}
          {showGrid && (
            <div
              data-testid="canvas-grid"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundSize: `${GRID_SIZE * zoom / 100}px ${GRID_SIZE * zoom / 100}px`,
                backgroundImage: `linear-gradient(to right, ${darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} 1px, transparent 1px), linear-gradient(to bottom, ${darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'} 1px, transparent 1px)`,
                backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Transformed canvas */}
          <div
            ref={canvasRef}
            data-testid="canvas-transform"
            style={{
              position: 'absolute',
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
              transformOrigin: '0 0',
            }}
          >
            {shapes.map(renderShape)}

            {/* Current pen drawing preview */}
            {isDrawing && activeTool === TOOL_TYPES.PEN && currentPenPoints.length > 1 && (
              <svg data-testid="pen-preview" style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', overflow: 'visible', pointerEvents: 'none' }}>
                <polyline
                  points={currentPenPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.6"
                />
              </svg>
            )}
          </div>

          {/* User cursors */}
          {activeUsers.filter((u) => u.id !== 'u1').map((user) => (
            <div
              key={user.id}
              data-testid={`cursor-${user.id}`}
              style={{
                position: 'absolute',
                left: user.cursor.x * zoom / 100 + panOffset.x,
                top: user.cursor.y * zoom / 100 + panOffset.y,
                pointerEvents: 'none',
                zIndex: 1000,
              }}
            >
              <div style={{ width: 12, height: 12, borderLeft: `3px solid ${user.color}`, borderTop: `3px solid ${user.color}`, transform: 'rotate(-5deg)' }} />
              <span style={{ fontSize: 10, background: user.color, color: '#fff', padding: '1px 4px', borderRadius: 3, marginLeft: 8, whiteSpace: 'nowrap', fontWeight: 600 }}>
                {user.name}
              </span>
            </div>
          ))}

          {/* Context menu */}
          {contextMenu && (
            <div
              data-testid="context-menu"
              style={{
                position: 'fixed',
                left: contextMenu.x,
                top: contextMenu.y,
                background: panelBg,
                border: `1px solid ${borderColor}`,
                borderRadius: 8,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 2000,
                minWidth: 180,
                padding: '4px 0',
              }}
            >
              {contextMenu.shapeId && (
                <>
                  <button data-testid="ctx-copy" onClick={handleCopy} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: textColor }}>
                    Copy (Ctrl+C)
                  </button>
                  <button data-testid="ctx-duplicate" onClick={handleDuplicate} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: textColor }}>
                    Duplicate (Ctrl+D)
                  </button>
                  <button data-testid="ctx-delete" onClick={handleDelete} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: textColor }}>
                    Delete
                  </button>
                  <div style={{ height: 1, background: borderColor, margin: '4px 0' }} />
                  <button data-testid="ctx-front" onClick={handleBringToFront} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: textColor }}>
                    Bring to Front
                  </button>
                  <button data-testid="ctx-back" onClick={handleSendToBack} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: textColor }}>
                    Send to Back
                  </button>
                  <button data-testid="ctx-lock" onClick={handleLockShape} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: textColor }}>
                    {selectedShape?.locked ? 'Unlock' : 'Lock'}
                  </button>
                </>
              )}
              {!contextMenu.shapeId && (
                <>
                  <button data-testid="ctx-paste" onClick={handlePaste} disabled={clipboard.length === 0} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: textColor, opacity: clipboard.length === 0 ? 0.4 : 1 }}>
                    Paste (Ctrl+V)
                  </button>
                  <button data-testid="ctx-select-all" onClick={() => { setSelectedShapeIds(shapes.map((s) => s.id)); setContextMenu(null); }} style={{ width: '100%', textAlign: 'left', padding: '8px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: textColor }}>
                    Select All
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Properties panel */}
        {showPropertyPanel && selectedShape && (
          <div data-testid="property-panel" style={{ padding: '12px 16px', borderTop: `1px solid ${borderColor}`, background: panelBg, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', fontSize: 13 }}>
            <div>
              <label style={{ fontSize: 11, opacity: 0.6, display: 'block' }}>Label</label>
              <input
                data-testid="prop-label"
                value={selectedShape.label}
                onChange={(e) => handleUpdateShape(selectedShape.id, { label: e.target.value })}
                style={{ padding: '4px', border: `1px solid ${borderColor}`, borderRadius: 4, background: panelBg, color: textColor, width: 120 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, opacity: 0.6, display: 'block' }}>X</label>
              <input
                data-testid="prop-x"
                type="number"
                value={Math.round(selectedShape.x)}
                onChange={(e) => handleUpdateShape(selectedShape.id, { x: Number(e.target.value) })}
                style={{ padding: '4px', border: `1px solid ${borderColor}`, borderRadius: 4, background: panelBg, color: textColor, width: 60 }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, opacity: 0.6, display: 'block' }}>Y</label>
              <input
                data-testid="prop-y"
                type="number"
                value={Math.round(selectedShape.y)}
                onChange={(e) => handleUpdateShape(selectedShape.id, { y: Number(e.target.value) })}
                style={{ padding: '4px', border: `1px solid ${borderColor}`, borderRadius: 4, background: panelBg, color: textColor, width: 60 }}
              />
            </div>
            {selectedShape.type !== 'pen' && (
              <>
                <div>
                  <label style={{ fontSize: 11, opacity: 0.6, display: 'block' }}>W</label>
                  <input
                    data-testid="prop-width"
                    type="number"
                    value={Math.round(selectedShape.width)}
                    onChange={(e) => handleUpdateShape(selectedShape.id, { width: Number(e.target.value) })}
                    style={{ padding: '4px', border: `1px solid ${borderColor}`, borderRadius: 4, background: panelBg, color: textColor, width: 60 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, opacity: 0.6, display: 'block' }}>H</label>
                  <input
                    data-testid="prop-height"
                    type="number"
                    value={Math.round(selectedShape.height)}
                    onChange={(e) => handleUpdateShape(selectedShape.id, { height: Number(e.target.value) })}
                    style={{ padding: '4px', border: `1px solid ${borderColor}`, borderRadius: 4, background: panelBg, color: textColor, width: 60 }}
                  />
                </div>
              </>
            )}
            <div>
              <label style={{ fontSize: 11, opacity: 0.6, display: 'block' }}>Opacity</label>
              <input
                data-testid="prop-opacity"
                type="range"
                min="0"
                max="100"
                value={selectedShape.opacity}
                onChange={(e) => handleUpdateShape(selectedShape.id, { opacity: Number(e.target.value) })}
                style={{ width: 80 }}
              />
              <span style={{ fontSize: 11, marginLeft: 4 }}>{selectedShape.opacity}%</span>
            </div>
            <div>
              <label style={{ fontSize: 11, opacity: 0.6, display: 'block' }}>Layer</label>
              <select
                data-testid="prop-layer"
                value={selectedShape.layerId}
                onChange={(e) => handleUpdateShape(selectedShape.id, { layerId: e.target.value })}
                style={{ padding: '4px', border: `1px solid ${borderColor}`, borderRadius: 4, background: panelBg, color: textColor }}
              >
                {layers.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Status bar */}
        <div style={{ padding: '4px 16px', borderTop: `1px solid ${borderColor}`, background: panelBg, display: 'flex', justifyContent: 'space-between', fontSize: 11, opacity: 0.6 }} data-testid="status-bar">
          <span>Tool: {activeTool.toUpperCase()} | Layer: {activeLayer?.name} | Zoom: {zoom}%</span>
          <span>{selectedShapeIds.length > 0 ? `${selectedShapeIds.length} selected` : 'No selection'} | {shapeCount} shapes | Grid: {showGrid ? 'ON' : 'OFF'} | Snap: {snapToGrid ? 'ON' : 'OFF'}</span>
        </div>
      </div>
    </div>
  );
}
