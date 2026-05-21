import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import useUpload from "@/utils/useUpload";
import { fetchJson } from "@/utils/fetchJson";
import { useAuthHeader } from "@/hooks/useAuthHeader";
import { useCVChecklist } from "@/hooks/useCVChecklist";
import { useCVSave } from "@/hooks/useCVSave";
import { useCVRefine } from "@/hooks/useCVRefine";
import { useCVTailor } from "@/hooks/useCVTailor";
import { useCVVersion } from "@/hooks/useCVVersion";
import { useCVExtract } from "@/hooks/useCVExtract";
import { usePDFExport } from "@/hooks/usePDFExport";
import { Header } from "@/components/CVEditor/Header";
import { SignInBlock } from "@/components/CVEditor/SignInBlock";
import { PageBanner } from "@/components/CVEditor/PageBanner";
import { EditorHeader } from "@/components/CVEditor/EditorHeader";
import { MessageBanner } from "@/components/CVEditor/MessageBanner";
import { BasicInfoFields } from "@/components/CVEditor/BasicInfoFields";
import { VeyonTip } from "@/components/CVEditor/VeyonTip";
import { PDFExportSection } from "@/components/CVEditor/PDFExportSection";
import { CVTextSection } from "@/components/CVEditor/CVTextSection";
import { JobDescriptionSection } from "@/components/CVEditor/JobDescriptionSection";
import { RefinedTextSection } from "@/components/CVEditor/RefinedTextSection";
import { NotesSection } from "@/components/CVEditor/NotesSection";
import { FitCheckPanel } from "@/components/CVEditor/FitCheckPanel";
import { VersionsPanel } from "@/components/CVEditor/VersionsPanel";
import { QuickRemindersPanel } from "@/components/CVEditor/QuickRemindersPanel";
import { SmartToolsSection } from "@/components/CVEditor/SmartToolsSection";

export default function CvEditorPage({ params }) {
  const { data: user, loading: userLoading } = useUser();
  const [upload, { loading: uploadLoading }] = useUpload();

  const id = params?.id;

  const [title, setTitle] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [seniority, setSeniority] = useState("Mid");
  const [location, setLocation] = useState("Dubai, UAE");
  const [visaStatus, setVisaStatus] = useState("");
  const [rawText, setRawText] = useState("");
  const [refinedText, setRefinedText] = useState("");
  const [notes, setNotes] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [candidateName, setCandidateName] = useState("");
  const [pdfTemplate, setPdfTemplate] = useState("modern");
  const [extractingCV, setExtractingCV] = useState(false);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { headerRight, isSignedIn } = useAuthHeader(user, userLoading);

  const { data: cvData, isLoading: cvLoading } = useQuery({
    queryKey: ["cv", id],
    queryFn: async () => {
      const data = await fetchJson(`/api/cv/${id}`);
      return data;
    },
    enabled: isSignedIn && !!id,
  });

  const cv = cvData?.cv || null;

  useEffect(() => {
    if (!cv) {
      return;
    }

    setTitle(cv.title || "");
    setTargetRole(cv.target_role || "");

    const content = cv.content || {};
    const meta = content?.meta || {};

    const nextRaw = typeof content.rawText === "string" ? content.rawText : "";
    const nextRefined =
      typeof content.refinedText === "string" ? content.refinedText : "";
    const nextNotes = typeof content.notes === "string" ? content.notes : "";

    setRawText(nextRaw);
    setRefinedText(nextRefined);
    setNotes(nextNotes);

    if (typeof meta.seniority === "string") {
      setSeniority(meta.seniority);
    }
    if (typeof meta.location === "string") {
      setLocation(meta.location);
    }
    if (typeof meta.visaStatus === "string") {
      setVisaStatus(meta.visaStatus);
    }
  }, [cv]);

  const saveMutation = useCVSave(
    id,
    rawText,
    refinedText,
    notes,
    seniority,
    location,
    visaStatus,
    title,
    targetRole,
    setError,
    setSuccess,
  );
  const refineMutation = useCVRefine(
    rawText,
    targetRole,
    seniority,
    visaStatus,
    location,
    setError,
    setSuccess,
    setRefinedText,
  );
  const tailorMutation = useCVTailor(
    rawText,
    refinedText,
    jobDescription,
    targetRole,
    seniority,
    visaStatus,
    location,
    setError,
    setSuccess,
    setRefinedText,
  );
  const saveVersionMutation = useCVVersion(
    id,
    rawText,
    refinedText,
    notes,
    seniority,
    location,
    visaStatus,
    setError,
    setSuccess,
  );
  const handleFileUpload = useCVExtract(
    upload,
    setError,
    setSuccess,
    setExtractingCV,
    setRawText,
  );
  const handlePdfExport = usePDFExport(
    candidateName,
    location,
    pdfTemplate,
    rawText,
    refinedText,
    targetRole,
    setError,
    setSuccess,
  );

  const versionsQuery = useQuery({
    queryKey: ["cv", id, "versions"],
    queryFn: async () => {
      const data = await fetchJson(`/api/cv/${id}/versions`);
      return data;
    },
    enabled: isSignedIn && !!id,
  });

  const versions = versionsQuery?.data?.versions || [];

  const showSignInBlock = !userLoading && !isSignedIn;

  const activeText = useMemo(() => {
    const refined = refinedText.trim();
    if (refined.length > 0) {
      return refined;
    }
    return rawText.trim();
  }, [refinedText, rawText]);

  const { checklist, checklistScore, missingChecklistItems, scoreTone } =
    useCVChecklist(activeText, location, targetRole, visaStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Header headerRight={headerRight} />

      <div className="mx-auto max-w-6xl px-4 pb-16">
        {showSignInBlock && <SignInBlock />}

        {isSignedIn && (
          <>
            <PageBanner />

            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                <EditorHeader
                  cv={cv}
                  saveMutation={saveMutation}
                  saveVersionMutation={saveVersionMutation}
                />

                <div className="mt-4">
                  <MessageBanner error={error} success={success} />
                </div>

                {(cvLoading || userLoading) && (
                  <div className="mt-6 text-sm text-slate-600">Loading...</div>
                )}

                {!cvLoading && (
                  <div className="mt-6 space-y-5">
                    <BasicInfoFields
                      title={title}
                      setTitle={setTitle}
                      targetRole={targetRole}
                      setTargetRole={setTargetRole}
                      seniority={seniority}
                      setSeniority={setSeniority}
                      location={location}
                      setLocation={setLocation}
                      visaStatus={visaStatus}
                      setVisaStatus={setVisaStatus}
                    />

                    <VeyonTip />

                    <PDFExportSection
                      candidateName={candidateName}
                      setCandidateName={setCandidateName}
                      pdfTemplate={pdfTemplate}
                      setPdfTemplate={setPdfTemplate}
                      handlePdfExport={handlePdfExport}
                    />

                    <CVTextSection
                      rawText={rawText}
                      setRawText={setRawText}
                      refineMutation={refineMutation}
                      handleFileUpload={handleFileUpload}
                      extractingCV={extractingCV}
                      uploadLoading={uploadLoading}
                    />

                    <JobDescriptionSection
                      jobDescription={jobDescription}
                      setJobDescription={setJobDescription}
                      tailorMutation={tailorMutation}
                    />

                    <RefinedTextSection
                      refinedText={refinedText}
                      setRefinedText={setRefinedText}
                    />

                    <NotesSection notes={notes} setNotes={setNotes} />

                    <SmartToolsSection
                      rawText={rawText}
                      refinedText={refinedText}
                      jobDescription={jobDescription}
                      candidateName={candidateName}
                      targetRole={targetRole}
                      location={location}
                      pdfTemplate={pdfTemplate}
                      setRawText={setRawText}
                      setError={setError}
                      setSuccess={setSuccess}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <FitCheckPanel
                  checklistScore={checklistScore}
                  scoreTone={scoreTone}
                  checklist={checklist}
                  missingChecklistItems={missingChecklistItems}
                />

                <VersionsPanel
                  versionsQuery={versionsQuery}
                  versions={versions}
                  setRawText={setRawText}
                  setRefinedText={setRefinedText}
                  setNotes={setNotes}
                  setSeniority={setSeniority}
                  setLocation={setLocation}
                  setVisaStatus={setVisaStatus}
                  setSuccess={setSuccess}
                />

                <QuickRemindersPanel />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
