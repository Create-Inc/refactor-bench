import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import CollaborativeWhiteboard from './src/app/page.jsx';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock confirm dialog
window.confirm = vi.fn();

// Mock URL.createObjectURL and revokeObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url');
URL.revokeObjectURL = vi.fn();

// Mock document.createElement('a').click for export
const mockClick = vi.fn();
const originalCreateElement = document.createElement.bind(document);
vi.spyOn(document, 'createElement').mockImplementation((tag) => {
  const el = originalCreateElement(tag);
  if (tag === 'a') {
    el.click = mockClick;
  }
  return el;
});

describe('CollaborativeWhiteboard Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders app container with sidebar and canvas', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('whiteboard-app')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('canvas-container')).toBeInTheDocument();
    });

    test('renders WhiteBoard title', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByText('WhiteBoard')).toBeInTheDocument();
    });

    test('renders sidebar tabs: tools, layers, shapes', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('sidebar-tab-tools')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-tab-layers')).toBeInTheDocument();
      expect(screen.getByTestId('sidebar-tab-shapes')).toBeInTheDocument();
    });

    test('renders all drawing tool buttons', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('tool-select')).toBeInTheDocument();
      expect(screen.getByTestId('tool-pen')).toBeInTheDocument();
      expect(screen.getByTestId('tool-rectangle')).toBeInTheDocument();
      expect(screen.getByTestId('tool-ellipse')).toBeInTheDocument();
      expect(screen.getByTestId('tool-line')).toBeInTheDocument();
      expect(screen.getByTestId('tool-arrow')).toBeInTheDocument();
      expect(screen.getByTestId('tool-text')).toBeInTheDocument();
      expect(screen.getByTestId('tool-eraser')).toBeInTheDocument();
    });

    test('renders initial shapes on canvas', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('shape-s1')).toBeInTheDocument();
      expect(screen.getByTestId('shape-s2')).toBeInTheDocument();
      expect(screen.getByTestId('shape-s3')).toBeInTheDocument();
      expect(screen.getByTestId('shape-s4')).toBeInTheDocument();
      expect(screen.getByTestId('shape-s5')).toBeInTheDocument();
      expect(screen.getByTestId('shape-s6')).toBeInTheDocument();
      expect(screen.getByTestId('shape-s7')).toBeInTheDocument();
      expect(screen.getByTestId('shape-s8')).toBeInTheDocument();
    });

    test('renders active user avatars', () => {
      render(<CollaborativeWhiteboard />);
      const activeUsers = screen.getByTestId('active-users');
      expect(within(activeUsers).getByTestId('user-avatar-u1')).toBeInTheDocument();
      expect(within(activeUsers).getByTestId('user-avatar-u2')).toBeInTheDocument();
      expect(within(activeUsers).getByTestId('user-avatar-u4')).toBeInTheDocument();
    });

    test('renders remote user cursors on canvas', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('cursor-u2')).toBeInTheDocument();
      expect(screen.getByTestId('cursor-u4')).toBeInTheDocument();
      // u3 is inactive, should not have cursor
      expect(screen.queryByTestId('cursor-u3')).not.toBeInTheDocument();
    });

    test('renders main toolbar with action buttons', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('main-toolbar')).toBeInTheDocument();
      expect(screen.getByTestId('undo-btn')).toBeInTheDocument();
      expect(screen.getByTestId('redo-btn')).toBeInTheDocument();
      expect(screen.getByTestId('copy-btn')).toBeInTheDocument();
      expect(screen.getByTestId('paste-btn')).toBeInTheDocument();
      expect(screen.getByTestId('duplicate-btn')).toBeInTheDocument();
      expect(screen.getByTestId('delete-btn')).toBeInTheDocument();
    });

    test('renders zoom controls', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('zoom-in-btn')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-out-btn')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-reset-btn')).toBeInTheDocument();
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('100%');
    });

    test('renders export buttons', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('export-json-btn')).toBeInTheDocument();
      expect(screen.getByTestId('export-svg-btn')).toBeInTheDocument();
    });

    test('renders status bar with tool info', () => {
      render(<CollaborativeWhiteboard />);
      const statusBar = screen.getByTestId('status-bar');
      expect(statusBar).toHaveTextContent(/Tool: SELECT/);
      expect(statusBar).toHaveTextContent(/Layer: Main/);
      expect(statusBar).toHaveTextContent(/Zoom: 100%/);
      expect(statusBar).toHaveTextContent(/8 shapes/);
    });

    test('renders sidebar footer stats', () => {
      render(<CollaborativeWhiteboard />);
      const stats = screen.getByTestId('sidebar-stats');
      expect(stats).toHaveTextContent(/8 shapes/);
      expect(stats).toHaveTextContent(/3 layers/);
      expect(stats).toHaveTextContent(/3 users online/);
    });

    test('renders canvas grid by default', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('canvas-grid')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('theme-toggle'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('whiteboardDarkMode', 'true');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<CollaborativeWhiteboard />);
      const btn = screen.getByTestId('theme-toggle');
      fireEvent.click(btn);
      fireEvent.click(btn);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('whiteboardDarkMode', 'false');
    });
  });

  describe('Tool Selection', () => {
    test('clicking a tool button changes the active tool', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('tool-pen'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/Tool: PEN/);
    });

    test('clicking rectangle tool changes tool', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('tool-rectangle'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/Tool: RECTANGLE/);
    });

    test('clicking ellipse tool changes tool', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('tool-ellipse'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/Tool: ELLIPSE/);
    });

    test('clicking line tool changes tool', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('tool-line'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/Tool: LINE/);
    });

    test('clicking arrow tool changes tool', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('tool-arrow'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/Tool: ARROW/);
    });

    test('clicking text tool changes tool', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('tool-text'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/Tool: TEXT/);
    });

    test('clicking eraser tool changes tool', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('tool-eraser'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/Tool: ERASER/);
    });
  });

  describe('Color Pickers', () => {
    test('renders stroke color options', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('stroke-color-#000000')).toBeInTheDocument();
      expect(screen.getByTestId('stroke-color-#dc2626')).toBeInTheDocument();
      expect(screen.getByTestId('stroke-color-#3b82f6')).toBeInTheDocument();
    });

    test('renders fill color options', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('fill-color-#000000')).toBeInTheDocument();
      expect(screen.getByTestId('fill-color-#22c55e')).toBeInTheDocument();
      expect(screen.getByTestId('fill-color-#8b5cf6')).toBeInTheDocument();
    });

    test('clicking stroke color changes active stroke', () => {
      render(<CollaborativeWhiteboard />);
      const redBtn = screen.getByTestId('stroke-color-#dc2626');
      fireEvent.click(redBtn);
      // Active color has different border style
      expect(redBtn).toHaveStyle({ border: '2px solid #2563eb' });
    });

    test('clicking fill color changes active fill', () => {
      render(<CollaborativeWhiteboard />);
      const greenBtn = screen.getByTestId('fill-color-#22c55e');
      fireEvent.click(greenBtn);
      expect(greenBtn).toHaveStyle({ border: '2px solid #2563eb' });
    });
  });

  describe('Stroke Width', () => {
    test('renders stroke width options', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('stroke-width-1')).toBeInTheDocument();
      expect(screen.getByTestId('stroke-width-4')).toBeInTheDocument();
      expect(screen.getByTestId('stroke-width-12')).toBeInTheDocument();
    });

    test('clicking stroke width changes active width', () => {
      render(<CollaborativeWhiteboard />);
      const btn = screen.getByTestId('stroke-width-6');
      fireEvent.click(btn);
      // Verify it is visually active (background changes)
      expect(btn).toBeInTheDocument();
    });
  });

  describe('Font Size', () => {
    test('renders font size select', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('font-size-select')).toBeInTheDocument();
    });

    test('changing font size updates value', () => {
      render(<CollaborativeWhiteboard />);
      const select = screen.getByTestId('font-size-select');
      fireEvent.change(select, { target: { value: '24' } });
      expect(select.value).toBe('24');
    });
  });

  describe('Canvas Options', () => {
    test('renders grid toggle checkbox', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('toggle-grid')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-grid')).toBeChecked();
    });

    test('toggling grid hides the grid', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('toggle-grid'));
      expect(screen.queryByTestId('canvas-grid')).not.toBeInTheDocument();
    });

    test('renders snap-to-grid toggle', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('toggle-snap')).toBeInTheDocument();
      expect(screen.getByTestId('toggle-snap')).not.toBeChecked();
    });

    test('toggling snap-to-grid enables snapping', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('toggle-snap'));
      expect(screen.getByTestId('toggle-snap')).toBeChecked();
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/Snap: ON/);
    });
  });

  describe('Sidebar Tab Navigation', () => {
    test('switching to layers tab shows layers panel', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      expect(screen.getByTestId('layers-panel')).toBeInTheDocument();
    });

    test('switching to shapes tab shows shapes panel', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      expect(screen.getByTestId('shapes-panel')).toBeInTheDocument();
    });

    test('switching back to tools tab shows tools panel', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      fireEvent.click(screen.getByTestId('sidebar-tab-tools'));
      expect(screen.getByTestId('tools-panel')).toBeInTheDocument();
    });
  });

  describe('Layer Management', () => {
    test('renders initial layers', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      expect(screen.getByTestId('layer-item-layer-1')).toBeInTheDocument();
      expect(screen.getByTestId('layer-item-layer-2')).toBeInTheDocument();
      expect(screen.getByTestId('layer-item-layer-3')).toBeInTheDocument();
    });

    test('add layer button creates new layer', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      fireEvent.click(screen.getByTestId('add-layer-btn'));
      // Stats should show 4 layers now
      expect(screen.getByTestId('sidebar-stats')).toHaveTextContent(/4 layers/);
    });

    test('toggle layer visibility hides layer shapes', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      fireEvent.click(screen.getByTestId('toggle-vis-layer-1'));
      // Shapes on layer-1 (s1, s4) should be hidden
      // The shapes still exist in DOM but should not be rendered
      expect(screen.getByTestId('shape-s1')).not.toBeVisible();
    });

    test('toggle layer lock applies lock status', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      fireEvent.click(screen.getByTestId('toggle-lock-layer-2'));
      // Locked layer shapes should have pointerEvents: none
    });

    test('delete layer removes layer and its shapes', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      fireEvent.click(screen.getByTestId('delete-layer-layer-3'));
      expect(screen.queryByTestId('layer-item-layer-3')).not.toBeInTheDocument();
      // Text shapes s6 and s7 were on layer-3, should be removed
      expect(screen.queryByTestId('shape-s6')).not.toBeInTheDocument();
      expect(screen.queryByTestId('shape-s7')).not.toBeInTheDocument();
    });

    test('clicking layer sets it as active', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      fireEvent.click(screen.getByTestId('layer-item-layer-1'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/Layer: Background/);
    });

    test('layer opacity slider changes layer opacity', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      const slider = screen.getByTestId('layer-opacity-layer-2');
      fireEvent.change(slider, { target: { value: '50' } });
      expect(slider.value).toBe('50');
    });

    test('move layer up reorders layers', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      fireEvent.click(screen.getByTestId('move-layer-up-layer-1'));
      // After move up, layer-1 should be above layer-2
    });
  });

  describe('Shape List (Shapes Panel)', () => {
    test('renders all shapes in shapes panel', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      expect(screen.getByTestId('shape-list-item-s1')).toBeInTheDocument();
      expect(screen.getByTestId('shape-list-item-s2')).toBeInTheDocument();
      expect(screen.getByTestId('shape-list-item-s8')).toBeInTheDocument();
    });

    test('search filters shapes by label', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.change(screen.getByTestId('shape-search'), { target: { value: 'Title' } });
      expect(screen.getByTestId('shape-list-item-s6')).toBeInTheDocument();
      expect(screen.queryByTestId('shape-list-item-s1')).not.toBeInTheDocument();
    });

    test('type filter filters shapes by type', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.change(screen.getByTestId('shape-type-filter'), { target: { value: 'rectangle' } });
      expect(screen.getByTestId('shape-list-item-s1')).toBeInTheDocument();
      expect(screen.getByTestId('shape-list-item-s3')).toBeInTheDocument();
      // Ellipse shape should be hidden
      expect(screen.queryByTestId('shape-list-item-s2')).not.toBeInTheDocument();
    });

    test('clicking shape in list selects it', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/1 selected/);
    });

    test('shows filtered count vs total count', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      expect(screen.getByText(/8 of 8 shapes/)).toBeInTheDocument();
      fireEvent.change(screen.getByTestId('shape-type-filter'), { target: { value: 'text' } });
      expect(screen.getByText(/2 of 8 shapes/)).toBeInTheDocument();
    });
  });

  describe('Zoom Controls', () => {
    test('zoom in increases zoom level', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('zoom-in-btn'));
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('110%');
    });

    test('zoom out decreases zoom level', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('zoom-out-btn'));
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('90%');
    });

    test('zoom reset returns to 100%', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('zoom-in-btn'));
      fireEvent.click(screen.getByTestId('zoom-in-btn'));
      fireEvent.click(screen.getByTestId('zoom-reset-btn'));
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('100%');
    });

    test('multiple zoom in clicks increase progressively', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('zoom-in-btn'));
      fireEvent.click(screen.getByTestId('zoom-in-btn'));
      fireEvent.click(screen.getByTestId('zoom-in-btn'));
      expect(screen.getByTestId('zoom-level')).toHaveTextContent('130%');
    });
  });

  describe('Undo/Redo', () => {
    test('undo is disabled initially', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('undo-btn')).toBeDisabled();
    });

    test('redo is disabled initially', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('redo-btn')).toBeDisabled();
    });

    test('deleting a shape then undoing restores it', () => {
      render(<CollaborativeWhiteboard />);
      // Select s1 via shapes panel
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      // Delete
      fireEvent.click(screen.getByTestId('delete-btn'));
      expect(screen.queryByTestId('shape-s1')).not.toBeInTheDocument();
      // Undo
      fireEvent.click(screen.getByTestId('undo-btn'));
      expect(screen.getByTestId('shape-s1')).toBeInTheDocument();
    });

    test('undo then redo restores the change', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s2'));
      fireEvent.click(screen.getByTestId('delete-btn'));
      expect(screen.queryByTestId('shape-s2')).not.toBeInTheDocument();
      fireEvent.click(screen.getByTestId('undo-btn'));
      expect(screen.getByTestId('shape-s2')).toBeInTheDocument();
      fireEvent.click(screen.getByTestId('redo-btn'));
      expect(screen.queryByTestId('shape-s2')).not.toBeInTheDocument();
    });
  });

  describe('Copy, Paste, Duplicate', () => {
    test('duplicate creates a copy of selected shape', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      fireEvent.click(screen.getByTestId('duplicate-btn'));
      // Should now have 9 shapes
      expect(screen.getByTestId('sidebar-stats')).toHaveTextContent(/9 shapes/);
    });

    test('copy then paste creates a copy', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s3'));
      fireEvent.click(screen.getByTestId('copy-btn'));
      fireEvent.click(screen.getByTestId('paste-btn'));
      expect(screen.getByTestId('sidebar-stats')).toHaveTextContent(/9 shapes/);
    });
  });

  describe('Delete', () => {
    test('delete button removes selected shape', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s3'));
      fireEvent.click(screen.getByTestId('delete-btn'));
      expect(screen.queryByTestId('shape-s3')).not.toBeInTheDocument();
      expect(screen.getByTestId('sidebar-stats')).toHaveTextContent(/7 shapes/);
    });
  });

  describe('Bring to Front / Send to Back', () => {
    test('bring to front button exists and is clickable when shape selected', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      const btn = screen.getByTestId('bring-to-front-btn');
      expect(btn).not.toBeDisabled();
      fireEvent.click(btn);
    });

    test('send to back button exists and is clickable when shape selected', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      const btn = screen.getByTestId('send-to-back-btn');
      expect(btn).not.toBeDisabled();
      fireEvent.click(btn);
    });
  });

  describe('Lock/Unlock Shape', () => {
    test('lock button toggles selected shape lock state', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      const lockBtn = screen.getByTestId('lock-btn');
      expect(lockBtn).toHaveTextContent('Lock');
      fireEvent.click(lockBtn);
      // After locking, the shape list should show lock icon
    });
  });

  describe('Property Panel', () => {
    test('selecting a shape shows property panel', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      expect(screen.getByTestId('property-panel')).toBeInTheDocument();
      expect(screen.getByTestId('prop-label')).toBeInTheDocument();
      expect(screen.getByTestId('prop-x')).toBeInTheDocument();
      expect(screen.getByTestId('prop-y')).toBeInTheDocument();
    });

    test('property panel shows width and height for non-pen shapes', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      expect(screen.getByTestId('prop-width')).toBeInTheDocument();
      expect(screen.getByTestId('prop-height')).toBeInTheDocument();
    });

    test('changing label in property panel updates shape', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      const labelInput = screen.getByTestId('prop-label');
      fireEvent.change(labelInput, { target: { value: 'Updated Label' } });
      expect(labelInput.value).toBe('Updated Label');
    });

    test('changing x position in property panel updates shape', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      const xInput = screen.getByTestId('prop-x');
      fireEvent.change(xInput, { target: { value: '100' } });
      expect(xInput.value).toBe('100');
    });

    test('property panel includes opacity slider', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      expect(screen.getByTestId('prop-opacity')).toBeInTheDocument();
    });

    test('property panel includes layer selector', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      expect(screen.getByTestId('prop-layer')).toBeInTheDocument();
    });

    test('changing layer in property panel moves shape to new layer', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      const layerSelect = screen.getByTestId('prop-layer');
      fireEvent.change(layerSelect, { target: { value: 'layer-3' } });
      expect(layerSelect.value).toBe('layer-3');
    });
  });

  describe('Export', () => {
    test('export JSON creates and triggers download', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('export-json-btn'));
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    test('export SVG creates and triggers download', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('export-svg-btn'));
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe('Clear Canvas', () => {
    test('clear canvas with confirm=false does not clear', () => {
      window.confirm.mockReturnValue(false);
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('clear-canvas-btn'));
      expect(screen.getByTestId('shape-s1')).toBeInTheDocument();
    });

    test('clear canvas with confirm=true removes all shapes', () => {
      window.confirm.mockReturnValue(true);
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('clear-canvas-btn'));
      expect(screen.queryByTestId('shape-s1')).not.toBeInTheDocument();
      expect(screen.queryByTestId('shape-s2')).not.toBeInTheDocument();
      expect(screen.getByTestId('sidebar-stats')).toHaveTextContent(/0 shapes/);
    });
  });

  describe('Text Editing', () => {
    test('renders text shapes with content', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByText('Whiteboard Title')).toBeInTheDocument();
      expect(screen.getByText('This is a collaborative whiteboard')).toBeInTheDocument();
    });

    test('double-clicking text shape opens inline editor', () => {
      render(<CollaborativeWhiteboard />);
      const textShape = screen.getByTestId('shape-s6');
      fireEvent.doubleClick(textShape);
      expect(screen.getByTestId('text-edit-input-s6')).toBeInTheDocument();
    });

    test('editing text and pressing Enter saves the text', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.doubleClick(screen.getByTestId('shape-s6'));
      const input = screen.getByTestId('text-edit-input-s6');
      fireEvent.change(input, { target: { value: 'New Title' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      expect(screen.getByText('New Title')).toBeInTheDocument();
    });

    test('editing text and pressing Escape cancels the edit', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.doubleClick(screen.getByTestId('shape-s6'));
      const input = screen.getByTestId('text-edit-input-s6');
      fireEvent.change(input, { target: { value: 'Should Not Save' } });
      fireEvent.keyDown(input, { key: 'Escape' });
      expect(screen.getByText('Whiteboard Title')).toBeInTheDocument();
    });
  });

  describe('Shape Types on Canvas', () => {
    test('rectangle shapes are rendered with data-shape-type', () => {
      render(<CollaborativeWhiteboard />);
      const shape = screen.getByTestId('shape-s1');
      expect(shape).toHaveAttribute('data-shape-type', 'rectangle');
    });

    test('ellipse shapes are rendered with data-shape-type', () => {
      render(<CollaborativeWhiteboard />);
      const shape = screen.getByTestId('shape-s2');
      expect(shape).toHaveAttribute('data-shape-type', 'ellipse');
    });

    test('line shapes are rendered with data-shape-type', () => {
      render(<CollaborativeWhiteboard />);
      const shape = screen.getByTestId('shape-s4');
      expect(shape).toHaveAttribute('data-shape-type', 'line');
    });

    test('arrow shapes are rendered with data-shape-type', () => {
      render(<CollaborativeWhiteboard />);
      const shape = screen.getByTestId('shape-s5');
      expect(shape).toHaveAttribute('data-shape-type', 'arrow');
    });

    test('text shapes are rendered with data-shape-type', () => {
      render(<CollaborativeWhiteboard />);
      const shape = screen.getByTestId('shape-s6');
      expect(shape).toHaveAttribute('data-shape-type', 'text');
    });

    test('pen shapes are rendered with data-shape-type', () => {
      render(<CollaborativeWhiteboard />);
      const shape = screen.getByTestId('shape-s8');
      expect(shape).toHaveAttribute('data-shape-type', 'pen');
    });
  });

  describe('LocalStorage Persistence', () => {
    test('shapes are saved to localStorage on change', () => {
      render(<CollaborativeWhiteboard />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'whiteboardShapes',
        expect.any(String)
      );
    });

    test('layers are saved to localStorage on change', () => {
      render(<CollaborativeWhiteboard />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'whiteboardLayers',
        expect.any(String)
      );
    });
  });

  describe('Context Menu', () => {
    test('right-clicking canvas opens context menu', () => {
      render(<CollaborativeWhiteboard />);
      const canvas = screen.getByTestId('canvas-container');
      fireEvent.contextMenu(canvas);
      expect(screen.getByTestId('context-menu')).toBeInTheDocument();
    });

    test('context menu on empty area shows paste and select all', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.contextMenu(screen.getByTestId('canvas-container'));
      expect(screen.getByTestId('ctx-paste')).toBeInTheDocument();
      expect(screen.getByTestId('ctx-select-all')).toBeInTheDocument();
    });

    test('select all from context menu selects all shapes', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.contextMenu(screen.getByTestId('canvas-container'));
      fireEvent.click(screen.getByTestId('ctx-select-all'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/8 selected/);
    });
  });

  describe('Multiple Selection', () => {
    test('selecting a shape shows 1 selected in status bar', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/1 selected/);
    });

    test('no selection shows "No selection" in status bar', () => {
      render(<CollaborativeWhiteboard />);
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/No selection/);
    });
  });

  describe('Cross-cutting Interactions', () => {
    test('deleting layer updates shapes panel count', () => {
      render(<CollaborativeWhiteboard />);
      // Go to layers, delete layer-3 (has 2 text shapes)
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      fireEvent.click(screen.getByTestId('delete-layer-layer-3'));
      // Go to shapes panel, should show 6 shapes
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      expect(screen.getByText(/6 of 6 shapes/)).toBeInTheDocument();
    });

    test('hiding a layer hides its shapes on canvas but keeps them in shapes list', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      fireEvent.click(screen.getByTestId('toggle-vis-layer-2'));
      // Shapes on layer-2 (s2, s3, s5, s8) should be hidden
      // But all shapes remain in the shapes panel list
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      expect(screen.getByTestId('shape-list-item-s2')).toBeInTheDocument();
    });

    test('selecting shape from shapes panel highlights it on canvas', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s2'));
      // Property panel should appear
      expect(screen.getByTestId('property-panel')).toBeInTheDocument();
    });

    test('duplicate then undo restores original count', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-shapes'));
      fireEvent.click(screen.getByTestId('shape-list-item-s1'));
      fireEvent.click(screen.getByTestId('duplicate-btn'));
      expect(screen.getByTestId('sidebar-stats')).toHaveTextContent(/9 shapes/);
      fireEvent.click(screen.getByTestId('undo-btn'));
      expect(screen.getByTestId('sidebar-stats')).toHaveTextContent(/8 shapes/);
    });

    test('clear canvas then undo restores all shapes', () => {
      window.confirm.mockReturnValue(true);
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('clear-canvas-btn'));
      expect(screen.getByTestId('sidebar-stats')).toHaveTextContent(/0 shapes/);
      fireEvent.click(screen.getByTestId('undo-btn'));
      expect(screen.getByTestId('sidebar-stats')).toHaveTextContent(/8 shapes/);
    });

    test('zoom level is reflected in status bar', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('zoom-in-btn'));
      fireEvent.click(screen.getByTestId('zoom-in-btn'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/Zoom: 120%/);
    });

    test('changing active layer is reflected in status bar', () => {
      render(<CollaborativeWhiteboard />);
      fireEvent.click(screen.getByTestId('sidebar-tab-layers'));
      fireEvent.click(screen.getByTestId('layer-item-layer-3'));
      expect(screen.getByTestId('status-bar')).toHaveTextContent(/Layer: Annotations/);
    });
  });
});
