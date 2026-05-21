import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import EcommerceStorefront from "./src/app/page.jsx";

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

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("EcommerceStorefront", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("Header & Navigation", () => {
    test("renders store name", () => {
      render(<EcommerceStorefront />);
      expect(screen.getByText("ShopWave")).toBeInTheDocument();
    });

    test("renders category navigation links", () => {
      render(<EcommerceStorefront />);
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Clothing")).toBeInTheDocument();
      expect(screen.getByText("Home & Garden")).toBeInTheDocument();
      expect(screen.getByText("Sports")).toBeInTheDocument();
      expect(screen.getByText("Books")).toBeInTheDocument();
      expect(screen.getByText("Toys")).toBeInTheDocument();
    });

    test("renders search input", () => {
      render(<EcommerceStorefront />);
      expect(
        screen.getByPlaceholderText("Search products... (Ctrl+K)")
      ).toBeInTheDocument();
    });

    test("renders wishlist button with aria-label", () => {
      render(<EcommerceStorefront />);
      expect(screen.getByLabelText("Wishlist")).toBeInTheDocument();
    });

    test("renders shopping cart button with aria-label", () => {
      render(<EcommerceStorefront />);
      expect(screen.getByLabelText("Shopping cart")).toBeInTheDocument();
    });

    test("renders orders button with aria-label", () => {
      render(<EcommerceStorefront />);
      expect(screen.getByLabelText("Orders")).toBeInTheDocument();
    });
  });

  describe("Product Catalog", () => {
    test("renders all products by default", () => {
      render(<EcommerceStorefront />);
      expect(
        screen.getByText("Wireless Noise-Canceling Headphones")
      ).toBeInTheDocument();
      expect(screen.getByText("Carbon Fiber Road Bike")).toBeInTheDocument();
      expect(screen.getByText("The Art of Clean Code")).toBeInTheDocument();
      expect(
        screen.getByText("Building Blocks Mega Set (1000 pieces)")
      ).toBeInTheDocument();
    });

    test("renders product count", () => {
      render(<EcommerceStorefront />);
      expect(screen.getByText("12 products")).toBeInTheDocument();
    });

    test("shows All Products button", () => {
      render(<EcommerceStorefront />);
      expect(screen.getByText("All Products")).toBeInTheDocument();
    });

    test("renders sort dropdown", () => {
      render(<EcommerceStorefront />);
      expect(screen.getByLabelText("Sort by")).toBeInTheDocument();
    });

    test("renders grid and list view toggles", () => {
      render(<EcommerceStorefront />);
      expect(screen.getByLabelText("Grid view")).toBeInTheDocument();
      expect(screen.getByLabelText("List view")).toBeInTheDocument();
    });

    test("renders In Stock and On Sale filter checkboxes", () => {
      render(<EcommerceStorefront />);
      expect(screen.getByText("In Stock")).toBeInTheDocument();
      expect(screen.getByText("On Sale")).toBeInTheDocument();
    });

    test("renders minimum rating filter", () => {
      render(<EcommerceStorefront />);
      expect(screen.getByLabelText("Minimum rating")).toBeInTheDocument();
    });

    test("products show Add to Cart button", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      expect(addButtons.length).toBeGreaterThan(0);
    });

    test("products display prices", () => {
      render(<EcommerceStorefront />);
      expect(screen.getByText("$249.99")).toBeInTheDocument();
      expect(screen.getByText("$1,899.99")).toBeInTheDocument();
    });

    test("sale products show discount badges", () => {
      render(<EcommerceStorefront />);
      const discountBadges = screen.getAllByText(/-\d+%/);
      expect(discountBadges.length).toBeGreaterThan(0);
    });

    test("new products show NEW badge", () => {
      render(<EcommerceStorefront />);
      const newBadges = screen.getAllByText("NEW");
      expect(newBadges.length).toBeGreaterThan(0);
    });
  });

  describe("Category Filtering", () => {
    test("clicking Electronics shows only electronics products", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Electronics"));
      expect(
        screen.getByText("Wireless Noise-Canceling Headphones")
      ).toBeInTheDocument();
      expect(screen.getByText("4K Ultra HD Action Camera")).toBeInTheDocument();
      expect(
        screen.getByText("Mechanical Gaming Keyboard RGB")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Carbon Fiber Road Bike")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("Organic Cotton Crew Neck T-Shirt")
      ).not.toBeInTheDocument();
    });

    test("clicking Books shows only book products", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Books"));
      expect(screen.getByText("The Art of Clean Code")).toBeInTheDocument();
      expect(
        screen.getByText("Algorithmic Thinking for Beginners")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Wireless Noise-Canceling Headphones")
      ).not.toBeInTheDocument();
    });

    test("All Products button resets category filter", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Electronics"));
      expect(
        screen.queryByText("Carbon Fiber Road Bike")
      ).not.toBeInTheDocument();
      fireEvent.click(screen.getByText("All Products"));
      expect(screen.getByText("Carbon Fiber Road Bike")).toBeInTheDocument();
    });

    test("product count updates with category filter", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Electronics"));
      expect(screen.getByText("3 products")).toBeInTheDocument();
    });
  });

  describe("Search Filtering", () => {
    test("search by product name filters results", () => {
      render(<EcommerceStorefront />);
      const searchInput = screen.getByPlaceholderText(
        "Search products... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "headphones" } });
      expect(
        screen.getByText("Wireless Noise-Canceling Headphones")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Carbon Fiber Road Bike")
      ).not.toBeInTheDocument();
    });

    test("search by tag filters results", () => {
      render(<EcommerceStorefront />);
      const searchInput = screen.getByPlaceholderText(
        "Search products... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "gaming" } });
      expect(
        screen.getByText("Mechanical Gaming Keyboard RGB")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Wireless Noise-Canceling Headphones")
      ).not.toBeInTheDocument();
    });

    test("search by description filters results", () => {
      render(<EcommerceStorefront />);
      const searchInput = screen.getByPlaceholderText(
        "Search products... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "waterproof" } });
      expect(screen.getByText("4K Ultra HD Action Camera")).toBeInTheDocument();
    });

    test("clearing search restores all products", () => {
      render(<EcommerceStorefront />);
      const searchInput = screen.getByPlaceholderText(
        "Search products... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "headphones" } });
      expect(
        screen.queryByText("Carbon Fiber Road Bike")
      ).not.toBeInTheDocument();
      fireEvent.change(searchInput, { target: { value: "" } });
      expect(screen.getByText("Carbon Fiber Road Bike")).toBeInTheDocument();
    });

    test("no results message shown when no match", () => {
      render(<EcommerceStorefront />);
      const searchInput = screen.getByPlaceholderText(
        "Search products... (Ctrl+K)"
      );
      fireEvent.change(searchInput, { target: { value: "xyznonexistent" } });
      expect(
        screen.getByText("No products match your filters")
      ).toBeInTheDocument();
    });
  });

  describe("On Sale Filter", () => {
    test("On Sale checkbox filters to sale items only", () => {
      render(<EcommerceStorefront />);
      const onSaleCheckbox =
        screen.getByText("On Sale").previousElementSibling ||
        screen.getByText("On Sale").closest("label").querySelector("input");
      fireEvent.click(onSaleCheckbox);
      // Items with originalPrice: headphones, lamp, bike, blocks, camera, keyboard, planters
      expect(
        screen.getByText("Wireless Noise-Canceling Headphones")
      ).toBeInTheDocument();
      expect(screen.getByText("Carbon Fiber Road Bike")).toBeInTheDocument();
      // Items without originalPrice should be hidden
      expect(
        screen.queryByText("Organic Cotton Crew Neck T-Shirt")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText("The Art of Clean Code")
      ).not.toBeInTheDocument();
    });
  });

  describe("Sorting", () => {
    test("sort by price low to high orders products correctly", () => {
      render(<EcommerceStorefront />);
      const sortSelect = screen.getByLabelText("Sort by");
      fireEvent.change(sortSelect, { target: { value: "price_asc" } });
      const productNames = screen.getAllByRole("heading", { level: 3 });
      // Cheapest product is Algorithmic Thinking at $29.99
      expect(productNames[0].textContent).toBe(
        "Algorithmic Thinking for Beginners"
      );
    });

    test("sort by price high to low orders products correctly", () => {
      render(<EcommerceStorefront />);
      const sortSelect = screen.getByLabelText("Sort by");
      fireEvent.change(sortSelect, { target: { value: "price_desc" } });
      const productNames = screen.getAllByRole("heading", { level: 3 });
      // Most expensive product is Carbon Fiber Road Bike at $1,899.99
      expect(productNames[0].textContent).toBe("Carbon Fiber Road Bike");
    });
  });

  describe("View Mode Toggle", () => {
    test("clicking list view shows list layout", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByLabelText("List view"));
      // List view shows truncated descriptions
      const descriptions = screen.getAllByText(/\.\.\./);
      expect(descriptions.length).toBeGreaterThan(0);
    });

    test("clicking grid view returns to grid layout", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByLabelText("List view"));
      fireEvent.click(screen.getByLabelText("Grid view"));
      // Grid view: products still rendered
      expect(
        screen.getByText("Wireless Noise-Canceling Headphones")
      ).toBeInTheDocument();
    });
  });

  describe("Product Detail View", () => {
    test("clicking a product opens detail view", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      expect(screen.getByText("Back to products")).toBeInTheDocument();
      expect(
        screen.getByText(
          /Premium wireless headphones with active noise cancellation/
        )
      ).toBeInTheDocument();
    });

    test("product detail shows SKU", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      expect(screen.getByText("SKU: EL-WH-001")).toBeInTheDocument();
    });

    test("product detail shows specifications table", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      expect(screen.getByText("Specifications")).toBeInTheDocument();
      expect(screen.getByText("AudioTech")).toBeInTheDocument();
      expect(screen.getByText("Bluetooth 5.2")).toBeInTheDocument();
      expect(screen.getByText("30 hours")).toBeInTheDocument();
    });

    test("product detail shows stock status", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      expect(screen.getByText(/In Stock.*45 available/)).toBeInTheDocument();
    });

    test("product detail shows tags", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      expect(screen.getByText("#wireless")).toBeInTheDocument();
      expect(screen.getByText("#audio")).toBeInTheDocument();
      expect(screen.getByText("#noise-canceling")).toBeInTheDocument();
    });

    test("product detail has description and reviews tabs", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      // both tabs are present
      const descTab = screen.getByRole("button", { name: /description/i });
      expect(descTab).toBeInTheDocument();
    });

    test("back button returns to catalog", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      expect(screen.getByText("Back to products")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Back to products"));
      expect(screen.queryByText("Back to products")).not.toBeInTheDocument();
      expect(screen.getByText("12 products")).toBeInTheDocument();
    });

    test("sale product shows discount percentage", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      expect(screen.getByText(/SAVE.*24%/)).toBeInTheDocument();
    });

    test("sale product shows original price with strikethrough", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      expect(screen.getByText("$329.99")).toBeInTheDocument();
    });

    test("Add to Cart button is present in product detail", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      expect(screen.getByText("Add to Cart")).toBeInTheDocument();
    });
  });

  describe("Reviews", () => {
    test("clicking reviews tab shows product reviews", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      // Click the reviews tab
      const reviewsTab = screen
        .getAllByText(/reviews/i)
        .find((el) => el.tagName === "BUTTON");
      fireEvent.click(reviewsTab);
      expect(
        screen.getByText("Best headphones I have ever owned")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Great sound, slightly tight fit")
      ).toBeInTheDocument();
    });

    test("review shows author and verified badge", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      const reviewsTab = screen
        .getAllByText(/reviews/i)
        .find((el) => el.tagName === "BUTTON");
      fireEvent.click(reviewsTab);
      expect(screen.getByText("Alex M.")).toBeInTheDocument();
      const verifiedBadges = screen.getAllByText("Verified");
      expect(verifiedBadges.length).toBeGreaterThan(0);
    });

    test("review sort dropdown is available", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      const reviewsTab = screen
        .getAllByText(/reviews/i)
        .find((el) => el.tagName === "BUTTON");
      fireEvent.click(reviewsTab);
      expect(screen.getByLabelText("Sort reviews")).toBeInTheDocument();
    });

    test("helpful button increments count", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      const reviewsTab = screen
        .getAllByText(/reviews/i)
        .find((el) => el.tagName === "BUTTON");
      fireEvent.click(reviewsTab);
      const helpfulButton = screen.getByText("Helpful (42)");
      fireEvent.click(helpfulButton);
      expect(screen.getByText("Helpful (43)")).toBeInTheDocument();
    });

    test("Write a Review form is displayed", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      const reviewsTab = screen
        .getAllByText(/reviews/i)
        .find((el) => el.tagName === "BUTTON");
      fireEvent.click(reviewsTab);
      expect(screen.getByText("Write a Review")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Your name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Review title")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Write your review...")
      ).toBeInTheDocument();
    });

    test("submitting a review adds it to the list", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      const reviewsTab = screen
        .getAllByText(/reviews/i)
        .find((el) => el.tagName === "BUTTON");
      fireEvent.click(reviewsTab);

      fireEvent.change(screen.getByPlaceholderText("Your name"), {
        target: { value: "Test User" },
      });
      const ratingSelect = screen.getByLabelText("Rating");
      fireEvent.change(ratingSelect, { target: { value: "5" } });
      fireEvent.change(screen.getByPlaceholderText("Review title"), {
        target: { value: "Amazing product" },
      });
      fireEvent.change(screen.getByPlaceholderText("Write your review..."), {
        target: { value: "I love this product!" },
      });
      fireEvent.click(screen.getByText("Submit Review"));

      expect(screen.getByText("Amazing product")).toBeInTheDocument();
      expect(screen.getByText("I love this product!")).toBeInTheDocument();
    });
  });

  describe("Shopping Cart", () => {
    test("clicking Add to Cart adds product to cart", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      // Toast should show
      expect(screen.getByText(/added to cart/)).toBeInTheDocument();
    });

    test("cart icon shows item count after adding", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      const cartButton = screen.getByLabelText("Shopping cart");
      // Badge with count should appear
      expect(cartButton.querySelector("span")).not.toBeNull();
    });

    test("clicking cart button opens cart view", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      expect(screen.getByText(/Shopping Cart/)).toBeInTheDocument();
      expect(screen.getByText("Order Summary")).toBeInTheDocument();
    });

    test("empty cart shows empty message", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
      expect(screen.getByText("Continue Shopping")).toBeInTheDocument();
    });

    test("cart shows item with quantity controls", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      expect(screen.getByLabelText("Decrease quantity")).toBeInTheDocument();
      expect(screen.getByLabelText("Increase quantity")).toBeInTheDocument();
    });

    test("increasing quantity updates total", () => {
      render(<EcommerceStorefront />);
      // Add headphones ($249.99)
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      fireEvent.click(screen.getByText("Add to Cart"));
      fireEvent.click(screen.getByText("Back to products"));
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      fireEvent.click(screen.getByLabelText("Increase quantity"));
      // Should now show $499.98 (2 x $249.99)
      expect(screen.getByText("$499.98")).toBeInTheDocument();
    });

    test("Remove button removes item from cart", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      fireEvent.click(screen.getByText("Remove"));
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    });

    test("Proceed to Checkout button is shown", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      expect(screen.getByText("Proceed to Checkout")).toBeInTheDocument();
    });

    test("free shipping message shows when below $100", () => {
      render(<EcommerceStorefront />);
      // Add book at $39.99
      fireEvent.click(screen.getByText("The Art of Clean Code"));
      fireEvent.click(screen.getByText("Add to Cart"));
      fireEvent.click(screen.getByText("Back to products"));
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      expect(
        screen.getByText(/Add.*more for free shipping/)
      ).toBeInTheDocument();
    });

    test("Move to Wishlist button removes from cart and adds to wishlist", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      fireEvent.click(screen.getByText("Move to Wishlist"));
      expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    });
  });

  describe("Promo Code", () => {
    test("applying valid promo code shows discount", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      const promoInput = screen.getByPlaceholderText("Promo code");
      fireEvent.change(promoInput, { target: { value: "SAVE10" } });
      fireEvent.click(screen.getByText("Apply"));
      expect(screen.getByText(/Discount.*10% off/)).toBeInTheDocument();
    });

    test("applying invalid promo code shows error toast", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      const promoInput = screen.getByPlaceholderText("Promo code");
      fireEvent.change(promoInput, { target: { value: "BADCODE" } });
      fireEvent.click(screen.getByText("Apply"));
      expect(screen.getByText("Invalid promo code")).toBeInTheDocument();
    });
  });

  describe("Checkout Flow", () => {
    function goToCheckout() {
      const { container } = render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      fireEvent.click(screen.getByText("Proceed to Checkout"));
      return container;
    }

    test("checkout shows step 1 (Shipping) first", () => {
      goToCheckout();
      expect(screen.getByText("Shipping Information")).toBeInTheDocument();
      expect(screen.getByText("First Name *")).toBeInTheDocument();
      expect(screen.getByText("Last Name *")).toBeInTheDocument();
      expect(screen.getByText("Email *")).toBeInTheDocument();
      expect(screen.getByText("Address *")).toBeInTheDocument();
    });

    test("checkout shows shipping method options", () => {
      goToCheckout();
      expect(
        screen.getByText(/Standard.*5-7 business days/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Express.*2-3 business days/)
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Overnight.*next business day/)
      ).toBeInTheDocument();
    });

    test("clicking Continue goes to step 2 (Payment)", () => {
      goToCheckout();
      fireEvent.click(screen.getByText("Continue to Payment"));
      expect(screen.getByText("Payment Information")).toBeInTheDocument();
      expect(screen.getByText("Card Number *")).toBeInTheDocument();
      expect(screen.getByText("Expiry Date *")).toBeInTheDocument();
      expect(screen.getByText("CVV *")).toBeInTheDocument();
    });

    test("clicking Review Order goes to step 3", () => {
      goToCheckout();
      fireEvent.click(screen.getByText("Continue to Payment"));
      fireEvent.click(screen.getByText("Review Order"));
      expect(screen.getByText("Review Your Order")).toBeInTheDocument();
      expect(screen.getByText("Shipping To")).toBeInTheDocument();
      expect(screen.getByText("Place Order")).toBeInTheDocument();
    });

    test("Back button navigates to previous step", () => {
      goToCheckout();
      fireEvent.click(screen.getByText("Continue to Payment"));
      expect(screen.getByText("Payment Information")).toBeInTheDocument();
      fireEvent.click(screen.getByText("Back"));
      expect(screen.getByText("Shipping Information")).toBeInTheDocument();
    });

    test("progress steps show correct state", () => {
      goToCheckout();
      expect(screen.getByText("Shipping")).toBeInTheDocument();
      expect(screen.getByText("Payment")).toBeInTheDocument();
      expect(screen.getByText("Review")).toBeInTheDocument();
    });

    test("placing order clears cart and shows success toast", () => {
      goToCheckout();
      fireEvent.click(screen.getByText("Continue to Payment"));
      fireEvent.click(screen.getByText("Review Order"));
      fireEvent.click(screen.getByText("Place Order"));
      expect(
        screen.getByText("Order placed successfully!")
      ).toBeInTheDocument();
    });
  });

  describe("Order History", () => {
    test("clicking orders button shows order history", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByLabelText("Orders"));
      expect(screen.getByText("Order History")).toBeInTheDocument();
    });

    test("empty orders shows empty message", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByLabelText("Orders"));
      expect(screen.getByText("No orders yet")).toBeInTheDocument();
      expect(screen.getByText("Start Shopping")).toBeInTheDocument();
    });

    test("placed order appears in order history", () => {
      render(<EcommerceStorefront />);
      // Add item and complete checkout
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      fireEvent.click(screen.getByText("Proceed to Checkout"));
      fireEvent.click(screen.getByText("Continue to Payment"));
      fireEvent.click(screen.getByText("Review Order"));
      fireEvent.click(screen.getByText("Place Order"));
      // Go to orders
      fireEvent.click(screen.getByLabelText("Orders"));
      expect(screen.getByText(/ORD-/)).toBeInTheDocument();
      expect(screen.getByText("Confirmed")).toBeInTheDocument();
    });
  });

  describe("Wishlist", () => {
    test("clicking wishlist button on product adds to wishlist", () => {
      render(<EcommerceStorefront />);
      const wishlistButtons = screen.getAllByLabelText(/Wishlist/);
      // Click the first product's wishlist button (not the header one)
      const productWishlistBtn = wishlistButtons.find(
        (btn) =>
          btn.getAttribute("aria-label")?.includes("Wireless") ||
          (btn.getAttribute("aria-label")?.includes("Wishlist") &&
            btn.closest('[style*="position: absolute"]'))
      );
      if (productWishlistBtn) {
        fireEvent.click(productWishlistBtn);
      }
      expect(
        screen.getByText(/Added to wishlist|added to wishlist/i)
      ).toBeInTheDocument();
    });

    test("wishlist page shows empty message when empty", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByLabelText("Wishlist"));
      expect(screen.getByText("Your wishlist is empty")).toBeInTheDocument();
      expect(screen.getByText("Browse Products")).toBeInTheDocument();
    });

    test("clicking toggle wishlist in detail view adds to wishlist", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      fireEvent.click(screen.getByLabelText("Toggle wishlist"));
      expect(screen.getByText("Added to wishlist")).toBeInTheDocument();
    });
  });

  describe("Product Compare", () => {
    test("clicking compare button in detail view adds to compare list", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      fireEvent.click(screen.getByLabelText("Toggle compare"));
      // Should show compare floating bar after going back
      fireEvent.click(screen.getByText("Back to products"));
      expect(screen.getByText("1 product selected")).toBeInTheDocument();
      expect(screen.getByText("Compare Now")).toBeInTheDocument();
    });

    test("Compare Now button shows comparison view", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      fireEvent.click(screen.getByLabelText("Toggle compare"));
      fireEvent.click(screen.getByText("Back to products"));
      fireEvent.click(screen.getByText("Compare Now"));
      expect(screen.getByText("Compare Products")).toBeInTheDocument();
    });

    test("Clear button clears compare list", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      fireEvent.click(screen.getByLabelText("Toggle compare"));
      fireEvent.click(screen.getByText("Back to products"));
      fireEvent.click(screen.getByText("Clear"));
      expect(screen.queryByText("Compare Now")).not.toBeInTheDocument();
    });
  });

  describe("Toast Notifications", () => {
    test("toast appears on add to cart", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      expect(screen.getByText(/added to cart/)).toBeInTheDocument();
    });

    test("toast has close button", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      const toastCloseBtn = screen
        .getByText(/added to cart/)
        .closest("div")
        .querySelector("button");
      expect(toastCloseBtn).not.toBeNull();
    });
  });

  describe("Keyboard Shortcuts", () => {
    test("Escape closes product detail", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      expect(screen.getByText("Back to products")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Back to products")).not.toBeInTheDocument();
    });

    test("Escape closes cart view", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      expect(screen.getByText(/Shopping Cart/)).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Your cart is empty")).not.toBeInTheDocument();
    });

    test("Escape closes wishlist view", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByLabelText("Wishlist"));
      expect(screen.getByText("My Wishlist")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("My Wishlist")).not.toBeInTheDocument();
    });

    test("Escape closes order history", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByLabelText("Orders"));
      expect(screen.getByText("Order History")).toBeInTheDocument();
      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByText("Order History")).not.toBeInTheDocument();
    });
  });

  describe("localStorage Persistence", () => {
    test("cart items are saved to localStorage", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "shopCart",
        expect.any(String)
      );
    });

    test("wishlist is saved to localStorage", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      fireEvent.click(screen.getByLabelText("Toggle wishlist"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "shopWishlist",
        expect.any(String)
      );
    });

    test("orders are saved to localStorage", () => {
      render(<EcommerceStorefront />);
      const addButtons = screen.getAllByText("Add to Cart");
      fireEvent.click(addButtons[0]);
      fireEvent.click(screen.getByLabelText("Shopping cart"));
      fireEvent.click(screen.getByText("Proceed to Checkout"));
      fireEvent.click(screen.getByText("Continue to Payment"));
      fireEvent.click(screen.getByText("Review Order"));
      fireEvent.click(screen.getByText("Place Order"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "shopOrders",
        expect.any(String)
      );
    });

    test("recently viewed is saved to localStorage", () => {
      render(<EcommerceStorefront />);
      fireEvent.click(screen.getByText("Wireless Noise-Canceling Headphones"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "shopRecentlyViewed",
        expect.any(String)
      );
    });

    test("handles corrupted localStorage gracefully", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "shopCart") return "not valid json{{{";
        return null;
      });
      expect(() => render(<EcommerceStorefront />)).not.toThrow();
    });
  });

  describe("Error Handling", () => {
    test("renders without errors with empty localStorage", () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(() => render(<EcommerceStorefront />)).not.toThrow();
    });
  });
});
