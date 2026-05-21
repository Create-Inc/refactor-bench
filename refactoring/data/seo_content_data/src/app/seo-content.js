// SEO content generation for programmatic tool pages
// Each function returns unique, keyword-rich content blocks

export function generatePageTitle(tool) {
  if (tool.customTitle) return `${tool.customTitle} - Free & Instant`;
  if (tool.platform) {
    return `${tool.action} ${tool.fileTypeLabel} Under ${tool.targetLabel.toUpperCase()} for ${tool.platform} - Free & Instant`;
  }
  return `${tool.action} ${tool.fileTypeLabel} Under ${tool.targetLabel.toUpperCase()} - Free Online Tool`;
}

export function generateMetaDescription(tool) {
  if (tool.platform) {
    return `${tool.action} your ${tool.fileType} to under ${tool.targetLabel} for ${tool.platform} uploads. Exact size compliance guaranteed. Free, no signup, 100% browser-based.`;
  }
  return `${tool.action} your ${tool.fileType} to under ${tool.targetLabel}. Instant, free, and browser-based. No signup required. Exact size target guaranteed.`;
}

export function generateH1(tool) {
  if (tool.customTitle) return tool.customTitle;
  if (tool.platform) {
    return `${tool.action} ${tool.fileTypeLabel} to Under ${tool.targetLabel.toUpperCase()} for ${tool.platform}`;
  }
  return `${tool.action} ${tool.fileTypeLabel} to Under ${tool.targetLabel.toUpperCase()}`;
}

export function generateIntro(tool) {
  if (tool.platform) {
    return `Need to upload a ${tool.fileType} to ${tool.platform} but your file is too large? ${tool.platform} enforces a strict ${tool.targetLabel.toUpperCase()} file size limit, and uploads that exceed this threshold are silently rejected — often without a clear error message. This free tool automatically ${tool.action.toLowerCase()}es your ${tool.fileType} to exactly under ${tool.targetLabel.toUpperCase()}, ensuring your submission goes through on the first try. Everything happens locally in your browser — your files never leave your device.`;
  }
  return `Struggling with a ${tool.fileType} file that is too large? Many online portals, email services, and applications enforce strict file size limits. This tool ${tool.action.toLowerCase()}s your ${tool.fileType} to under ${tool.targetLabel.toUpperCase()} instantly, right in your browser. No signup, no server uploads, no quality loss. Just drag, ${tool.action.toLowerCase()}, and download.`;
}

export function generateWhySizeLimitsSection(tool) {
  const platformName = tool.platform || "most upload portals";
  const reason =
    tool.whySizeLimits ||
    "Online platforms enforce file size limits to ensure reliable uploads, prevent server overload, and maintain consistent performance for all users.";

  return {
    heading: `Why Does ${platformName} Have a ${tool.targetLabel.toUpperCase()} File Size Limit?`,
    content: reason,
    extra: `When you try to upload a ${tool.fileType} that exceeds ${tool.targetLabel.toUpperCase()}, the system will either reject the file entirely, show a vague error message, or appear to accept it but fail silently. This is especially frustrating when you are on a deadline — whether it is a university assignment, a government application, or a job submission. Our tool eliminates this problem by compressing your file to the exact size required, with no guesswork involved.`,
  };
}

export function generateStepByStep(tool) {
  return [
    {
      step: 1,
      title: `Upload Your ${tool.fileTypeLabel} File`,
      description: `Click the upload area or drag and drop your ${tool.fileType} file. We accept ${tool.formats ? tool.formats.join(", ").toUpperCase() : "all common formats"}. Your file is processed entirely in your browser — nothing is uploaded to our servers.`,
    },
    {
      step: 2,
      title: `Automatic ${tool.gerund || tool.action + "ion"} to ${tool.targetLabel.toUpperCase()}`,
      description: `Our compression algorithm automatically analyzes your file and applies the optimal compression settings to bring it under ${tool.targetLabel.toUpperCase()}. The algorithm uses a binary search approach to find the highest quality setting that still meets the size target — so you get the best possible quality within the size constraint.`,
    },
    {
      step: 3,
      title: "Preview & Verify Size",
      description: `Before downloading, verify that the compressed file meets ${tool.platform ? tool.platform + "'s" : "your"} exact requirements. The tool shows you the original size, compressed size, and compression ratio so you know exactly what changed.`,
    },
    {
      step: 4,
      title: `Download & Upload to ${tool.platform || "Your Portal"}`,
      description: `Download your compressed ${tool.fileType} and upload it to ${tool.platform || "your destination portal"}. The file is guaranteed to be under ${tool.targetLabel.toUpperCase()}, so your upload will succeed on the first attempt.`,
    },
  ];
}

export function generateTipsSection(tool) {
  const baseTips = tool.tips || [];
  const extraTips = [];

  if (
    tool.fileType === "pdf" ||
    tool.fileType === "document" ||
    tool.fileType === "docx"
  ) {
    extraTips.push(
      "Remove unnecessary images or reduce their resolution within the PDF",
      "Flatten form fields and annotations to reduce file complexity",
      'Use "Save As" instead of "Save" to eliminate revision history bloat',
      "Convert color images to grayscale if color is not essential",
      "Remove embedded fonts that are not used in the document",
    );
  } else if (["image", "jpg", "png", "photo", "jpeg"].includes(tool.fileType)) {
    extraTips.push(
      "Reduce image dimensions — 1920px wide is sufficient for most screens",
      "Use JPEG format for photographs (smaller than PNG)",
      "Use PNG only when transparency is required",
      "Strip EXIF metadata to reduce file size by 10-20%",
      "Reduce DPI to 72 for web/screen viewing, 150 for print",
    );
  } else if (["video", "mp4"].includes(tool.fileType)) {
    extraTips.push(
      "Reduce resolution to 720p — sufficient for most online portals",
      "Use H.264 codec for maximum compatibility and compression",
      "Trim unnecessary footage before compressing",
      "Reduce frame rate to 24fps for non-action content",
      "Remove audio track if not required by the submission",
    );
  } else if (["excel", "xlsx", "xls", "ods"].includes(tool.fileType)) {
    extraTips.push(
      "Remove unused worksheets and empty rows/columns",
      "Delete pivot table caches and cached data",
      "Replace formulas with values in finished reports",
      "Compress embedded images within the spreadsheet",
      "Remove conditional formatting from large ranges",
      "Save in XLSX format instead of XLS for better compression",
    );
  } else if (["pptx", "ppt", "powerpoint", "odp"].includes(tool.fileType)) {
    extraTips.push(
      "Compress all images within the presentation (File → Compress Pictures)",
      "Remove unused slide masters and layouts",
      "Replace embedded videos with linked videos",
      "Delete speaker notes if not needed for the submission",
      "Use JPEG images instead of PNG where transparency is not needed",
      "Reduce slide dimensions if the presentation is for screen only",
    );
  } else if (["word", "rtf", "txt", "odt"].includes(tool.fileType)) {
    extraTips.push(
      "Compress images embedded in the document",
      "Remove tracked changes and comments before saving",
      "Save as DOCX instead of DOC for better compression",
      "Delete unused styles and formatting",
      "Remove headers/footers with large logos if not needed",
    );
  } else if (
    ["audio", "mp3", "wav", "flac", "aac", "ogg"].includes(tool.fileType)
  ) {
    extraTips.push(
      "Reduce bitrate to 128kbps — sufficient for voice recordings",
      "Convert stereo to mono if only one channel is needed",
      "Use MP3 format for maximum compatibility and small size",
      "Trim silence from beginning and end of audio",
      "Use AAC format for better quality at lower bitrates",
      "Remove metadata and album art to reduce file size",
    );
  } else if (["gif"].includes(tool.fileType)) {
    extraTips.push(
      "Reduce the number of frames in animated GIFs",
      "Decrease GIF dimensions — 480px wide is usually enough",
      "Reduce color palette to 128 or 64 colors",
      "Increase frame delay to reduce frame count",
      "Consider converting to WebP for better compression",
    );
  } else if (["svg"].includes(tool.fileType)) {
    extraTips.push(
      "Remove unnecessary metadata and comments from SVG code",
      "Simplify paths and reduce decimal precision",
      "Remove hidden layers and unused elements",
      "Use SVGO or similar optimizer before uploading",
      "Inline styles instead of external CSS references",
    );
  } else if (["webp"].includes(tool.fileType)) {
    extraTips.push(
      "WebP offers 25-35% better compression than JPEG",
      "Use lossy WebP for photographs, lossless for graphics",
      "Reduce dimensions to match display size",
      "Strip metadata to save additional space",
      "Set quality to 80% for optimal size-quality balance",
    );
  } else if (["tiff", "bmp"].includes(tool.fileType)) {
    extraTips.push(
      "Convert TIFF/BMP to JPEG or PNG for much smaller files",
      "Use LZW compression for TIFF files",
      "Reduce color depth from 32-bit to 24-bit or 8-bit",
      "Crop unnecessary whitespace around the image",
      "Reduce DPI to match your actual needs",
    );
  } else if (["heic"].includes(tool.fileType)) {
    extraTips.push(
      "HEIC is Apple's format — convert to JPEG for wider compatibility",
      "HEIC files are already well-compressed — reduce dimensions instead",
      "Remove Live Photo data to reduce HEIC size",
      "Strip location and camera metadata",
      "Convert to JPEG at 85% quality for good results",
    );
  } else if (["psd", "ai-file", "eps"].includes(tool.fileType)) {
    extraTips.push(
      "Flatten all layers before saving to reduce file size",
      "Delete hidden layers and unused smart objects",
      "Reduce canvas dimensions if possible",
      "Save without thumbnails or preview images",
      "Use maximum compression when saving",
    );
  } else if (["zip", "rar", "7z"].includes(tool.fileType)) {
    extraTips.push(
      "Compress individual files before adding to archive",
      "Use 7z format for maximum compression ratio",
      "Split large archives into multiple parts",
      "Remove temporary and cache files before archiving",
      "Use solid archive mode for better compression",
    );
  } else if (["mov", "avi", "wmv", "mkv", "webm"].includes(tool.fileType)) {
    extraTips.push(
      "Convert to MP4 H.264 for maximum compatibility and compression",
      "Reduce resolution to 720p for web and portal uploads",
      "Trim unnecessary footage before compressing",
      "Reduce frame rate to 24fps for non-action content",
      "Remove audio track if not required",
    );
  } else if (["csv"].includes(tool.fileType)) {
    extraTips.push(
      "Remove empty rows and columns from the data",
      "Shorten column headers to reduce file size",
      "Remove formatting — CSV is plain text only",
      "Split large datasets into multiple files",
      "Use ZIP compression for very large CSV files",
    );
  } else if (["epub"].includes(tool.fileType)) {
    extraTips.push(
      "Compress embedded images within the EPUB",
      "Remove unnecessary fonts — use system fonts instead",
      "Reduce image resolution for screen reading",
      "Remove unused CSS styles",
      "Strip metadata and publisher information if allowed",
    );
  }

  const allTips = [...baseTips, ...extraTips];
  const uniqueTips = [...new Set(allTips)];
  return uniqueTips.slice(0, 8);
}

export function generateFAQs(tool) {
  const platformName = tool.platform || "the upload portal";
  const faqs = [
    {
      question: `Will ${tool.action.toLowerCase()}ing my ${tool.fileType} reduce quality?`,
      answer: `Our algorithm is designed to preserve maximum quality while meeting the ${tool.targetLabel.toUpperCase()} size target. For images, we use a binary search approach to find the highest quality setting that still fits under the limit. For documents, we optimize internal structures without removing content. The result is typically indistinguishable from the original for on-screen viewing.`,
    },
    {
      question: `Is it safe to use this tool for sensitive ${tool.fileType} files?`,
      answer: `Yes, completely. All processing happens locally in your browser using JavaScript. Your files are never uploaded to any server — not ours, not anyone else's. The file data never leaves your device. This makes it safe for personal documents, government forms, medical records, financial documents, and any other sensitive files.`,
    },
    {
      question: `What if my ${tool.fileType} is still too large after compression?`,
      answer: `If the file cannot be compressed to under ${tool.targetLabel.toUpperCase()} while maintaining acceptable quality, try these approaches: reduce the resolution or dimensions, convert to a more efficient format (e.g., PNG to JPEG), remove unnecessary pages or elements, or split the file into multiple smaller files if the portal allows multiple uploads.`,
    },
    {
      question: "Do I need to create an account or install software?",
      answer:
        "No account, no installation, no signup required. This tool runs entirely in your web browser. Just open the page, upload your file, and download the compressed result. It works on Chrome, Firefox, Safari, and Edge on any operating system.",
    },
    {
      question: `How long does it take to ${tool.action.toLowerCase()} a ${tool.fileType}?`,
      answer: `Most files process in under 5 seconds. Larger files (over 20MB) may take 10-30 seconds depending on your device's processing power. Video files take longer due to the complexity of video compression. The progress bar shows you the exact status of the compression.`,
    },
    {
      question: `What ${tool.fileType} formats are supported?`,
      answer: tool.formats
        ? `This tool accepts ${tool.formats.join(", ").toUpperCase()} files. ${tool.platform ? `These are the formats accepted by ${tool.platform}.` : "These are the most common formats used by online portals."}`
        : `This tool supports all common ${tool.fileType} formats including ${tool.fileType === "pdf" ? "PDF" : tool.fileType === "video" || tool.fileType === "mp4" ? "MP4, MOV, AVI" : "JPEG, PNG, GIF, WebP"}. The compressed output maintains the original format.`,
    },
    {
      question: `Can I ${tool.action.toLowerCase()} multiple files at once?`,
      answer:
        "Currently, this tool processes one file at a time to ensure maximum compression quality and accuracy. For batch processing needs, we recommend processing each file individually — it typically takes only a few seconds per file.",
    },
  ];

  if (tool.platform) {
    faqs.push({
      question: `What are ${tool.platform}'s exact file requirements?`,
      answer: `${tool.platform} requires ${tool.fileType} files to be under ${tool.targetLabel.toUpperCase()}. ${tool.formats ? "Accepted formats: " + tool.formats.join(", ").toUpperCase() + "." : ""} ${tool.dpi ? "Required DPI: " + tool.dpi + "." : ""} ${tool.dimensions ? "Required dimensions: " + tool.dimensions + "." : ""} This tool automatically handles all of these requirements.`,
    });
  }

  return faqs;
}

export function generateSchemaWebApp(tool, baseUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: generateH1(tool),
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      `Instant ${tool.fileType} compression`,
      `Exact ${tool.targetLabel.toUpperCase()} size compliance`,
      "100% browser-based processing",
      "No account required",
      "Privacy-first — files never leave your device",
    ],
    url: `${baseUrl}/tool/${tool.slug}`,
  };
}

export function generateSchemaFAQ(tool) {
  const faqs = generateFAQs(tool);
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function generateSchemaHowTo(tool, baseUrl) {
  const steps = generateStepByStep(tool);
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to ${tool.action} ${tool.fileTypeLabel} to Under ${tool.targetLabel.toUpperCase()}${tool.platform ? " for " + tool.platform : ""}`,
    description: generateMetaDescription(tool),
    step: steps.map((s) => ({
      "@type": "HowToStep",
      name: s.title,
      text: s.description,
      url: `${baseUrl}/tool/${tool.slug}#step-${s.step}`,
    })),
  };
}
