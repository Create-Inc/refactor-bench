import { describe, test, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import PropertyListingWizard from './src/app/page.jsx';

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

describe('PropertyListingWizard', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial Rendering', () => {
    test('renders header with PropertyList branding', () => {
      render(<PropertyListingWizard />);
      expect(screen.getByText(/PropertyList/)).toBeInTheDocument();
      expect(screen.getByText('Create New Listing')).toBeInTheDocument();
    });

    test('renders all step navigation buttons', () => {
      render(<PropertyListingWizard />);
      expect(screen.getByText('Property Details')).toBeInTheDocument();
      expect(screen.getByText('Photos & Media')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
      expect(screen.getByText('Location')).toBeInTheDocument();
      expect(screen.getByText('Review & Submit')).toBeInTheDocument();
    });

    test('starts on step 1 (Property Details)', () => {
      render(<PropertyListingWizard />);
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
      expect(screen.getByLabelText('Listing title')).toBeInTheDocument();
    });

    test('renders 0% progress initially', () => {
      render(<PropertyListingWizard />);
      expect(screen.getByText('0% complete')).toBeInTheDocument();
    });

    test('renders header action buttons', () => {
      render(<PropertyListingWizard />);
      expect(screen.getByLabelText('Save draft')).toBeInTheDocument();
      expect(screen.getByLabelText('Preview listing')).toBeInTheDocument();
      expect(screen.getByLabelText('Discard listing')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('renders Previous and Next navigation buttons', () => {
      render(<PropertyListingWizard />);
      expect(screen.getByText('← Previous')).toBeInTheDocument();
      expect(screen.getByText('Next →')).toBeInTheDocument();
    });

    test('Previous button is disabled on first step', () => {
      render(<PropertyListingWizard />);
      const prevButton = screen.getByText('← Previous');
      expect(prevButton).toBeDisabled();
    });
  });

  describe('Step 1: Property Details', () => {
    test('renders all required fields', () => {
      render(<PropertyListingWizard />);
      expect(screen.getByLabelText('Listing title')).toBeInTheDocument();
      expect(screen.getByLabelText('Property description')).toBeInTheDocument();
      expect(screen.getByLabelText('Property type')).toBeInTheDocument();
      expect(screen.getByLabelText('Listing type')).toBeInTheDocument();
      expect(screen.getByLabelText('Number of bedrooms')).toBeInTheDocument();
      expect(screen.getByLabelText('Number of bathrooms')).toBeInTheDocument();
      expect(screen.getByLabelText('Square footage')).toBeInTheDocument();
    });

    test('title field has character counter showing 0/100', () => {
      render(<PropertyListingWizard />);
      expect(screen.getByText('0/100')).toBeInTheDocument();
    });

    test('typing in title updates character counter', () => {
      render(<PropertyListingWizard />);
      const titleInput = screen.getByLabelText('Listing title');
      fireEvent.change(titleInput, { target: { value: 'Beautiful Home' } });
      expect(screen.getByText('14/100')).toBeInTheDocument();
    });

    test('description field has character counter showing 0/2000', () => {
      render(<PropertyListingWizard />);
      expect(screen.getByText('0/2000')).toBeInTheDocument();
    });

    test('property type defaults to house', () => {
      render(<PropertyListingWizard />);
      const typeSelect = screen.getByLabelText('Property type');
      expect(typeSelect.value).toBe('house');
    });

    test('listing type defaults to sale', () => {
      render(<PropertyListingWizard />);
      const typeSelect = screen.getByLabelText('Listing type');
      expect(typeSelect.value).toBe('sale');
    });

    test('changing property type to land hides bedrooms and bathrooms', () => {
      render(<PropertyListingWizard />);
      const typeSelect = screen.getByLabelText('Property type');
      fireEvent.change(typeSelect, { target: { value: 'land' } });
      expect(screen.queryByLabelText('Number of bedrooms')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Number of bathrooms')).not.toBeInTheDocument();
    });

    test('changing property type to commercial hides bedrooms but shows bathrooms', () => {
      render(<PropertyListingWizard />);
      const typeSelect = screen.getByLabelText('Property type');
      fireEvent.change(typeSelect, { target: { value: 'commercial' } });
      expect(screen.queryByLabelText('Number of bedrooms')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Number of bathrooms')).toBeInTheDocument();
    });

    test('condition and furnishing selects are rendered', () => {
      render(<PropertyListingWizard />);
      expect(screen.getByLabelText('Property condition')).toBeInTheDocument();
      expect(screen.getByLabelText('Furnishing status')).toBeInTheDocument();
    });

    test('lot size and year built fields are rendered', () => {
      render(<PropertyListingWizard />);
      expect(screen.getByLabelText('Lot size')).toBeInTheDocument();
      expect(screen.getByLabelText('Year built')).toBeInTheDocument();
    });

    test('year built is hidden for land property type', () => {
      render(<PropertyListingWizard />);
      const typeSelect = screen.getByLabelText('Property type');
      fireEvent.change(typeSelect, { target: { value: 'land' } });
      expect(screen.queryByLabelText('Year built')).not.toBeInTheDocument();
    });

    test('amenities dropdown opens and closes', () => {
      render(<PropertyListingWizard />);
      const amenitiesButton = screen.getByLabelText('Select amenities');
      fireEvent.click(amenitiesButton);
      expect(screen.getByText('Swimming Pool')).toBeInTheDocument();
      expect(screen.getByText('Garage')).toBeInTheDocument();
      fireEvent.click(amenitiesButton);
      expect(screen.queryByText('Swimming Pool')).not.toBeInTheDocument();
    });

    test('selecting amenities shows count and tags', () => {
      render(<PropertyListingWizard />);
      const amenitiesButton = screen.getByLabelText('Select amenities');
      fireEvent.click(amenitiesButton);
      fireEvent.click(screen.getByText('Swimming Pool'));
      fireEvent.click(screen.getByText('Garage'));
      expect(screen.getByText('2 selected')).toBeInTheDocument();
    });

    test('removing an amenity tag updates the count', () => {
      render(<PropertyListingWizard />);
      const amenitiesButton = screen.getByLabelText('Select amenities');
      fireEvent.click(amenitiesButton);
      fireEvent.click(screen.getByText('Swimming Pool'));
      fireEvent.click(screen.getByText('Garage'));
      // Close the dropdown to see tags clearly
      fireEvent.click(amenitiesButton);
      const removeButton = screen.getByLabelText('Remove Swimming Pool');
      fireEvent.click(removeButton);
      expect(screen.getByText('1 selected')).toBeInTheDocument();
    });

    test('amenities dropdown hidden for land property type', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Property type'), { target: { value: 'land' } });
      expect(screen.queryByLabelText('Select amenities')).not.toBeInTheDocument();
    });

    test('estimated value appears when bedrooms and sqft are filled', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Number of bedrooms'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '2000' } });
      expect(screen.getByText('Estimated Market Value')).toBeInTheDocument();
    });

    test('estimated value is not shown with incomplete inputs', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '2000' } });
      expect(screen.queryByText('Estimated Market Value')).not.toBeInTheDocument();
    });
  });

  describe('Step 1 Validation', () => {
    test('shows error when title is empty and Next is clicked', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    test('shows error when title is too short', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Short' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Title must be at least 10 characters')).toBeInTheDocument();
    });

    test('shows error when description is empty', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'A Beautiful Property Listing' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Description is required')).toBeInTheDocument();
    });

    test('shows error when description is too short', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'A Beautiful Property Listing' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'Short description.' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Description must be at least 30 characters')).toBeInTheDocument();
    });

    test('shows error when bedrooms is empty for house', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'A Beautiful Property Listing' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'This is a detailed description of the property with many features.' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Number of bedrooms is required')).toBeInTheDocument();
    });

    test('clears error on field change', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Title is required')).toBeInTheDocument();
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Updated Title with enough chars' } });
      expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
    });
  });

  describe('Step Navigation', () => {
    const fillStep1 = () => {
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Beautiful 3BR Home with Pool Downtown' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'This is a stunning three bedroom home with modern amenities and a beautiful pool.' } });
      fireEvent.change(screen.getByLabelText('Number of bedrooms'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Number of bathrooms'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '2000' } });
    };

    test('advances to step 2 when step 1 is valid', () => {
      render(<PropertyListingWizard />);
      fillStep1();
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
      expect(screen.getByText('Photos & Media')).toBeInTheDocument();
      expect(screen.getByLabelText('Upload photos')).toBeInTheDocument();
    });

    test('going back from step 2 returns to step 1', () => {
      render(<PropertyListingWizard />);
      fillStep1();
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Step 2 of 5')).toBeInTheDocument();
      fireEvent.click(screen.getByText('← Previous'));
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    });

    test('step 1 data is preserved when navigating back', () => {
      render(<PropertyListingWizard />);
      fillStep1();
      fireEvent.click(screen.getByText('Next →'));
      fireEvent.click(screen.getByText('← Previous'));
      expect(screen.getByLabelText('Listing title').value).toBe('Beautiful 3BR Home with Pool Downtown');
    });

    test('progress updates after completing step 1', () => {
      render(<PropertyListingWizard />);
      fillStep1();
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('20% complete')).toBeInTheDocument();
    });

    test('cannot skip ahead to step 3 without completing step 2', () => {
      render(<PropertyListingWizard />);
      fillStep1();
      fireEvent.click(screen.getByText('Next →'));
      // Click step 3 button in navigation
      fireEvent.click(screen.getByLabelText('Go to Pricing'));
      // Should show validation error for step 2, not advance
      expect(screen.getByText('At least one photo is required')).toBeInTheDocument();
    });
  });

  describe('Step 2: Photos & Media', () => {
    const goToStep2 = () => {
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Beautiful 3BR Home with Pool Downtown' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'This is a stunning three bedroom home with modern amenities and a beautiful pool.' } });
      fireEvent.change(screen.getByLabelText('Number of bedrooms'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Number of bathrooms'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '2000' } });
      fireEvent.click(screen.getByText('Next →'));
    };

    test('renders photo upload area', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      expect(screen.getByLabelText('Upload photos')).toBeInTheDocument();
      expect(screen.getByText('Click to add photos')).toBeInTheDocument();
    });

    test('clicking upload area adds a photo', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      fireEvent.click(screen.getByLabelText('Upload photos'));
      expect(screen.getByText('Primary')).toBeInTheDocument();
    });

    test('first photo is automatically marked as primary', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      fireEvent.click(screen.getByLabelText('Upload photos'));
      expect(screen.getByText('Primary')).toBeInTheDocument();
    });

    test('removing a photo works', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      fireEvent.click(screen.getByLabelText('Upload photos'));
      expect(screen.getByText('Primary')).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Remove photo 1'));
      expect(screen.queryByText('Primary')).not.toBeInTheDocument();
    });

    test('setting a new primary photo works', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      fireEvent.click(screen.getByLabelText('Upload photos'));
      fireEvent.click(screen.getByLabelText('Upload photos'));
      // Second photo should have a "Set Primary" button
      fireEvent.click(screen.getByText('Set Primary'));
      // Should now have Primary on the second photo
      expect(screen.getByText('Primary')).toBeInTheDocument();
    });

    test('photo caption can be edited', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      fireEvent.click(screen.getByLabelText('Upload photos'));
      const captionInput = screen.getByLabelText('Caption for photo 1');
      fireEvent.change(captionInput, { target: { value: 'Front view of the house' } });
      expect(captionInput.value).toBe('Front view of the house');
    });

    test('clicking a photo opens preview modal', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      fireEvent.click(screen.getByLabelText('Upload photos'));
      // Click the photo thumbnail (the 🖼️ emoji area)
      const photoThumbnails = screen.getAllByText('🖼️');
      fireEvent.click(photoThumbnails[0]);
      expect(screen.getByText('Photo 1')).toBeInTheDocument();
    });

    test('photo preview modal closes with X button', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      fireEvent.click(screen.getByLabelText('Upload photos'));
      const photoThumbnails = screen.getAllByText('🖼️');
      fireEvent.click(photoThumbnails[0]);
      expect(screen.getByText('Photo 1')).toBeInTheDocument();
      fireEvent.click(screen.getByText('×'));
      // The modal should close (Photo 1 heading disappears)
      expect(screen.queryByText(/★ Primary Photo/)).not.toBeInTheDocument();
    });

    test('virtual tour URL field is rendered', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      expect(screen.getByLabelText('Virtual tour URL')).toBeInTheDocument();
    });

    test('video tour URL field is rendered', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      expect(screen.getByLabelText('Video tour URL')).toBeInTheDocument();
    });

    test('floor plan URL field is rendered', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      expect(screen.getByLabelText('Floor plan URL')).toBeInTheDocument();
    });

    test('shows validation error for invalid virtual tour URL', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      fireEvent.click(screen.getByLabelText('Upload photos'));
      fireEvent.change(screen.getByLabelText('Virtual tour URL'), { target: { value: 'not-a-url' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Please enter a valid URL')).toBeInTheDocument();
    });

    test('no photos validation error when clicking Next', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('At least one photo is required')).toBeInTheDocument();
    });

    test('photo count updates correctly', () => {
      render(<PropertyListingWizard />);
      goToStep2();
      expect(screen.getByText(/0\/20/)).toBeInTheDocument();
      fireEvent.click(screen.getByLabelText('Upload photos'));
      expect(screen.getByText(/1\/20/)).toBeInTheDocument();
    });
  });

  describe('Step 3: Pricing', () => {
    const goToStep3 = () => {
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Beautiful 3BR Home with Pool Downtown' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'This is a stunning three bedroom home with modern amenities and a beautiful pool.' } });
      fireEvent.change(screen.getByLabelText('Number of bedrooms'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Number of bathrooms'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '2000' } });
      fireEvent.click(screen.getByText('Next →'));
      // Step 2 - add a photo and continue
      fireEvent.click(screen.getByLabelText('Upload photos'));
      fireEvent.click(screen.getByText('Next →'));
    };

    test('renders price input and currency selector', () => {
      render(<PropertyListingWizard />);
      goToStep3();
      expect(screen.getByLabelText('Price')).toBeInTheDocument();
      expect(screen.getByLabelText('Currency')).toBeInTheDocument();
    });

    test('price label shows "Asking Price" for sale listings', () => {
      render(<PropertyListingWizard />);
      goToStep3();
      expect(screen.getByText('Asking Price *')).toBeInTheDocument();
    });

    test('rental frequency is hidden for sale listings', () => {
      render(<PropertyListingWizard />);
      goToStep3();
      expect(screen.queryByLabelText('Rental frequency')).not.toBeInTheDocument();
    });

    test('price negotiable checkbox works', () => {
      render(<PropertyListingWizard />);
      goToStep3();
      const checkbox = screen.getByText('Price is negotiable');
      fireEvent.click(checkbox);
      expect(screen.getByText('Price is negotiable').previousSibling || screen.getByText('Price is negotiable').parentElement.querySelector('input')).toBeTruthy();
    });

    test('HOA fees and property tax fields are rendered', () => {
      render(<PropertyListingWizard />);
      goToStep3();
      expect(screen.getByLabelText('HOA fees')).toBeInTheDocument();
      expect(screen.getByLabelText('Property tax')).toBeInTheDocument();
    });

    test('price validation shows error when empty', () => {
      render(<PropertyListingWizard />);
      goToStep3();
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Price is required')).toBeInTheDocument();
    });

    test('price analysis appears when price and estimated value are set', () => {
      render(<PropertyListingWizard />);
      goToStep3();
      fireEvent.change(screen.getByLabelText('Price'), { target: { value: '500000' } });
      expect(screen.getByText('Price Analysis')).toBeInTheDocument();
    });

    test('currency selector defaults to USD', () => {
      render(<PropertyListingWizard />);
      goToStep3();
      expect(screen.getByLabelText('Currency').value).toBe('USD');
    });
  });

  describe('Step 3: Rental-Specific Fields', () => {
    test('rental frequency appears for rent listings', () => {
      render(<PropertyListingWizard />);
      // Change to rent on step 1
      fireEvent.change(screen.getByLabelText('Listing type'), { target: { value: 'rent' } });
      // Fill step 1
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Beautiful 3BR Home for Rent Downtown' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'This is a stunning three bedroom home with modern amenities available for rent.' } });
      fireEvent.change(screen.getByLabelText('Number of bedrooms'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Number of bathrooms'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '2000' } });
      fireEvent.click(screen.getByText('Next →'));
      // Step 2
      fireEvent.click(screen.getByLabelText('Upload photos'));
      fireEvent.click(screen.getByText('Next →'));
      // Step 3 - should show rental-specific fields
      expect(screen.getByLabelText('Rental frequency')).toBeInTheDocument();
      expect(screen.getByLabelText('Security deposit')).toBeInTheDocument();
    });

    test('security deposit is required for rentals', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Listing type'), { target: { value: 'rent' } });
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Beautiful 3BR Home for Rent Downtown' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'This is a stunning three bedroom home with modern amenities available for rent.' } });
      fireEvent.change(screen.getByLabelText('Number of bedrooms'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Number of bathrooms'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '2000' } });
      fireEvent.click(screen.getByText('Next →'));
      fireEvent.click(screen.getByLabelText('Upload photos'));
      fireEvent.click(screen.getByText('Next →'));
      // Fill price but not security deposit
      fireEvent.change(screen.getByLabelText('Price'), { target: { value: '3000' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Security deposit is required for rentals')).toBeInTheDocument();
    });

    test('price label shows "Monthly Rent" for rent listings', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Listing type'), { target: { value: 'rent' } });
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Beautiful 3BR Home for Rent Downtown' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'This is a stunning three bedroom home with modern amenities available for rent.' } });
      fireEvent.change(screen.getByLabelText('Number of bedrooms'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Number of bathrooms'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '2000' } });
      fireEvent.click(screen.getByText('Next →'));
      fireEvent.click(screen.getByLabelText('Upload photos'));
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Monthly Rent *')).toBeInTheDocument();
    });
  });

  describe('Step 4: Location & Contact', () => {
    const goToStep4 = () => {
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Beautiful 3BR Home with Pool Downtown' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'This is a stunning three bedroom home with modern amenities and a beautiful pool.' } });
      fireEvent.change(screen.getByLabelText('Number of bedrooms'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Number of bathrooms'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '2000' } });
      fireEvent.click(screen.getByText('Next →'));
      fireEvent.click(screen.getByLabelText('Upload photos'));
      fireEvent.click(screen.getByText('Next →'));
      fireEvent.change(screen.getByLabelText('Price'), { target: { value: '500000' } });
      fireEvent.click(screen.getByText('Next →'));
    };

    test('renders address fields', () => {
      render(<PropertyListingWizard />);
      goToStep4();
      expect(screen.getByLabelText('Street address')).toBeInTheDocument();
      expect(screen.getByLabelText('Unit number')).toBeInTheDocument();
      expect(screen.getByLabelText('City')).toBeInTheDocument();
      expect(screen.getByLabelText('State')).toBeInTheDocument();
      expect(screen.getByLabelText('ZIP code')).toBeInTheDocument();
      expect(screen.getByLabelText('Country')).toBeInTheDocument();
    });

    test('renders neighborhood selector', () => {
      render(<PropertyListingWizard />);
      goToStep4();
      expect(screen.getByLabelText('Neighborhood')).toBeInTheDocument();
    });

    test('renders latitude and longitude fields', () => {
      render(<PropertyListingWizard />);
      goToStep4();
      expect(screen.getByLabelText('Latitude')).toBeInTheDocument();
      expect(screen.getByLabelText('Longitude')).toBeInTheDocument();
    });

    test('renders nearby schools and transport fields', () => {
      render(<PropertyListingWizard />);
      goToStep4();
      expect(screen.getByLabelText('Nearby schools')).toBeInTheDocument();
      expect(screen.getByLabelText('Nearby transport')).toBeInTheDocument();
    });

    test('show address checkbox is checked by default', () => {
      render(<PropertyListingWizard />);
      goToStep4();
      expect(screen.getByText('Show exact address in listing')).toBeInTheDocument();
    });

    test('renders contact information section', () => {
      render(<PropertyListingWizard />);
      goToStep4();
      expect(screen.getByText('Contact Information')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact name')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact email')).toBeInTheDocument();
      expect(screen.getByLabelText('Contact phone')).toBeInTheDocument();
    });

    test('validates required address fields', () => {
      render(<PropertyListingWizard />);
      goToStep4();
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Address is required')).toBeInTheDocument();
      expect(screen.getByText('City is required')).toBeInTheDocument();
      expect(screen.getByText('State is required')).toBeInTheDocument();
      expect(screen.getByText('ZIP code is required')).toBeInTheDocument();
    });

    test('validates ZIP code format', () => {
      render(<PropertyListingWizard />);
      goToStep4();
      fireEvent.change(screen.getByLabelText('Street address'), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText('City'), { target: { value: 'San Francisco' } });
      fireEvent.change(screen.getByLabelText('State'), { target: { value: 'CA' } });
      fireEvent.change(screen.getByLabelText('ZIP code'), { target: { value: 'invalid' } });
      fireEvent.change(screen.getByLabelText('Contact name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Contact email'), { target: { value: 'john@example.com' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Invalid ZIP code format')).toBeInTheDocument();
    });

    test('validates email format', () => {
      render(<PropertyListingWizard />);
      goToStep4();
      fireEvent.change(screen.getByLabelText('Street address'), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText('City'), { target: { value: 'San Francisco' } });
      fireEvent.change(screen.getByLabelText('State'), { target: { value: 'CA' } });
      fireEvent.change(screen.getByLabelText('ZIP code'), { target: { value: '94102' } });
      fireEvent.change(screen.getByLabelText('Contact name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Contact email'), { target: { value: 'not-an-email' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    });

    test('validates required contact fields', () => {
      render(<PropertyListingWizard />);
      goToStep4();
      fireEvent.change(screen.getByLabelText('Street address'), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText('City'), { target: { value: 'San Francisco' } });
      fireEvent.change(screen.getByLabelText('State'), { target: { value: 'CA' } });
      fireEvent.change(screen.getByLabelText('ZIP code'), { target: { value: '94102' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Contact name is required')).toBeInTheDocument();
      expect(screen.getByText('Contact email is required')).toBeInTheDocument();
    });
  });

  describe('Step 5: Review & Submit', () => {
    const goToStep5 = () => {
      // Step 1
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Beautiful 3BR Home with Pool Downtown' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'This is a stunning three bedroom home with modern amenities and a beautiful pool.' } });
      fireEvent.change(screen.getByLabelText('Number of bedrooms'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Number of bathrooms'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '2000' } });
      fireEvent.click(screen.getByText('Next →'));
      // Step 2
      fireEvent.click(screen.getByLabelText('Upload photos'));
      fireEvent.click(screen.getByText('Next →'));
      // Step 3
      fireEvent.change(screen.getByLabelText('Price'), { target: { value: '500000' } });
      fireEvent.click(screen.getByText('Next →'));
      // Step 4
      fireEvent.change(screen.getByLabelText('Street address'), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText('City'), { target: { value: 'San Francisco' } });
      fireEvent.change(screen.getByLabelText('State'), { target: { value: 'CA' } });
      fireEvent.change(screen.getByLabelText('ZIP code'), { target: { value: '94102' } });
      fireEvent.change(screen.getByLabelText('Contact name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Contact email'), { target: { value: 'john@example.com' } });
      fireEvent.click(screen.getByText('Next →'));
    };

    test('renders review sections for all steps', () => {
      render(<PropertyListingWizard />);
      goToStep5();
      expect(screen.getByText(/Property Details/)).toBeInTheDocument();
      expect(screen.getByText(/Photos & Media/)).toBeInTheDocument();
      expect(screen.getByText(/Pricing/)).toBeInTheDocument();
      expect(screen.getByText(/Location/)).toBeInTheDocument();
    });

    test('shows property title in review', () => {
      render(<PropertyListingWizard />);
      goToStep5();
      expect(screen.getByText('Beautiful 3BR Home with Pool Downtown')).toBeInTheDocument();
    });

    test('shows photo count in review', () => {
      render(<PropertyListingWizard />);
      goToStep5();
      expect(screen.getByText('1 uploaded')).toBeInTheDocument();
    });

    test('shows price in review', () => {
      render(<PropertyListingWizard />);
      goToStep5();
      expect(screen.getByText('$500,000')).toBeInTheDocument();
    });

    test('shows address in review', () => {
      render(<PropertyListingWizard />);
      goToStep5();
      expect(screen.getByText('123 Main St')).toBeInTheDocument();
      expect(screen.getByText(/San Francisco/)).toBeInTheDocument();
    });

    test('shows contact info in review', () => {
      render(<PropertyListingWizard />);
      goToStep5();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    test('edit buttons navigate to respective steps', () => {
      render(<PropertyListingWizard />);
      goToStep5();
      const editButtons = screen.getAllByText('Edit');
      // Click first Edit (Property Details)
      fireEvent.click(editButtons[0]);
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    });

    test('shows terms acceptance checkbox', () => {
      render(<PropertyListingWizard />);
      goToStep5();
      expect(screen.getByText(/I confirm that all information provided is accurate/)).toBeInTheDocument();
    });

    test('submit button is present on step 5', () => {
      render(<PropertyListingWizard />);
      goToStep5();
      expect(screen.getByText('✓ Submit Listing')).toBeInTheDocument();
    });

    test('shows error if terms not accepted on submit', () => {
      render(<PropertyListingWizard />);
      goToStep5();
      fireEvent.click(screen.getByText('✓ Submit Listing'));
      expect(screen.getByText('You must accept the terms and conditions')).toBeInTheDocument();
    });

    test('progress shows 80% on step 5', () => {
      render(<PropertyListingWizard />);
      goToStep5();
      expect(screen.getByText('80% complete')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    const goToStep5AndAcceptTerms = () => {
      // Step 1
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Beautiful 3BR Home with Pool Downtown' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'This is a stunning three bedroom home with modern amenities and a beautiful pool.' } });
      fireEvent.change(screen.getByLabelText('Number of bedrooms'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Number of bathrooms'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '2000' } });
      fireEvent.click(screen.getByText('Next →'));
      // Step 2
      fireEvent.click(screen.getByLabelText('Upload photos'));
      fireEvent.click(screen.getByText('Next →'));
      // Step 3
      fireEvent.change(screen.getByLabelText('Price'), { target: { value: '500000' } });
      fireEvent.click(screen.getByText('Next →'));
      // Step 4
      fireEvent.change(screen.getByLabelText('Street address'), { target: { value: '123 Main St' } });
      fireEvent.change(screen.getByLabelText('City'), { target: { value: 'San Francisco' } });
      fireEvent.change(screen.getByLabelText('State'), { target: { value: 'CA' } });
      fireEvent.change(screen.getByLabelText('ZIP code'), { target: { value: '94102' } });
      fireEvent.change(screen.getByLabelText('Contact name'), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText('Contact email'), { target: { value: 'john@example.com' } });
      fireEvent.click(screen.getByText('Next →'));
      // Step 5 - accept terms
      const termsCheckbox = screen.getByText(/I confirm that all information provided is accurate/).parentElement.querySelector('input');
      fireEvent.click(termsCheckbox);
    };

    test('submit shows submitting state', () => {
      render(<PropertyListingWizard />);
      goToStep5AndAcceptTerms();
      fireEvent.click(screen.getByText('✓ Submit Listing'));
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });

    test('successful submission shows confirmation screen', () => {
      render(<PropertyListingWizard />);
      goToStep5AndAcceptTerms();
      fireEvent.click(screen.getByText('✓ Submit Listing'));
      vi.advanceTimersByTime(2000);
      expect(screen.getByText('Listing Submitted!')).toBeInTheDocument();
      expect(screen.getByText(/Beautiful 3BR Home with Pool Downtown/)).toBeInTheDocument();
      expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    });

    test('Create Another Listing button resets form', () => {
      render(<PropertyListingWizard />);
      goToStep5AndAcceptTerms();
      fireEvent.click(screen.getByText('✓ Submit Listing'));
      vi.advanceTimersByTime(2000);
      fireEvent.click(screen.getByText('Create Another Listing'));
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
      expect(screen.getByLabelText('Listing title').value).toBe('');
    });

    test('submission clears draft from localStorage', () => {
      render(<PropertyListingWizard />);
      goToStep5AndAcceptTerms();
      fireEvent.click(screen.getByText('✓ Submit Listing'));
      vi.advanceTimersByTime(2000);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('propertyListingDraft');
    });
  });

  describe('Draft Save & Restore', () => {
    test('save draft button saves to localStorage', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Test Draft Title Here' } });
      fireEvent.click(screen.getByLabelText('Save draft'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('propertyListingDraft', expect.any(String));
    });

    test('save draft shows confirmation text', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Test Draft Title Here' } });
      fireEvent.click(screen.getByLabelText('Save draft'));
      expect(screen.getByText('✓ Saved')).toBeInTheDocument();
    });

    test('shows draft restore modal when draft exists on mount', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'propertyListingDraft') {
          return JSON.stringify({ formData: { ...{}, title: 'Saved Draft' }, currentStep: 1 });
        }
        return null;
      });
      render(<PropertyListingWizard />);
      expect(screen.getByText('Resume Draft?')).toBeInTheDocument();
    });

    test('Resume Draft button loads the saved data', () => {
      const savedData = {
        formData: { title: 'My Saved Property', description: 'A great property', propertyType: 'condo', listingType: 'sale', bedrooms: '2', bathrooms: '1', squareFeet: '1500', lotSize: '', yearBuilt: '', condition: 'good', furnishing: 'unfurnished', amenities: [], photos: [], virtualTourUrl: '', videoUrl: '', floorPlanUrl: '', price: '', currency: 'USD', priceNegotiable: false, rentalFrequency: 'monthly', securityDeposit: '', hoaFees: '', propertyTax: '', address: '', unit: '', city: '', state: '', zipCode: '', country: 'United States', neighborhood: '', latitude: '', longitude: '', nearbySchools: '', nearbyTransport: '', contactName: '', contactEmail: '', contactPhone: '', showAddress: true, acceptTerms: false },
        currentStep: 0,
        completedSteps: [],
      };
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'propertyListingDraft') return JSON.stringify(savedData);
        return null;
      });
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByText('Resume Draft'));
      expect(screen.getByLabelText('Listing title').value).toBe('My Saved Property');
    });

    test('Start Fresh button discards the draft', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'propertyListingDraft') {
          return JSON.stringify({ formData: { title: 'Old Draft' }, currentStep: 2 });
        }
        return null;
      });
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByText('Start Fresh'));
      expect(screen.queryByText('Resume Draft?')).not.toBeInTheDocument();
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('propertyListingDraft');
    });

    test('handles corrupted localStorage data gracefully', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'propertyListingDraft') return 'invalid json{{{';
        return null;
      });
      expect(() => render(<PropertyListingWizard />)).not.toThrow();
    });
  });

  describe('Discard Functionality', () => {
    test('discard button opens confirmation modal', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByLabelText('Discard listing'));
      expect(screen.getByText('Discard Listing?')).toBeInTheDocument();
      expect(screen.getByText('All progress will be lost. This action cannot be undone.')).toBeInTheDocument();
    });

    test('cancel in discard modal closes it', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByLabelText('Discard listing'));
      fireEvent.click(screen.getByText('Cancel'));
      expect(screen.queryByText('Discard Listing?')).not.toBeInTheDocument();
    });

    test('confirm discard resets the form', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Test title for discard test' } });
      fireEvent.click(screen.getByLabelText('Discard listing'));
      fireEvent.click(screen.getByText('Discard'));
      expect(screen.getByLabelText('Listing title').value).toBe('');
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument();
    });
  });

  describe('Preview Panel', () => {
    test('preview button opens side panel', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByLabelText('Preview listing'));
      expect(screen.getByText('Listing Preview')).toBeInTheDocument();
    });

    test('preview shows "Untitled Listing" when no title', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByLabelText('Preview listing'));
      expect(screen.getByText('Untitled Listing')).toBeInTheDocument();
    });

    test('preview shows form data', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'My Amazing Property For Sale' } });
      fireEvent.click(screen.getByLabelText('Preview listing'));
      expect(screen.getByText('My Amazing Property For Sale')).toBeInTheDocument();
    });

    test('preview shows completeness checklist', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByLabelText('Preview listing'));
      expect(screen.getByText('Listing Completeness')).toBeInTheDocument();
      expect(screen.getByText('Title & Description')).toBeInTheDocument();
      expect(screen.getByText('Price set')).toBeInTheDocument();
      expect(screen.getByText('Terms accepted')).toBeInTheDocument();
    });

    test('preview close button works', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByLabelText('Preview listing'));
      expect(screen.getByText('Listing Preview')).toBeInTheDocument();
      // Find the close button (×) in the preview panel
      const closeButton = screen.getByText('×');
      fireEvent.click(closeButton);
      expect(screen.queryByText('Listing Preview')).not.toBeInTheDocument();
    });

    test('preview shows For Sale badge by default', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByLabelText('Preview listing'));
      expect(screen.getByText('For Sale')).toBeInTheDocument();
    });

    test('preview shows For Rent badge for rental listings', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Listing type'), { target: { value: 'rent' } });
      fireEvent.click(screen.getByLabelText('Preview listing'));
      expect(screen.getByText('For Rent')).toBeInTheDocument();
    });
  });

  describe('Theme Toggling', () => {
    test('theme toggle button is present', () => {
      render(<PropertyListingWizard />);
      expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
    });

    test('toggling theme saves to localStorage', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByLabelText('Toggle theme'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('listingWizardTheme', 'dark');
    });

    test('toggling theme twice returns to light mode', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByLabelText('Toggle theme'));
      fireEvent.click(screen.getByLabelText('Toggle theme'));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('listingWizardTheme', 'light');
    });

    test('loads dark theme from localStorage', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'listingWizardTheme') return 'dark';
        return null;
      });
      render(<PropertyListingWizard />);
      expect(screen.getByText('☀️')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    test('Escape closes preview panel', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByLabelText('Preview listing'));
      expect(screen.getByText('Listing Preview')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Listing Preview')).not.toBeInTheDocument();
    });

    test('Escape closes discard modal', () => {
      render(<PropertyListingWizard />);
      fireEvent.click(screen.getByLabelText('Discard listing'));
      expect(screen.getByText('Discard Listing?')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Discard Listing?')).not.toBeInTheDocument();
    });

    test('Escape closes draft modal', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'propertyListingDraft') {
          return JSON.stringify({ formData: { title: 'Draft' }, currentStep: 0 });
        }
        return null;
      });
      render(<PropertyListingWizard />);
      expect(screen.getByText('Resume Draft?')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText('Resume Draft?')).not.toBeInTheDocument();
    });

    test('Escape closes photo preview modal', () => {
      render(<PropertyListingWizard />);
      // Go to step 2
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'Beautiful 3BR Home with Pool Downtown' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'This is a stunning three bedroom home with modern amenities and a beautiful pool.' } });
      fireEvent.change(screen.getByLabelText('Number of bedrooms'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Number of bathrooms'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '2000' } });
      fireEvent.click(screen.getByText('Next →'));
      fireEvent.click(screen.getByLabelText('Upload photos'));
      const photoThumbnails = screen.getAllByText('🖼️');
      fireEvent.click(photoThumbnails[0]);
      expect(screen.getByText('Photo 1')).toBeInTheDocument();
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByText(/★ Primary Photo/)).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('renders without errors with empty localStorage', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<PropertyListingWizard />)).not.toThrow();
    });

    test('negative square footage shows validation error', () => {
      render(<PropertyListingWizard />);
      fireEvent.change(screen.getByLabelText('Listing title'), { target: { value: 'A Beautiful Property Listing' } });
      fireEvent.change(screen.getByLabelText('Property description'), { target: { value: 'This is a detailed description of the property with many features and more.' } });
      fireEvent.change(screen.getByLabelText('Number of bedrooms'), { target: { value: '3' } });
      fireEvent.change(screen.getByLabelText('Number of bathrooms'), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText('Square footage'), { target: { value: '-100' } });
      fireEvent.click(screen.getByText('Next →'));
      expect(screen.getByText('Square footage must be positive')).toBeInTheDocument();
    });
  });
});
