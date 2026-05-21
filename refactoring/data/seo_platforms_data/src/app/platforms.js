// Comprehensive platform database for programmatic SEO page generation
// Each platform generates multiple tool pages across file types and sizes

export const platforms = [
  // === ACADEMIC ===
  {
    id: "canvas",
    name: "Canvas LMS",
    type: "academic",
    audience: "students and instructors",
    description:
      "Canvas LMS is a widely used learning management system in universities and schools across the US and globally.",
    whySizeLimits:
      "Canvas enforces upload limits to manage server storage and ensure fast grading workflows for instructors handling hundreds of submissions.",
    limits: {
      pdf: { maxMB: 10, maxKB: 10240, formats: ["pdf"], dpi: 150 },
      image: { maxMB: 5, maxKB: 5120, formats: ["jpg", "png", "gif"], dpi: 72 },
      video: { maxMB: 500, maxKB: 512000, formats: ["mp4", "mov"] },
      docx: { maxMB: 10, maxKB: 10240, formats: ["docx", "doc"] },
      excel: { maxMB: 10, maxKB: 10240, formats: ["xlsx", "xls", "csv"] },
      pptx: { maxMB: 10, maxKB: 10240, formats: ["pptx", "ppt"] },
      audio: { maxMB: 50, maxKB: 51200, formats: ["mp3", "wav", "m4a"] },
    },
    commonErrors: [
      "File size exceeds 10MB limit",
      "Assignment submission failed — file too large",
      "Upload timeout error on slow connection",
    ],
    tips: [
      "Flatten PDF layers before uploading",
      "Use JPG instead of PNG for photos",
      "Split large documents into parts",
      "Compress images to 72 DPI for screen viewing",
    ],
    url: "https://canvas.instructure.com",
  },
  {
    id: "blackboard",
    name: "Blackboard Learn",
    type: "academic",
    audience: "students and professors",
    description:
      "Blackboard Learn is a virtual learning environment used by thousands of educational institutions for course management.",
    whySizeLimits:
      "Blackboard limits file sizes to maintain system performance across thousands of concurrent student submissions during peak periods.",
    limits: {
      pdf: { maxMB: 10, maxKB: 10240, formats: ["pdf"] },
      video: { maxMB: 250, maxKB: 256000, formats: ["mp4", "avi"] },
      image: { maxMB: 5, maxKB: 5120, formats: ["jpg", "png"] },
      docx: { maxMB: 10, maxKB: 10240, formats: ["docx", "doc"] },
      excel: { maxMB: 10, maxKB: 10240, formats: ["xlsx", "xls"] },
      pptx: { maxMB: 10, maxKB: 10240, formats: ["pptx", "ppt"] },
    },
    commonErrors: [
      "Dropbox upload limit exceeded",
      "File too large for submission",
      "Unsupported file format error",
    ],
    tips: [
      "Use PDF format instead of Word when possible",
      "Compress videos to 720p for smaller sizes",
      "Avoid embedded fonts in PDFs",
    ],
    url: "https://www.blackboard.com",
  },
  {
    id: "moodle",
    name: "Moodle",
    type: "academic",
    audience: "students and educators",
    description:
      "Moodle is an open-source learning platform used by over 300 million users worldwide for online education.",
    whySizeLimits:
      "Moodle administrators set upload limits based on server capacity. Default limits are often conservative to prevent storage issues.",
    limits: {
      pdf: { maxMB: 20, maxKB: 20480, formats: ["pdf"] },
      video: { maxMB: 100, maxKB: 102400, formats: ["mp4"] },
      image: { maxMB: 5, maxKB: 5120, formats: ["jpg", "png", "gif"] },
      excel: { maxMB: 20, maxKB: 20480, formats: ["xlsx", "xls", "csv"] },
      pptx: { maxMB: 20, maxKB: 20480, formats: ["pptx", "ppt"] },
      audio: { maxMB: 50, maxKB: 51200, formats: ["mp3", "wav"] },
    },
    commonErrors: [
      "Maximum upload size exceeded",
      "File upload incomplete",
      "Assignment submission error",
    ],
    tips: [
      "Check your specific Moodle instance limits with your admin",
      "Use H.264 codec for videos",
      "Reduce image resolution to 150 DPI",
    ],
    url: "https://moodle.org",
  },
  {
    id: "common-app",
    name: "Common App",
    type: "academic",
    audience: "college applicants",
    description:
      "The Common Application is used by over 1,000 colleges and universities for undergraduate admissions.",
    whySizeLimits:
      "Common App enforces strict limits to handle millions of application uploads during peak admissions season.",
    limits: {
      pdf: { maxMB: 5, maxKB: 5120, formats: ["pdf"] },
      docx: { maxMB: 5, maxKB: 5120, formats: ["pdf", "doc", "docx"] },
      image: { maxMB: 1, maxKB: 1024, formats: ["jpg", "png"] },
    },
    commonErrors: [
      "Essay upload too large",
      "Recommendation letter rejected",
      "Portfolio file exceeds size limit",
    ],
    tips: [
      "Save essays as PDF for consistent formatting",
      "Compress recommendation letters before upload",
      "Use JPEG for portfolio images",
    ],
    url: "https://www.commonapp.org",
  },
  {
    id: "coursera",
    name: "Coursera",
    type: "academic",
    audience: "online learners",
    description:
      "Coursera is a leading online learning platform offering courses from top universities and companies worldwide.",
    whySizeLimits:
      "Coursera limits uploads to ensure peer review assignments can be accessed quickly by reviewers across different internet speeds.",
    limits: {
      pdf: { maxMB: 5, maxKB: 5120, formats: ["pdf"] },
      image: { maxMB: 5, maxKB: 5120, formats: ["jpg", "png"] },
      docx: { maxMB: 5, maxKB: 5120, formats: ["pdf", "docx"] },
    },
    commonErrors: [
      "Peer review upload failed",
      "File format not accepted",
      "Submission size exceeded",
    ],
    tips: [
      "Convert Word docs to PDF before uploading",
      "Use JPG format for screenshots",
      "Remove hidden data from Office files",
    ],
    url: "https://www.coursera.org",
  },
  {
    id: "turnitin",
    name: "Turnitin",
    type: "academic",
    audience: "students and educators",
    description:
      "Turnitin is a plagiarism detection service used by academic institutions to check the originality of written work.",
    whySizeLimits:
      "Turnitin processes files for plagiarism analysis, and large files significantly slow down the checking process.",
    limits: {
      pdf: { maxMB: 40, maxKB: 40960, formats: ["pdf"] },
      docx: { maxMB: 40, maxKB: 40960, formats: ["doc", "docx", "pdf"] },
    },
    commonErrors: [
      "Plagiarism check upload failed",
      "File too large for processing",
      "Document format incompatible",
    ],
    tips: [
      "Remove images from text-heavy documents",
      "Use standard fonts to reduce file size",
      "Avoid scanned PDFs — use text-based PDFs",
    ],
    url: "https://www.turnitin.com",
  },
  {
    id: "d2l-brightspace",
    name: "D2L Brightspace",
    type: "academic",
    audience: "students and instructors",
    description:
      "D2L Brightspace is a learning management system used by K-12 schools, colleges, and corporate training programs.",
    whySizeLimits:
      "Brightspace enforces limits per assignment dropbox to prevent storage overflows on institutional servers.",
    limits: {
      pdf: { maxMB: 10, maxKB: 10240, formats: ["pdf"] },
      image: { maxMB: 5, maxKB: 5120, formats: ["jpg", "png"] },
      video: { maxMB: 200, maxKB: 204800, formats: ["mp4"] },
    },
    commonErrors: [
      "Dropbox file limit exceeded",
      "Upload failed — try smaller file",
      "Submission timed out",
    ],
    tips: [
      "Compress before uploading to avoid timeout",
      "Use MP4 H.264 for video assignments",
      "Check per-assignment limits with your instructor",
    ],
    url: "https://www.d2l.com",
  },
  {
    id: "proquest",
    name: "ProQuest",
    type: "academic",
    audience: "graduate students",
    description:
      "ProQuest is the primary repository for dissertations and theses, used by graduate programs across North America.",
    whySizeLimits:
      "ProQuest requires optimized PDFs to ensure long-term archival quality and accessibility of academic research.",
    limits: {
      pdf: { maxMB: 100, maxKB: 102400, formats: ["pdf"], dpi: 300 },
    },
    commonErrors: [
      "PDF validation failed",
      "File size exceeds limit",
      "Embargo upload error",
    ],
    tips: [
      "Use PDF/A format for archival compliance",
      "Compress images within PDF to 300 DPI",
      "Remove unused fonts and metadata",
    ],
    url: "https://www.proquest.com",
  },
  {
    id: "scholarone",
    name: "ScholarOne Manuscripts",
    type: "academic",
    audience: "researchers and academics",
    description:
      "ScholarOne is the manuscript submission system used by thousands of academic journals for peer review.",
    whySizeLimits:
      "Journal publishers limit file sizes to streamline the peer review process and ensure reviewers can access files quickly.",
    limits: {
      pdf: { maxMB: 30, maxKB: 30720, formats: ["pdf"], dpi: 300 },
      image: {
        maxMB: 10,
        maxKB: 10240,
        formats: ["jpg", "png", "tiff"],
        dpi: 300,
      },
    },
    commonErrors: [
      "Manuscript upload failed",
      "Figure resolution too low",
      "Supplementary file too large",
    ],
    tips: [
      "Export figures at 300 DPI minimum",
      "Use TIFF for line art figures",
      "Compress supplementary data separately",
    ],
    url: "https://mc.manuscriptcentral.com",
  },

  // === GOVERNMENT ===
  {
    id: "uscis",
    name: "USCIS",
    type: "government",
    audience: "immigration applicants",
    description:
      "The U.S. Citizenship and Immigration Services online portal handles visa, green card, and citizenship applications.",
    whySizeLimits:
      "USCIS enforces strict photo and document limits to meet federal security standards and biometric processing requirements.",
    limits: {
      photo: {
        maxMB: 0.24,
        maxKB: 240,
        formats: ["jpg", "jpeg"],
        dimensions: "600x600",
        dpi: 300,
      },
      pdf: { maxMB: 6, maxKB: 6144, formats: ["pdf"], dpi: 300 },
    },
    commonErrors: [
      "Photo must be under 240KB",
      "Invalid photo dimensions — must be 600x600",
      "Document upload rejected — exceeds 6MB",
    ],
    tips: [
      "Use exactly 600x600 pixel dimensions for photos",
      "Save photos as JPEG with 300 DPI",
      "Flatten PDF forms before uploading",
      "Use white background for passport-style photos",
    ],
    url: "https://www.uscis.gov",
  },
  {
    id: "ircc",
    name: "IRCC GCKey Portal",
    type: "government",
    audience: "Canadian immigration applicants",
    description:
      "Immigration, Refugees and Citizenship Canada uses the GCKey portal for visa and immigration document submission.",
    whySizeLimits:
      "The GCKey portal has strict per-document limits to manage secure file processing across Canadian government systems.",
    limits: {
      pdf: { maxMB: 4, maxKB: 4096, formats: ["pdf"], dpi: 300 },
      image: { maxMB: 4, maxKB: 4096, formats: ["jpg", "jpeg", "png"] },
      photo: {
        maxMB: 4,
        maxKB: 4096,
        formats: ["jpg", "jpeg"],
        dimensions: "420x540",
        dpi: 300,
      },
    },
    commonErrors: [
      "Document size limit exceeded",
      "Upload session expired",
      "File validation error",
    ],
    tips: [
      "Keep each document under 4MB",
      "Use JPEG format for photos",
      "Combine multi-page documents into single PDF",
    ],
    url: "https://www.canada.ca/en/immigration-refugees-citizenship.html",
  },
  {
    id: "grants-gov",
    name: "Grants.gov",
    type: "government",
    audience: "grant applicants and researchers",
    description:
      "Grants.gov is the centralized portal for finding and applying to federal grants in the United States.",
    whySizeLimits:
      "Federal grant submissions have strict size limits to ensure standardized processing across multiple government agencies.",
    limits: {
      pdf: { maxMB: 10, maxKB: 10240, formats: ["pdf"], dpi: 300 },
    },
    commonErrors: [
      "Application package too large",
      "PDF validation failed",
      "Submission timeout on large files",
    ],
    tips: [
      "Use PDF/A format for compliance",
      "Flatten form fields before submission",
      "Remove color images if not required",
    ],
    url: "https://www.grants.gov",
  },
  {
    id: "fafsa",
    name: "FAFSA",
    type: "government",
    audience: "students applying for financial aid",
    description:
      "The Free Application for Federal Student Aid is required for students seeking financial aid for college in the US.",
    whySizeLimits:
      "FAFSA limits uploads to ensure the verification process runs smoothly during peak application periods.",
    limits: {
      pdf: { maxMB: 3, maxKB: 3072, formats: ["pdf"], dpi: 300 },
      image: { maxMB: 2, maxKB: 2048, formats: ["jpg", "png"], dpi: 300 },
    },
    commonErrors: [
      "Document exceeds size limit",
      "File format not acceptable",
      "Upload session expired",
    ],
    tips: [
      "Scan tax documents at 200 DPI to keep size down",
      "Use black and white scanning for tax forms",
      "Convert scanned images to PDF",
    ],
    url: "https://studentaid.gov/fafsa",
  },
  {
    id: "dmv",
    name: "State DMV Portal",
    type: "government",
    audience: "drivers and vehicle owners",
    description:
      "State DMV online portals handle driver license renewals, vehicle registration, and ID card applications.",
    whySizeLimits:
      "DMV portals enforce strict photo requirements to meet federal REAL ID standards and facial recognition processing.",
    limits: {
      photo: {
        maxMB: 2,
        maxKB: 2048,
        formats: ["jpg", "jpeg"],
        dimensions: "600x600",
        dpi: 300,
      },
      pdf: { maxMB: 5, maxKB: 5120, formats: ["pdf"], dpi: 300 },
    },
    commonErrors: [
      "Photo ID upload failed",
      "Document not clear enough",
      "File size too large for upload",
    ],
    tips: [
      "Use a plain white or off-white background",
      "Ensure face takes up 70-80% of frame",
      "No glasses or hats in photo",
    ],
    url: "https://www.dmv.ca.gov",
  },
  {
    id: "evisa",
    name: "eVisa Portal",
    type: "government",
    audience: "international travelers",
    description:
      "Electronic visa portals are used by countries worldwide for online visa applications and travel authorization.",
    whySizeLimits:
      "eVisa systems need standardized photos and documents that meet international biometric requirements.",
    limits: {
      photo: {
        maxMB: 0.3,
        maxKB: 300,
        formats: ["jpg", "jpeg"],
        dimensions: "600x600",
        dpi: 300,
      },
      pdf: { maxMB: 5, maxKB: 5120, formats: ["pdf"] },
    },
    commonErrors: [
      "Photo exceeds 300KB limit",
      "Invalid photo dimensions",
      "Document format rejected",
    ],
    tips: [
      "Crop photo to exact passport dimensions",
      "Use JPEG compression at 80% quality",
      "Ensure photo has proper lighting",
    ],
    url: "https://www.ivisa.com",
  },
  {
    id: "passport",
    name: "Passport Application Portal",
    type: "government",
    audience: "passport applicants",
    description:
      "Online passport application portals require precisely formatted photos and supporting documents.",
    whySizeLimits:
      "Passport photos must meet international ICAO standards for biometric verification at border control.",
    limits: {
      photo: {
        maxMB: 0.24,
        maxKB: 240,
        formats: ["jpg", "jpeg"],
        dimensions: "600x600",
        dpi: 300,
      },
      pdf: { maxMB: 5, maxKB: 5120, formats: ["pdf"] },
    },
    commonErrors: [
      "Photo must be 2x2 inches at 300 DPI",
      "File exceeds 240KB",
      "Background must be white",
    ],
    tips: [
      "Use exactly 2x2 inch (51x51mm) dimensions",
      "White background required",
      "Neutral facial expression, eyes open",
      "No filters or editing",
    ],
    url: "https://travel.state.gov",
  },

  // === UK & EU GOVERNMENT ===
  {
    id: "ucas",
    name: "UCAS",
    type: "government",
    audience: "UK university applicants",
    description:
      "UCAS is the Universities and Colleges Admissions Service handling undergraduate applications across the United Kingdom.",
    whySizeLimits:
      "UCAS enforces strict document limits to process over 700,000 applications annually during the admissions cycle across UK universities.",
    limits: {
      pdf: { maxMB: 5, maxKB: 5120, formats: ["pdf"] },
      image: { maxMB: 1, maxKB: 1024, formats: ["jpg", "png"] },
      docx: { maxMB: 5, maxKB: 5120, formats: ["pdf", "doc", "docx"] },
    },
    commonErrors: [
      "Personal statement upload too large",
      "Reference letter exceeds limit",
      "Supporting document rejected",
    ],
    tips: [
      "Save personal statements as PDF",
      "Compress reference letters before upload",
      "Remove tracked changes from Word documents before converting to PDF",
    ],
    url: "https://www.ucas.com",
  },
  {
    id: "uk-gov",
    name: "UK Gov Portal",
    type: "government",
    audience: "UK residents and applicants",
    description:
      "The UK Government portal (GOV.UK) handles passport applications, driving licence renewals, tax filings, and benefits claims for UK residents.",
    whySizeLimits:
      "GOV.UK enforces upload limits to ensure secure processing of sensitive personal documents across government departments.",
    limits: {
      photo: {
        maxMB: 0.5,
        maxKB: 500,
        formats: ["jpg", "jpeg"],
        dimensions: "600x750",
        dpi: 300,
      },
      pdf: { maxMB: 10, maxKB: 10240, formats: ["pdf"] },
      image: { maxMB: 5, maxKB: 5120, formats: ["jpg", "png"] },
    },
    commonErrors: [
      "Photo does not meet UK passport standards",
      "Document exceeds upload limit",
      "File format not accepted",
    ],
    tips: [
      "UK passport photos require 600x750px dimensions",
      "Use a plain light grey or cream background",
      "Ensure no shadows on face or background",
      "Remove red-eye before uploading",
    ],
    url: "https://www.gov.uk",
  },
  {
    id: "hmrc",
    name: "HMRC",
    type: "government",
    audience: "UK taxpayers and businesses",
    description:
      "HM Revenue and Customs is the UK tax authority handling Self Assessment, VAT returns, and corporate tax filings online.",
    whySizeLimits:
      "HMRC limits uploads to maintain secure processing of tax documents and prevent abuse of their online filing systems.",
    limits: {
      pdf: { maxMB: 5, maxKB: 5120, formats: ["pdf"], dpi: 200 },
      image: { maxMB: 3, maxKB: 3072, formats: ["jpg", "png"] },
    },
    commonErrors: [
      "Self Assessment document too large",
      "VAT receipt upload failed",
      "File exceeds maximum allowed size",
    ],
    tips: [
      "Scan tax receipts at 200 DPI in black and white",
      "Combine multiple receipts into a single PDF",
      "Remove colour from scanned documents to reduce size",
    ],
    url: "https://www.gov.uk/government/organisations/hm-revenue-customs",
  },
  {
    id: "schengen-visa",
    name: "Schengen Visa Portal",
    type: "government",
    audience: "EU visa applicants",
    description:
      "The Schengen visa application portals are used across 27 European countries for short-stay visa applications to the EU.",
    whySizeLimits:
      "Schengen visa portals require biometric-grade photos and standardised documents that comply with EU-wide entry requirements.",
    limits: {
      photo: {
        maxMB: 0.3,
        maxKB: 300,
        formats: ["jpg", "jpeg"],
        dimensions: "600x600",
        dpi: 300,
      },
      pdf: { maxMB: 5, maxKB: 5120, formats: ["pdf"] },
    },
    commonErrors: [
      "Biometric photo rejected — wrong dimensions",
      "Photo exceeds 300KB limit",
      "Supporting document too large",
    ],
    tips: [
      "Photo must be 35x45mm (600x600px at 300 DPI)",
      "Use white or light blue background",
      "Face must occupy 70-80% of frame",
      "No head coverings unless for religious reasons",
    ],
    url: "https://www.schengenvisainfo.com",
  },
  {
    id: "nhs-jobs",
    name: "NHS Jobs",
    type: "government",
    audience: "UK healthcare job seekers",
    description:
      "NHS Jobs is the official recruitment portal for the National Health Service in England and Wales, processing over 1 million applications annually.",
    whySizeLimits:
      "NHS Jobs limits uploads to manage high application volumes and ensure DBS check documents are processed efficiently.",
    limits: {
      pdf: { maxMB: 5, maxKB: 5120, formats: ["pdf"] },
      docx: { maxMB: 5, maxKB: 5120, formats: ["pdf", "doc", "docx"] },
      image: { maxMB: 2, maxKB: 2048, formats: ["jpg", "png"] },
    },
    commonErrors: [
      "CV upload exceeds 5MB",
      "Supporting document rejected",
      "Qualification certificate too large",
    ],
    tips: [
      "Keep CV/resume under 2 pages and 5MB",
      "Scan certificates in black and white",
      "Save supporting statements as PDF",
    ],
    url: "https://www.jobs.nhs.uk",
  },
  {
    id: "erasmus",
    name: "Erasmus+ Portal",
    type: "government",
    audience: "EU exchange students",
    description:
      "Erasmus+ is the European Union programme for education, training, youth, and sport, supporting student exchange across Europe.",
    whySizeLimits:
      "The Erasmus+ portal enforces document limits to handle applications from students across all EU member states efficiently.",
    limits: {
      pdf: { maxMB: 10, maxKB: 10240, formats: ["pdf"] },
      image: { maxMB: 2, maxKB: 2048, formats: ["jpg", "png"] },
    },
    commonErrors: [
      "Application document too large",
      "Motivation letter exceeds limit",
      "Learning agreement upload failed",
    ],
    tips: [
      "Compress motivation letters to under 10MB",
      "Use PDF format for all academic transcripts",
      "Scan ID documents at 200 DPI",
    ],
    url: "https://erasmus-plus.ec.europa.eu",
  },
  {
    id: "eu-settlement",
    name: "EU Settlement Scheme",
    type: "government",
    audience: "EU citizens in the UK",
    description:
      "The EU Settlement Scheme allows EU, EEA, and Swiss citizens to continue living in the UK after Brexit.",
    whySizeLimits:
      "The Home Office portal requires precise photo formats and document sizes to process identity verification securely.",
    limits: {
      photo: {
        maxMB: 0.5,
        maxKB: 500,
        formats: ["jpg", "jpeg"],
        dimensions: "600x750",
        dpi: 300,
      },
      pdf: { maxMB: 6, maxKB: 6144, formats: ["pdf"] },
    },
    commonErrors: [
      "Identity photo rejected",
      "Proof of residence document too large",
      "Upload timeout during submission",
    ],
    tips: [
      "Use UK passport photo dimensions (35x45mm)",
      "Scan utility bills at 150 DPI in black and white",
      "Combine multiple proof documents into one PDF",
    ],
    url: "https://www.gov.uk/settled-status-eu-citizens-families",
  },

  // === BUSINESS / PROFESSIONAL ===
  {
    id: "linkedin",
    name: "LinkedIn",
    type: "business",
    audience: "professionals and job seekers",
    description:
      "LinkedIn is the largest professional networking platform with over 900 million members worldwide.",
    whySizeLimits:
      "LinkedIn limits file sizes to ensure fast loading of profiles and job application documents across devices.",
    limits: {
      pdf: { maxMB: 5, maxKB: 5120, formats: ["pdf"] },
      image: { maxMB: 8, maxKB: 8192, formats: ["jpg", "png", "gif"] },
      docx: { maxMB: 5, maxKB: 5120, formats: ["pdf", "docx", "doc"] },
      pptx: { maxMB: 5, maxKB: 5120, formats: ["pptx", "ppt"] },
    },
    commonErrors: [
      "Resume file too large",
      "Profile photo upload failed",
      "Document format not supported",
    ],
    tips: [
      "Keep resume PDFs under 5MB",
      "Use 400x400 minimum for profile photos",
      "Remove embedded images from resume if too large",
    ],
    url: "https://www.linkedin.com",
  },
  {
    id: "indeed",
    name: "Indeed",
    type: "business",
    audience: "job seekers",
    description:
      "Indeed is the world's largest job search engine, processing millions of resume uploads daily.",
    whySizeLimits:
      "Indeed limits resume sizes to ensure fast parsing by their automated resume screening systems.",
    limits: {
      pdf: { maxMB: 5, maxKB: 5120, formats: ["pdf"] },
      docx: { maxMB: 5, maxKB: 5120, formats: ["pdf", "doc", "docx"] },
    },
    commonErrors: [
      "Resume file too large",
      "Format not supported",
      "Upload failed — try again",
    ],
    tips: [
      "Use standard fonts in your resume",
      "Remove large header images",
      "Save as PDF for best compatibility",
    ],
    url: "https://www.indeed.com",
  },
  {
    id: "zoom",
    name: "Zoom",
    type: "business",
    audience: "remote workers and teams",
    description:
      "Zoom is a leading video conferencing platform used for meetings, webinars, and virtual events.",
    whySizeLimits:
      "Zoom limits shared file sizes to manage cloud storage costs and ensure smooth meeting experiences.",
    limits: {
      video: { maxMB: 512, maxKB: 524288, formats: ["mp4", "mov"] },
      image: { maxMB: 2, maxKB: 2048, formats: ["jpg", "png"] },
      pdf: { maxMB: 15, maxKB: 15360, formats: ["pdf"] },
    },
    commonErrors: [
      "Recording too large to share",
      "Cloud storage limit reached",
      "Upload bandwidth exceeded",
    ],
    tips: [
      "Compress recordings to 720p for sharing",
      "Use H.264 codec for smallest file size",
      "Trim unnecessary portions before uploading",
    ],
    url: "https://zoom.us",
  },
  {
    id: "teams",
    name: "Microsoft Teams",
    type: "business",
    audience: "enterprise users",
    description:
      "Microsoft Teams is the hub for teamwork in Microsoft 365, used by over 300 million monthly active users.",
    whySizeLimits:
      "Teams limits individual file uploads to manage OneDrive and SharePoint storage allocation per organization.",
    limits: {
      pdf: { maxMB: 250, maxKB: 256000, formats: ["pdf"] },
      video: { maxMB: 250, maxKB: 256000, formats: ["mp4"] },
      image: { maxMB: 10, maxKB: 10240, formats: ["jpg", "png", "gif"] },
      excel: { maxMB: 250, maxKB: 256000, formats: ["xlsx", "xls"] },
      pptx: { maxMB: 250, maxKB: 256000, formats: ["pptx", "ppt"] },
      word: { maxMB: 250, maxKB: 256000, formats: ["docx", "doc"] },
      audio: { maxMB: 250, maxKB: 256000, formats: ["mp3", "wav", "m4a"] },
    },
    commonErrors: [
      "File exceeds 250MB upload limit",
      "Upload failed due to network",
      "File type not supported in chat",
    ],
    tips: [
      "Use OneDrive links for files over 250MB",
      "Compress meeting recordings before sharing",
      "Use 1080p max for video messages",
    ],
    url: "https://teams.microsoft.com",
  },

  // === E-COMMERCE / CREATIVE ===
  {
    id: "etsy",
    name: "Etsy",
    type: "ecommerce",
    audience: "sellers and creators",
    description:
      "Etsy is a global marketplace for handmade, vintage, and creative goods with over 90 million active buyers.",
    whySizeLimits:
      "Etsy optimizes listing images for fast page loads to maximize conversion rates for sellers.",
    limits: {
      image: {
        maxMB: 10,
        maxKB: 10240,
        formats: ["jpg", "png", "gif"],
        dimensions: "2000x2000",
        dpi: 72,
      },
      video: { maxMB: 100, maxKB: 102400, formats: ["mp4", "mov"] },
    },
    commonErrors: [
      "Listing photo too large",
      "Image must be at least 2000px wide",
      "Video upload failed",
    ],
    tips: [
      "Use square 2000x2000px images for best results",
      "Save as JPEG at 80% quality",
      "Use natural lighting for product photos",
    ],
    url: "https://www.etsy.com",
  },
  {
    id: "shopify",
    name: "Shopify",
    type: "ecommerce",
    audience: "online store owners",
    description:
      "Shopify powers millions of online stores, from small businesses to enterprise-level e-commerce operations.",
    whySizeLimits:
      "Shopify optimizes product images for fast page loads, which directly impacts conversion rates and SEO rankings.",
    limits: {
      image: {
        maxMB: 20,
        maxKB: 20480,
        formats: ["jpg", "png", "gif", "webp"],
        dpi: 72,
      },
      video: { maxMB: 1024, maxKB: 1048576, formats: ["mp4", "mov"] },
    },
    commonErrors: [
      "Image dimensions too large",
      "File format not accepted",
      "Product media upload error",
    ],
    tips: [
      "Use 2048x2048px square images for products",
      "JPEG at 80% quality offers best size/quality ratio",
      "Use WebP for fastest loading",
    ],
    url: "https://www.shopify.com",
  },
  {
    id: "redbubble",
    name: "Redbubble",
    type: "ecommerce",
    audience: "print-on-demand artists",
    description:
      "Redbubble is a print-on-demand marketplace where artists sell their designs on products like t-shirts, stickers, and posters.",
    whySizeLimits:
      "Redbubble needs high-resolution files for print quality but caps size to manage processing of millions of uploads.",
    limits: {
      image: {
        maxMB: 150,
        maxKB: 153600,
        formats: ["png", "jpg"],
        dpi: 300,
        dimensions: "7632x6480",
      },
    },
    commonErrors: [
      "Image resolution too low for print",
      "File size exceeds 150MB limit",
      "Design upload failed",
    ],
    tips: [
      "Use PNG with transparency for best results",
      "Design at 300 DPI minimum",
      "Use sRGB color profile",
    ],
    url: "https://www.redbubble.com",
  },

  // === MESSAGING / SOCIAL ===
  {
    id: "whatsapp",
    name: "WhatsApp",
    type: "messaging",
    audience: "general users",
    description:
      "WhatsApp is the most popular messaging app globally with over 2 billion users, used for personal and business communication.",
    whySizeLimits:
      "WhatsApp compresses media to save bandwidth in regions with limited internet infrastructure and to manage server costs.",
    limits: {
      image: { maxMB: 16, maxKB: 16384, formats: ["jpg", "png"] },
      video: { maxMB: 16, maxKB: 16384, formats: ["mp4", "mov"] },
      pdf: { maxMB: 100, maxKB: 102400, formats: ["pdf"] },
    },
    commonErrors: [
      "Media too large to send",
      "Video exceeds 16MB limit",
      "Document failed to upload",
    ],
    tips: [
      "Compress videos to under 16MB for direct sharing",
      "Use WhatsApp Web for larger document uploads",
      "Reduce video resolution to 480p for quick sharing",
    ],
    url: "https://www.whatsapp.com",
  },
  {
    id: "gmail",
    name: "Gmail",
    type: "email",
    audience: "general users and professionals",
    description:
      "Gmail is the world's most popular email service with over 1.8 billion active users.",
    whySizeLimits:
      "Gmail limits attachments to 25MB to prevent email server overload and ensure reliable delivery.",
    limits: {
      pdf: { maxMB: 25, maxKB: 25600, formats: ["pdf"] },
      image: { maxMB: 25, maxKB: 25600, formats: ["jpg", "png", "gif"] },
      docx: { maxMB: 25, maxKB: 25600, formats: ["docx", "doc", "pdf"] },
      video: { maxMB: 25, maxKB: 25600, formats: ["mp4"] },
      excel: { maxMB: 25, maxKB: 25600, formats: ["xlsx", "xls", "csv"] },
      pptx: { maxMB: 25, maxKB: 25600, formats: ["pptx", "ppt"] },
      audio: { maxMB: 25, maxKB: 25600, formats: ["mp3", "wav", "m4a"] },
      zip: { maxMB: 25, maxKB: 25600, formats: ["zip", "rar"] },
    },
    commonErrors: [
      "Attachment exceeds 25MB limit",
      "File too large — use Google Drive instead",
      "Email bounced due to attachment size",
    ],
    tips: [
      "Use Google Drive links for files over 25MB",
      "Compress PDFs before attaching",
      "Use ZIP compression for multiple files",
    ],
    url: "https://mail.google.com",
  },
  {
    id: "outlook",
    name: "Outlook",
    type: "email",
    audience: "business professionals",
    description:
      "Microsoft Outlook is the primary email client for enterprise and business communication.",
    whySizeLimits:
      "Outlook and Exchange servers limit attachments to prevent mailbox storage overflow and ensure email deliverability.",
    limits: {
      pdf: { maxMB: 20, maxKB: 20480, formats: ["pdf"] },
      image: { maxMB: 20, maxKB: 20480, formats: ["jpg", "png"] },
      docx: { maxMB: 20, maxKB: 20480, formats: ["docx", "doc"] },
      excel: { maxMB: 20, maxKB: 20480, formats: ["xlsx", "xls"] },
      pptx: { maxMB: 20, maxKB: 20480, formats: ["pptx", "ppt"] },
      audio: { maxMB: 20, maxKB: 20480, formats: ["mp3", "wav"] },
      zip: { maxMB: 20, maxKB: 20480, formats: ["zip"] },
    },
    commonErrors: [
      "Attachment exceeds maximum size",
      "Email too large to send",
      "File blocked by security policy",
    ],
    tips: [
      "Use OneDrive links for large files",
      "Compress images before embedding in emails",
      "Use PDF instead of Word for smaller size",
    ],
    url: "https://outlook.com",
  },
];

export function getPlatformById(id) {
  return platforms.find((p) => p.id === id);
}

export function getPlatformsByType(type) {
  return platforms.filter((p) => p.type === type);
}
