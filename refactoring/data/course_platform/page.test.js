import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CoursePlatform from './src/app/page.jsx';

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

describe('CoursePlatform Component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    window.confirm.mockReturnValue(false);
  });

  describe('Initial Rendering', () => {
    test('renders sidebar with LearnHub title', () => {
      render(<CoursePlatform />);
      expect(screen.getByText(/LearnHub/)).toBeInTheDocument();
    });

    test('renders sidebar navigation items', () => {
      render(<CoursePlatform />);
      expect(screen.getByText('Course Catalog')).toBeInTheDocument();
      expect(screen.getByText('My Courses')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Bookmarks')).toBeInTheDocument();
      expect(screen.getByText('Certificates')).toBeInTheDocument();
      expect(screen.getByText('Instructors')).toBeInTheDocument();
    });

    test('renders search input with placeholder', () => {
      render(<CoursePlatform />);
      expect(screen.getByPlaceholderText('Search courses... (Ctrl+K)')).toBeInTheDocument();
    });

    test('renders filter controls', () => {
      render(<CoursePlatform />);
      expect(screen.getByLabelText('Filter by category')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by difficulty')).toBeInTheDocument();
      expect(screen.getByLabelText('Filter by price')).toBeInTheDocument();
    });

    test('renders course catalog by default', () => {
      render(<CoursePlatform />);
      expect(screen.getByText('Course Catalog')).toBeInTheDocument();
      expect(screen.getByText('Complete React Masterclass')).toBeInTheDocument();
      expect(screen.getByText('Python for Data Science')).toBeInTheDocument();
    });

    test('renders learning streak in sidebar', () => {
      render(<CoursePlatform />);
      expect(screen.getByText(/days/)).toBeInTheDocument();
      expect(screen.getByText(/total learning/)).toBeInTheDocument();
    });

    test('renders notes button in header', () => {
      render(<CoursePlatform />);
      expect(screen.getByLabelText('Open notes')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('renders theme toggle button', () => {
      render(<CoursePlatform />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<CoursePlatform />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('coursePlatformTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<CoursePlatform />);
      const themeButton = screen.getByLabelText('Toggle theme');
      fireEvent.click(themeButton);
      fireEvent.click(themeButton);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('coursePlatformTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'coursePlatformTheme') return 'dark';
        return null;
      });
      render(<CoursePlatform />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Sidebar Navigation', () => {
    test('clicking Course Catalog shows catalog view', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Course Catalog'));
      expect(screen.getByText('Complete React Masterclass')).toBeInTheDocument();
    });

    test('clicking My Courses shows enrolled courses', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      // Should show enrolled courses (c1, c2, c3, c6 are enrolled by default)
      expect(screen.getByText('Complete React Masterclass')).toBeInTheDocument();
      expect(screen.getByText('Python for Data Science')).toBeInTheDocument();
    });

    test('clicking Progress shows progress view', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Progress'));
      expect(screen.getByText('Learning Progress')).toBeInTheDocument();
    });

    test('clicking Bookmarks shows bookmarks view', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Bookmarks'));
      expect(screen.getByText('Bookmarked Lessons')).toBeInTheDocument();
    });

    test('clicking Certificates shows certificates view', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Certificates'));
      expect(screen.getByText('Certificates')).toBeInTheDocument();
    });

    test('clicking Instructors shows instructor cards', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Instructors'));
      expect(screen.getByText('Sarah Miller')).toBeInTheDocument();
      expect(screen.getByText('James Park')).toBeInTheDocument();
      expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
    });

    test('saves active view to localStorage on navigation', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Progress'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('coursePlatformView', 'progress');
    });
  });

  describe('Sidebar Collapse/Expand', () => {
    test('renders toggle sidebar button', () => {
      render(<CoursePlatform />);
      expect(screen.getByLabelText('Toggle sidebar')).toBeInTheDocument();
    });

    test('collapsing sidebar hides navigation labels', () => {
      render(<CoursePlatform />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      expect(screen.queryByText('Course Catalog')).not.toBeInTheDocument();
      expect(screen.queryByText('My Courses')).not.toBeInTheDocument();
    });

    test('expanding sidebar shows navigation labels again', () => {
      render(<CoursePlatform />);
      const toggleButton = screen.getByLabelText('Toggle sidebar');
      fireEvent.click(toggleButton);
      fireEvent.click(toggleButton);
      expect(screen.getByText('Course Catalog')).toBeInTheDocument();
    });
  });

  describe('Search Filtering', () => {
    test('search input filters courses by title', () => {
      render(<CoursePlatform />);
      const searchInput = screen.getByPlaceholderText('Search courses... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'React' } });
      expect(screen.getByText('Complete React Masterclass')).toBeInTheDocument();
      expect(screen.queryByText('Python for Data Science')).not.toBeInTheDocument();
    });

    test('search input filters courses by tags', () => {
      render(<CoursePlatform />);
      const searchInput = screen.getByPlaceholderText('Search courses... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'tensorflow' } });
      expect(screen.getByText('Advanced Machine Learning')).toBeInTheDocument();
    });

    test('search input filters courses by instructor name', () => {
      render(<CoursePlatform />);
      const searchInput = screen.getByPlaceholderText('Search courses... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'James Park' } });
      expect(screen.getByText('Python for Data Science')).toBeInTheDocument();
    });

    test('clearing search shows all courses again', () => {
      render(<CoursePlatform />);
      const searchInput = screen.getByPlaceholderText('Search courses... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'React' } });
      fireEvent.change(searchInput, { target: { value: '' } });
      expect(screen.getByText('Complete React Masterclass')).toBeInTheDocument();
      expect(screen.getByText('Python for Data Science')).toBeInTheDocument();
    });
  });

  describe('Category Filter', () => {
    test('filtering by data-science shows only data science courses', () => {
      render(<CoursePlatform />);
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'data-science' } });
      expect(screen.getByText('Python for Data Science')).toBeInTheDocument();
      expect(screen.getByText('Advanced Machine Learning')).toBeInTheDocument();
      expect(screen.queryByText('Complete React Masterclass')).not.toBeInTheDocument();
    });

    test('selecting All Categories shows all courses', () => {
      render(<CoursePlatform />);
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'data-science' } });
      fireEvent.change(categoryFilter, { target: { value: 'all' } });
      expect(screen.getByText('Complete React Masterclass')).toBeInTheDocument();
    });
  });

  describe('Difficulty Filter', () => {
    test('filtering by beginner shows only beginner courses', () => {
      render(<CoursePlatform />);
      const difficultyFilter = screen.getByLabelText('Filter by difficulty');
      fireEvent.change(difficultyFilter, { target: { value: 'beginner' } });
      expect(screen.getByText('Python for Data Science')).toBeInTheDocument();
      expect(screen.getByText('UI/UX Design Fundamentals')).toBeInTheDocument();
      expect(screen.queryByText('Advanced Machine Learning')).not.toBeInTheDocument();
    });
  });

  describe('Price Filter', () => {
    test('filtering by under50 shows courses under $50', () => {
      render(<CoursePlatform />);
      const priceFilter = screen.getByLabelText('Filter by price');
      fireEvent.change(priceFilter, { target: { value: 'under50' } });
      expect(screen.getByText('UI/UX Design Fundamentals')).toBeInTheDocument();
      expect(screen.getByText('Digital Marketing Strategy')).toBeInTheDocument();
      expect(screen.getByText('Business Analytics with Excel')).toBeInTheDocument();
      expect(screen.getByText('Complete React Masterclass')).toBeInTheDocument();
      expect(screen.queryByText('Python for Data Science')).not.toBeInTheDocument();
      expect(screen.queryByText('Advanced Machine Learning')).not.toBeInTheDocument();
    });
  });

  describe('Sort Controls', () => {
    test('sort dropdown is present', () => {
      render(<CoursePlatform />);
      expect(screen.getByLabelText('Sort courses')).toBeInTheDocument();
    });

    test('shows course count', () => {
      render(<CoursePlatform />);
      expect(screen.getByText('6 courses')).toBeInTheDocument();
    });
  });

  describe('Course Cards', () => {
    test('course cards display instructor info', () => {
      render(<CoursePlatform />);
      expect(screen.getByText('Sarah Miller')).toBeInTheDocument();
      expect(screen.getByText('James Park')).toBeInTheDocument();
    });

    test('course cards display price', () => {
      render(<CoursePlatform />);
      expect(screen.getByText('$49.99')).toBeInTheDocument();
      expect(screen.getByText('$59.99')).toBeInTheDocument();
    });

    test('course cards display difficulty badges', () => {
      render(<CoursePlatform />);
      const beginnerBadges = screen.getAllByText('beginner');
      expect(beginnerBadges.length).toBeGreaterThan(0);
    });

    test('course cards display enrolled badge for enrolled courses', () => {
      render(<CoursePlatform />);
      const enrolledBadges = screen.getAllByText('Enrolled');
      expect(enrolledBadges.length).toBeGreaterThan(0);
    });

    test('course cards display tags', () => {
      render(<CoursePlatform />);
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('javascript')).toBeInTheDocument();
    });
  });

  describe('Course Detail Modal', () => {
    test('clicking a course card opens detail modal', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Complete React Masterclass'));
      expect(screen.getByText('Course Content')).toBeInTheDocument();
    });

    test('modal shows course description', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Complete React Masterclass'));
      expect(screen.getByText(/Learn React from scratch/)).toBeInTheDocument();
    });

    test('modal shows instructor info', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Complete React Masterclass'));
      expect(screen.getByText('Web Development')).toBeInTheDocument();
    });

    test('modal shows module list', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Complete React Masterclass'));
      expect(screen.getByText(/Getting Started with React/)).toBeInTheDocument();
      expect(screen.getByText(/React Hooks Deep Dive/)).toBeInTheDocument();
      expect(screen.getByText(/State Management/)).toBeInTheDocument();
    });

    test('close button closes modal', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Complete React Masterclass'));
      expect(screen.getByText('Course Content')).toBeInTheDocument();
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
      expect(screen.queryByText('Course Content')).not.toBeInTheDocument();
    });

    test('enrolled course shows Continue Learning button', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Complete React Masterclass'));
      expect(screen.getByText('Continue Learning')).toBeInTheDocument();
    });

    test('non-enrolled course shows Enroll Now button', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Advanced Machine Learning'));
      expect(screen.getByText(/Enroll Now/)).toBeInTheDocument();
    });
  });

  describe('Enrollment', () => {
    test('enrolling in a course from modal', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Advanced Machine Learning'));
      const enrollButton = screen.getByText(/Enroll Now/);
      fireEvent.click(enrollButton);
      // After enrollment, modal should close
      // Navigate to My Courses to verify
      fireEvent.click(screen.getByText('My Courses'));
      expect(screen.getByText('Advanced Machine Learning')).toBeInTheDocument();
    });

    test('unenrolling from a course requires confirmation', () => {
      window.confirm.mockReturnValue(false);
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const unenrollButtons = screen.getAllByText('Unenroll');
      fireEvent.click(unenrollButtons[0]);
      expect(window.confirm).toHaveBeenCalled();
    });

    test('confirming unenroll removes course from my courses', () => {
      window.confirm.mockReturnValue(true);
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      // Count initial enrolled courses
      const initialContinueButtons = screen.getAllByText('Continue');
      const initialCount = initialContinueButtons.length;
      const unenrollButtons = screen.getAllByText('Unenroll');
      fireEvent.click(unenrollButtons[0]);
      // Should have one fewer enrolled course
      const finalContinueButtons = screen.queryAllByText('Continue');
      expect(finalContinueButtons.length).toBe(initialCount - 1);
    });
  });

  describe('My Courses View', () => {
    test('shows enrolled course list with progress', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      // Shows progress info for enrolled courses
      const completedText = screen.getAllByText(/lessons completed/);
      expect(completedText.length).toBeGreaterThan(0);
    });

    test('shows Continue button for enrolled courses', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      expect(continueButtons.length).toBeGreaterThan(0);
    });

    test('clicking Continue opens course detail', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      // Should show course content with module list
      expect(screen.getByText(/Back to/)).toBeInTheDocument();
    });
  });

  describe('Course Detail and Lesson Player', () => {
    test('clicking course detail back button returns to previous view', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      const backButton = screen.getByText(/Back to/);
      fireEvent.click(backButton);
      // Should be back at My Courses
      expect(screen.getByText('My Courses')).toBeInTheDocument();
    });

    test('course detail shows module list with lessons', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      // Should show module titles and lesson titles
      expect(screen.getByText('Getting Started with React')).toBeInTheDocument();
      expect(screen.getByText('Introduction to React')).toBeInTheDocument();
    });

    test('course detail shows progress bar for enrolled course', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      expect(screen.getByText('Course Progress')).toBeInTheDocument();
    });

    test('clicking a lesson opens the lesson player', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      // Click on a lesson
      fireEvent.click(screen.getByText('Introduction to React'));
      // Should show lesson player content
      expect(screen.getByText('Mark Complete')).toBeInTheDocument();
    });

    test('lesson player shows bookmark button', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      fireEvent.click(screen.getByText('Introduction to React'));
      // l1 is bookmarked by default, so it should show the bookmarked icon
      expect(screen.getByLabelText('Remove bookmark')).toBeInTheDocument();
    });

    test('toggling lesson completion updates the mark', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      // Click lesson l5 (not completed)
      fireEvent.click(screen.getByText('useState and useEffect'));
      const markButton = screen.getByText('Mark Complete');
      fireEvent.click(markButton);
      // Should now show as completed
      expect(screen.getByText(/Completed/)).toBeInTheDocument();
    });
  });

  describe('Notes', () => {
    test('lesson player shows notes section', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      fireEvent.click(screen.getByText('Introduction to React'));
      expect(screen.getByText('Lesson Notes')).toBeInTheDocument();
    });

    test('existing notes are displayed for the lesson', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      fireEvent.click(screen.getByText('Introduction to React'));
      expect(screen.getByText('React uses a virtual DOM for efficient updates')).toBeInTheDocument();
    });

    test('adding a note via Enter key', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      fireEvent.click(screen.getByText('Introduction to React'));
      const noteInput = screen.getByPlaceholderText('Add a note...');
      fireEvent.change(noteInput, { target: { value: 'Test note content' } });
      fireEvent.keyDown(noteInput, { key: 'Enter' });
      expect(screen.getByText('Test note content')).toBeInTheDocument();
    });

    test('adding a note via Add button', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      fireEvent.click(screen.getByText('Introduction to React'));
      const noteInput = screen.getByPlaceholderText('Add a note...');
      fireEvent.change(noteInput, { target: { value: 'Another test note' } });
      fireEvent.click(screen.getByText('Add'));
      expect(screen.getByText('Another test note')).toBeInTheDocument();
    });

    test('deleting a note removes it', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      fireEvent.click(screen.getByText('Introduction to React'));
      expect(screen.getByText('React uses a virtual DOM for efficient updates')).toBeInTheDocument();
      // Find the delete button (×) for the note
      const deleteButtons = screen.getAllByText('×');
      // Click the delete button for the first note
      fireEvent.click(deleteButtons[0]);
      expect(screen.queryByText('React uses a virtual DOM for efficient updates')).not.toBeInTheDocument();
    });

    test('opening notes panel shows all notes', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByLabelText('Open notes'));
      expect(screen.getByText('All Notes')).toBeInTheDocument();
      expect(screen.getByText('React uses a virtual DOM for efficient updates')).toBeInTheDocument();
      expect(screen.getByText('Python is dynamically typed')).toBeInTheDocument();
    });

    test('notes panel close button works', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByLabelText('Open notes'));
      expect(screen.getByText('All Notes')).toBeInTheDocument();
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      expect(screen.queryByText('All Notes')).not.toBeInTheDocument();
    });
  });

  describe('Bookmarks', () => {
    test('bookmarks view shows bookmarked lessons', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Bookmarks'));
      expect(screen.getByText('Bookmarked Lessons')).toBeInTheDocument();
      // l1 (Introduction to React) and l18 (Color Theory) are bookmarked by default
      expect(screen.getByText('Introduction to React')).toBeInTheDocument();
      expect(screen.getByText('Color Theory')).toBeInTheDocument();
    });

    test('removing a bookmark from bookmarks view', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Bookmarks'));
      const removeButtons = screen.getAllByText('Remove');
      fireEvent.click(removeButtons[0]);
      // One bookmark should be removed
      expect(screen.getAllByText('Remove').length).toBe(removeButtons.length - 1);
    });

    test('bookmarks persist to localStorage', () => {
      render(<CoursePlatform />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'bookmarkedLessons',
        expect.any(String)
      );
    });
  });

  describe('Progress View', () => {
    test('shows stats cards', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Progress'));
      expect(screen.getByText('Courses Enrolled')).toBeInTheDocument();
      expect(screen.getByText('Lessons Completed')).toBeInTheDocument();
      expect(screen.getByText('Hours Learned')).toBeInTheDocument();
      expect(screen.getByText('Day Streak')).toBeInTheDocument();
    });

    test('shows course-by-course progress table', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Progress'));
      expect(screen.getByText('Course-by-Course Progress')).toBeInTheDocument();
      expect(screen.getByText('Complete React Masterclass')).toBeInTheDocument();
    });

    test('shows correct enrolled course count', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Progress'));
      expect(screen.getByText('4')).toBeInTheDocument(); // 4 enrolled courses
    });
  });

  describe('Certificates View', () => {
    test('shows empty state when no courses completed', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Certificates'));
      expect(screen.getByText(/Complete a course to earn/)).toBeInTheDocument();
    });
  });

  describe('Instructors View', () => {
    test('renders all instructor cards', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Instructors'));
      expect(screen.getByText('Sarah Miller')).toBeInTheDocument();
      expect(screen.getByText('James Park')).toBeInTheDocument();
      expect(screen.getByText('Maria Garcia')).toBeInTheDocument();
      expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
      expect(screen.getByText('Emily Chen')).toBeInTheDocument();
    });

    test('shows instructor specialties', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Instructors'));
      expect(screen.getByText('Web Development')).toBeInTheDocument();
      expect(screen.getByText('Data Science')).toBeInTheDocument();
      expect(screen.getByText('UI/UX Design')).toBeInTheDocument();
    });

    test('shows instructor stats', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Instructors'));
      const coursesLabels = screen.getAllByText('Courses');
      expect(coursesLabels.length).toBeGreaterThan(0);
      const studentsLabels = screen.getAllByText('Students');
      expect(studentsLabels.length).toBeGreaterThan(0);
    });
  });

  describe('Reviews', () => {
    test('course detail shows reviews section', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      expect(screen.getByText(/Reviews/)).toBeInTheDocument();
      expect(screen.getByText('Excellent course! Very thorough.')).toBeInTheDocument();
    });

    test('Write Review button opens review modal for enrolled courses', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      fireEvent.click(screen.getByText('Write Review'));
      expect(screen.getByText('Write a Review')).toBeInTheDocument();
    });

    test('review modal has rating buttons', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      fireEvent.click(screen.getByText('Write Review'));
      expect(screen.getByLabelText('Rate 1 stars')).toBeInTheDocument();
      expect(screen.getByLabelText('Rate 5 stars')).toBeInTheDocument();
    });

    test('submitting a review adds it to the list', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      fireEvent.click(screen.getByText('Write Review'));
      const textarea = screen.getByPlaceholderText('Share your experience with this course...');
      fireEvent.change(textarea, { target: { value: 'Great learning experience!' } });
      fireEvent.click(screen.getByText('Submit Review'));
      // Review modal should close and review should be added
      expect(screen.getByText('Great learning experience!')).toBeInTheDocument();
    });

    test('review modal cancel button closes it', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      fireEvent.click(screen.getByText('Write Review'));
      expect(screen.getByText('Write a Review')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Write a Review')).not.toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape key closes course detail modal', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('Complete React Masterclass'));
      expect(screen.getByText('Course Content')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Course Content')).not.toBeInTheDocument();
    });

    test('Escape key closes review modal', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      const continueButtons = screen.getAllByText('Continue');
      fireEvent.click(continueButtons[0]);
      fireEvent.click(screen.getByText('Write Review'));
      expect(screen.getByText('Write a Review')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Write a Review')).not.toBeInTheDocument();
    });

    test('Escape key closes notes panel', () => {
      render(<CoursePlatform />);
      fireEvent.click(screen.getByLabelText('Open notes'));
      expect(screen.getByText('All Notes')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('All Notes')).not.toBeInTheDocument();
    });
  });

  describe('localStorage Persistence', () => {
    test('enrolled courses are saved to localStorage', () => {
      render(<CoursePlatform />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'enrolledCourses',
        expect.any(String)
      );
    });

    test('notes are saved to localStorage', () => {
      render(<CoursePlatform />);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'studentNotes',
        expect.any(String)
      );
    });

    test('saved enrolled courses are loaded from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'enrolledCourses') return JSON.stringify(['c5']);
        return null;
      });
      render(<CoursePlatform />);
      fireEvent.click(screen.getByText('My Courses'));
      expect(screen.getByText('Advanced Machine Learning')).toBeInTheDocument();
    });

    test('handles corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'enrolledCourses') return 'not valid json{{{';
        return null;
      });
      expect(() => render(<CoursePlatform />)).not.toThrow();
    });

    test('saved view is restored from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'coursePlatformView') return 'instructors';
        return null;
      });
      render(<CoursePlatform />);
      expect(screen.getByText('Sarah Miller')).toBeInTheDocument();
    });
  });

  describe('Combined Filters', () => {
    test('search and category filter work together', () => {
      render(<CoursePlatform />);
      const searchInput = screen.getByPlaceholderText('Search courses... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'Python' } });
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'data-science' } });
      expect(screen.getByText('Python for Data Science')).toBeInTheDocument();
    });

    test('non-matching combined filters show no courses', () => {
      render(<CoursePlatform />);
      const searchInput = screen.getByPlaceholderText('Search courses... (Ctrl+K)');
      fireEvent.change(searchInput, { target: { value: 'React' } });
      const categoryFilter = screen.getByLabelText('Filter by category');
      fireEvent.change(categoryFilter, { target: { value: 'data-science' } });
      expect(screen.queryByText('Complete React Masterclass')).not.toBeInTheDocument();
      expect(screen.queryByText('Python for Data Science')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<CoursePlatform />)).not.toThrow();
    });
  });
});
