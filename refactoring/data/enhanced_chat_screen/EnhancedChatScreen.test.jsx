import { describe, test, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EnhancedChatScreen } from "./src/app/EnhancedChatScreen.jsx";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

// Mock lucide-react icons as simple pass-through spans
vi.mock("lucide-react", () => {
  const icon = (name) => {
    const C = (props) => <span data-testid={`icon-${name}`} {...props} />;
    C.displayName = name;
    return C;
  };
  return {
    ArrowLeft: icon("ArrowLeft"),
    Video: icon("Video"),
    Phone: icon("Phone"),
    MoreVertical: icon("MoreVertical"),
    Send: icon("Send"),
    Smile: icon("Smile"),
    Paperclip: icon("Paperclip"),
    Camera: icon("Camera"),
    Mic: icon("Mic"),
    Star: icon("Star"),
    Reply: icon("Reply"),
    Forward: icon("Forward"),
    Trash2: icon("Trash2"),
    Copy: icon("Copy"),
    Info: icon("Info"),
    X: icon("X"),
    Play: icon("Play"),
    Pause: icon("Pause"),
    Download: icon("Download"),
    Image: icon("Image"),
    File: icon("File"),
    MapPin: icon("MapPin"),
    Users: icon("Users"),
    BarChart2: icon("BarChart2"),
    Check: icon("Check"),
    CheckCheck: icon("CheckCheck"),
    Volume2: icon("Volume2"),
  };
});

vi.mock("date-fns", () => ({
  format: (d, fmt) => "12:34",
}));

// Mock @tanstack/react-query
const mockQueryClient = { invalidateQueries: vi.fn() };
let mockMutateCallbacks = {};
const mockMutateFn = vi.fn();

vi.mock("@tanstack/react-query", () => ({
  useQuery: ({ queryFn }) => {
    // We'll control data via the fetch mock
    return { data: [] };
  },
  useMutation: ({ mutationFn, onSuccess }) => {
    mockMutateCallbacks.onSuccess = onSuccess;
    return {
      mutate: (data) => {
        mockMutateFn(data);
        mutationFn(data);
      },
    };
  },
  useQueryClient: () => mockQueryClient,
}));

vi.mock("@/utils/useUpload", () => ({
  default: () => [vi.fn().mockResolvedValue({ url: "http://test.com/file" }), { loading: false }],
}));

// Provide a controlled messages list via a custom useQuery override
let mockMessages = [];
// Override useQuery to return our controlled messages
vi.mock("@tanstack/react-query", async () => {
  return {
    useQuery: () => ({ data: mockMessages }),
    useMutation: ({ mutationFn, onSuccess }) => ({
      mutate: (data) => {
        mockMutateFn(data);
        // call onSuccess so UI updates (e.g. clearing text)
        if (onSuccess) onSuccess();
      },
    }),
    useQueryClient: () => mockQueryClient,
  };
});

global.fetch = vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve([]) }),
);

const baseUser = { id: "u1", name: "Alice" };
const baseChat = {
  id: "c1",
  other_user_name: "Bob",
  other_user_emoji: "😎",
  is_online: true,
  last_seen: null,
};

const defaultProps = () => ({
  user: baseUser,
  chat: baseChat,
  onBack: vi.fn(),
  onCall: vi.fn(),
  onViewProfile: vi.fn(),
  onViewMedia: vi.fn(),
});

describe("EnhancedChatScreen", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMessages = [];
  });

  /* ---- Rendering ------------------------------------------------- */

  test("renders the other user's name in the header", () => {
    render(<EnhancedChatScreen {...defaultProps()} />);
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  test("shows 'online' status when user is online", () => {
    render(<EnhancedChatScreen {...defaultProps()} />);
    expect(screen.getByText("online")).toBeInTheDocument();
  });

  test("shows 'last seen' when user is offline", () => {
    const props = defaultProps();
    props.chat = { ...baseChat, is_online: false, last_seen: "2025-01-01T10:00:00Z" };
    render(<EnhancedChatScreen {...props} />);
    expect(screen.getByText(/last seen/)).toBeInTheDocument();
  });

  test("renders the other user emoji avatar", () => {
    render(<EnhancedChatScreen {...defaultProps()} />);
    expect(screen.getByText("😎")).toBeInTheDocument();
  });

  test("renders message input with placeholder", () => {
    render(<EnhancedChatScreen {...defaultProps()} />);
    expect(screen.getByPlaceholderText("Message")).toBeInTheDocument();
  });

  /* ---- Messages display ------------------------------------------ */

  test("displays text messages from the messages list", () => {
    mockMessages = [
      {
        id: "m1",
        sender_id: "u2",
        content: "Hello there!",
        created_at: "2025-01-01T12:00:00Z",
        message_type: "text",
        reactions: [],
      },
    ];
    render(<EnhancedChatScreen {...defaultProps()} />);
    expect(screen.getByText("Hello there!")).toBeInTheDocument();
  });

  test("shows deleted message placeholder for deleted messages", () => {
    mockMessages = [
      {
        id: "m2",
        sender_id: "u2",
        content: "secret",
        created_at: "2025-01-01T12:00:00Z",
        message_type: "text",
        is_deleted: true,
        reactions: [],
      },
    ];
    render(<EnhancedChatScreen {...defaultProps()} />);
    expect(screen.getByText("This message was deleted")).toBeInTheDocument();
  });

  test("shows reply-to content when message is a reply", () => {
    mockMessages = [
      {
        id: "m3",
        sender_id: "u1",
        content: "My reply",
        created_at: "2025-01-01T12:00:00Z",
        message_type: "text",
        reply_to_content: "Original message",
        reply_to_sender_name: "Bob",
        reactions: [],
      },
    ];
    render(<EnhancedChatScreen {...defaultProps()} />);
    expect(screen.getByText("Original message")).toBeInTheDocument();
    expect(screen.getByText("My reply")).toBeInTheDocument();
  });

  /* ---- Sending messages ------------------------------------------ */

  test("sends a text message when pressing Enter", () => {
    render(<EnhancedChatScreen {...defaultProps()} />);
    const input = screen.getByPlaceholderText("Message");
    fireEvent.change(input, { target: { value: "Hi Bob" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockMutateFn).toHaveBeenCalledWith(
      expect.objectContaining({ content: "Hi Bob" }),
    );
  });

  test("does not send an empty message", () => {
    render(<EnhancedChatScreen {...defaultProps()} />);
    const input = screen.getByPlaceholderText("Message");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockMutateFn).not.toHaveBeenCalled();
  });

  test("clears the input field after sending", async () => {
    render(<EnhancedChatScreen {...defaultProps()} />);
    const input = screen.getByPlaceholderText("Message");
    fireEvent.change(input, { target: { value: "Test message" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() => {
      expect(input.value).toBe("");
    });
  });

  /* ---- Header interactions --------------------------------------- */

  test("calls onBack when back arrow is clicked", () => {
    const props = defaultProps();
    render(<EnhancedChatScreen {...props} />);
    fireEvent.click(screen.getByTestId("icon-ArrowLeft"));
    expect(props.onBack).toHaveBeenCalled();
  });

  test("calls onCall with 'Video' when video icon is clicked", () => {
    const props = defaultProps();
    render(<EnhancedChatScreen {...props} />);
    fireEvent.click(screen.getByTestId("icon-Video"));
    expect(props.onCall).toHaveBeenCalledWith("Video");
  });

  test("calls onCall with 'Voice' when phone icon is clicked", () => {
    const props = defaultProps();
    render(<EnhancedChatScreen {...props} />);
    fireEvent.click(screen.getByTestId("icon-Phone"));
    expect(props.onCall).toHaveBeenCalledWith("Voice");
  });

  /* ---- Menu interactions ----------------------------------------- */

  test("opens the header menu and shows menu items", () => {
    render(<EnhancedChatScreen {...defaultProps()} />);
    fireEvent.click(screen.getByTestId("icon-MoreVertical"));
    expect(screen.getByText("Group info")).toBeInTheDocument();
    expect(screen.getByText("Media")).toBeInTheDocument();
    expect(screen.getByText("Starred")).toBeInTheDocument();
  });

  test("opens the emoji picker and adds emoji to input", () => {
    render(<EnhancedChatScreen {...defaultProps()} />);
    // Click emoji icon (Smile in the input bar)
    const smileIcons = screen.getAllByTestId("icon-Smile");
    fireEvent.click(smileIcons[0]);
    // Emoji picker should show emojis
    expect(screen.getByText("😊")).toBeInTheDocument();
    // Click an emoji
    fireEvent.click(screen.getByText("😊"));
    const input = screen.getByPlaceholderText("Message");
    expect(input.value).toBe("😊");
  });

  /* ---- Attachment menu ------------------------------------------- */

  test("opens attachment menu and shows attachment options", () => {
    render(<EnhancedChatScreen {...defaultProps()} />);
    fireEvent.click(screen.getByTestId("icon-Paperclip"));
    expect(screen.getByText("Document")).toBeInTheDocument();
    expect(screen.getByText("Photos")).toBeInTheDocument();
    expect(screen.getByText("Location")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Poll")).toBeInTheDocument();
  });

  test("sends a location message via attachment menu", () => {
    render(<EnhancedChatScreen {...defaultProps()} />);
    fireEvent.click(screen.getByTestId("icon-Paperclip"));
    fireEvent.click(screen.getByText("Location"));
    expect(mockMutateFn).toHaveBeenCalledWith(
      expect.objectContaining({ messageType: "location" }),
    );
  });

  /* ---- Message types --------------------------------------------- */

  test("renders location message with Location shared text", () => {
    mockMessages = [
      {
        id: "m10",
        sender_id: "u2",
        content: "Location shared",
        created_at: "2025-01-01T12:00:00Z",
        message_type: "location",
        reactions: [],
      },
    ];
    render(<EnhancedChatScreen {...defaultProps()} />);
    expect(screen.getByText("Location shared")).toBeInTheDocument();
  });

  test("renders document message with file name", () => {
    mockMessages = [
      {
        id: "m11",
        sender_id: "u2",
        content: "report.pdf",
        created_at: "2025-01-01T12:00:00Z",
        message_type: "document",
        reactions: [],
      },
    ];
    render(<EnhancedChatScreen {...defaultProps()} />);
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText("PDF Document")).toBeInTheDocument();
  });
});
