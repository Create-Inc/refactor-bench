import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TemplateModal } from './src/app/TemplateModal.jsx';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  LayoutTemplate: (props) => <svg data-testid="layout-template-icon" {...props} />,
}));

// Mock ModalLayout to just render children with title
vi.mock('./src/app/ModalLayout', () => ({
  ModalLayout: ({ title, onClose, children }) => (
    <div data-testid="modal-layout">
      <h2>{title}</h2>
      <button onClick={onClose} data-testid="close-modal">Close</button>
      {children}
    </div>
  ),
}));

const mockProjects = [
  { id: 1, name: 'Website Redesign', color: '#3b82f6' },
  { id: 2, name: 'Mobile App', color: '#10b981' },
];

const mockPhases = [
  {
    id: 10,
    project_id: 1,
    name: 'Discovery',
    phase_order: 1,
    complexity: 'medium',
    phase_type: 'planning',
    effort_category: 'design',
    notes: 'Initial phase',
  },
  {
    id: 11,
    project_id: 1,
    name: 'Development',
    phase_order: 2,
    complexity: 'high',
    phase_type: 'execution',
    effort_category: 'engineering',
    notes: '',
  },
  {
    id: 12,
    project_id: 2,
    name: 'Beta',
    phase_order: 1,
    complexity: 'low',
    phase_type: 'testing',
    effort_category: 'qa',
    notes: '',
  },
];

const mockTemplates = [
  {
    id: 100,
    name: 'Standard Web',
    description: 'Template for web projects',
    template_data: {
      phases: [
        { name: 'Phase A', phase_order: 1 },
        { name: 'Phase B', phase_order: 2 },
      ],
    },
  },
  {
    id: 101,
    name: 'Agile Sprint',
    description: '',
    template_data: { phases: [{ name: 'Sprint 1', phase_order: 1 }] },
  },
];

describe('TemplateModal Component', () => {
  let onClose;
  let onSaveTemplate;
  let onApplyTemplate;

  beforeEach(() => {
    vi.clearAllMocks();
    onClose = vi.fn();
    onSaveTemplate = vi.fn();
    onApplyTemplate = vi.fn();
  });

  function renderComponent(props = {}) {
    return render(
      <TemplateModal
        templates={mockTemplates}
        projects={mockProjects}
        phases={mockPhases}
        onClose={onClose}
        onSaveTemplate={onSaveTemplate}
        onApplyTemplate={onApplyTemplate}
        {...props}
      />
    );
  }

  describe('List View', () => {
    test('renders modal with title', () => {
      renderComponent();
      expect(screen.getByText('Project Templates')).toBeInTheDocument();
    });

    test('renders Create Template button', () => {
      renderComponent();
      expect(
        screen.getByRole('button', { name: 'Create Template' })
      ).toBeInTheDocument();
    });

    test('renders each template with name and description', () => {
      renderComponent();
      expect(screen.getByText('Standard Web')).toBeInTheDocument();
      expect(
        screen.getByText('Template for web projects')
      ).toBeInTheDocument();
      expect(screen.getByText('Agile Sprint')).toBeInTheDocument();
    });

    test('shows phase count for each template', () => {
      renderComponent();
      expect(screen.getByText('2 phases')).toBeInTheDocument();
      expect(screen.getByText('1 phases')).toBeInTheDocument();
    });

    test('renders Apply button for each template', () => {
      renderComponent();
      const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
      expect(applyButtons.length).toBe(2);
    });

    test('shows empty state when no templates exist', () => {
      renderComponent({ templates: [] });
      expect(
        screen.getByText(
          'No templates yet. Create one to standardize your planning!'
        )
      ).toBeInTheDocument();
    });

    test('calls onClose via ModalLayout close button', () => {
      renderComponent();
      fireEvent.click(screen.getByTestId('close-modal'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe('Create View', () => {
    test('switches to create view when Create Template is clicked', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Create Template' }));
      expect(screen.getByText('Template Name')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Base on Existing Project')).toBeInTheDocument();
    });

    test('shows project options in the select dropdown', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Create Template' }));

      // The select should show projects with phase counts
      expect(
        screen.getByText('Website Redesign (2 phases)')
      ).toBeInTheDocument();
      expect(screen.getByText('Mobile App (1 phases)')).toBeInTheDocument();
    });

    test('submits template creation with form data', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Create Template' }));

      fireEvent.change(
        screen.getByPlaceholderText('e.g., Standard Web Project'),
        { target: { value: 'My Template' } }
      );
      fireEvent.change(
        screen.getByPlaceholderText(
          'Brief description of when to use this template'
        ),
        { target: { value: 'A good template' } }
      );

      // Submit form
      fireEvent.click(
        screen.getByRole('button', { name: 'Create Template' })
      );

      expect(onSaveTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'My Template',
          description: 'A good template',
          template_data: expect.objectContaining({
            default_color: '#3b82f6',
            phases: expect.any(Array),
          }),
        })
      );
    });

    test('returns to list view after successful creation', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Create Template' }));

      fireEvent.change(
        screen.getByPlaceholderText('e.g., Standard Web Project'),
        { target: { value: 'Test' } }
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Create Template' })
      );

      // Should be back on list view
      expect(screen.getByText('Standard Web')).toBeInTheDocument();
    });

    test('Cancel button returns to list view', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Create Template' }));
      expect(screen.getByText('Template Name')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.getByText('Standard Web')).toBeInTheDocument();
    });

    test('passes phases from selected project to template data', () => {
      renderComponent();
      fireEvent.click(screen.getByRole('button', { name: 'Create Template' }));

      // Select second project
      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: '2' } });

      fireEvent.change(
        screen.getByPlaceholderText('e.g., Standard Web Project'),
        { target: { value: 'Mobile Template' } }
      );

      fireEvent.click(
        screen.getByRole('button', { name: 'Create Template' })
      );

      expect(onSaveTemplate).toHaveBeenCalledWith(
        expect.objectContaining({
          template_data: expect.objectContaining({
            default_color: '#10b981',
            phases: expect.arrayContaining([
              expect.objectContaining({ name: 'Beta' }),
            ]),
          }),
        })
      );
    });
  });

  describe('Apply View', () => {
    test('switches to apply view when Apply button is clicked', () => {
      renderComponent();
      const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
      fireEvent.click(applyButtons[0]);

      expect(screen.getByText('New Project Name')).toBeInTheDocument();
      expect(screen.getByText('Project Color')).toBeInTheDocument();
    });

    test('renders color picker buttons', () => {
      renderComponent();
      const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
      fireEvent.click(applyButtons[0]);

      // 7 color swatches + Cancel + Apply Template buttons = at least 9
      const allButtons = screen.getAllByRole('button');
      expect(allButtons.length).toBeGreaterThanOrEqual(9);
    });

    test('submits apply template with project name and color', () => {
      renderComponent();
      const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
      fireEvent.click(applyButtons[0]);

      fireEvent.change(screen.getByPlaceholderText('Enter project name'), {
        target: { value: 'New Project' },
      });

      fireEvent.click(
        screen.getByRole('button', { name: 'Apply Template' })
      );

      expect(onApplyTemplate).toHaveBeenCalledWith({
        templateId: 100,
        projectName: 'New Project',
        projectColor: '#3b82f6',
      });
    });

    test('allows changing project color before applying', () => {
      renderComponent();
      const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
      fireEvent.click(applyButtons[0]);

      // Click a different color swatch (the green one)
      const colorButtons = screen.getAllByRole('button').filter((btn) => {
        const style = btn.getAttribute('style');
        return style && style.includes('background-color');
      });
      // Click the second color (#10b981 - green)
      fireEvent.click(colorButtons[1]);

      fireEvent.change(screen.getByPlaceholderText('Enter project name'), {
        target: { value: 'Green Project' },
      });

      fireEvent.click(
        screen.getByRole('button', { name: 'Apply Template' })
      );

      expect(onApplyTemplate).toHaveBeenCalledWith({
        templateId: 100,
        projectName: 'Green Project',
        projectColor: '#10b981',
      });
    });

    test('Cancel button returns to list view from apply', () => {
      renderComponent();
      const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
      fireEvent.click(applyButtons[0]);

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.getByText('Standard Web')).toBeInTheDocument();
    });

    test('returns to list view after applying template', () => {
      renderComponent();
      const applyButtons = screen.getAllByRole('button', { name: 'Apply' });
      fireEvent.click(applyButtons[0]);

      fireEvent.change(screen.getByPlaceholderText('Enter project name'), {
        target: { value: 'Applied' },
      });

      fireEvent.click(
        screen.getByRole('button', { name: 'Apply Template' })
      );

      // Should be back on list view
      expect(screen.getByText('Standard Web')).toBeInTheDocument();
    });
  });
});
