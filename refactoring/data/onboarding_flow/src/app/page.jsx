"use client";

import { useState } from "react";
import useUser from "@/utils/useUser";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import { useSnackbar } from "@/hooks/useSnackbar";
import { useLegalConsent } from "@/hooks/useLegalConsent";
import { useHealthProfile } from "@/hooks/useHealthProfile";
import { useFileUpload } from "@/hooks/useFileUpload";
import { WelcomeStep } from "@/components/Onboarding/WelcomeStep";
import { LegalConsentStep } from "@/components/Onboarding/LegalConsentStep";
import { HealthProfileStep } from "@/components/Onboarding/HealthProfileStep";
import { ImportRecordsStep } from "@/components/Onboarding/ImportRecordsStep";
import { ReadyStep } from "@/components/Onboarding/ReadyStep";
import { Snackbar } from "@/components/Onboarding/Snackbar";
import { VerificationModal } from "@/components/Onboarding/VerificationModal";
import { CsvPreviewModal } from "@/components/Onboarding/CsvPreviewModal";
import { PortalConnectModal } from "@/components/Onboarding/PortalConnectModal";
import { ManualEntryModal } from "@/components/Onboarding/ManualEntryModal";
import { LegalDocumentModal } from "@/components/Onboarding/LegalDocumentModal";

export default function OnboardingPage() {
  const { data: user } = useUser();
  const [showModal, setShowModal] = useState(null);

  const {
    currentStep,
    setCurrentStep,
    importedCount,
    setImportedCount,
    providerCount,
    setProviderCount,
    saveProgress,
    getProgressPercentage,
  } = useOnboardingProgress();

  const { snackbar, showSnackbar } = useSnackbar();

  const { consents, setConsents, allChecked } = useLegalConsent();

  const { healthProfile, setHealthProfile, saveToDatabase } =
    useHealthProfile();

  const {
    uploadProgress,
    isUploading,
    extractedRecords,
    setExtractedRecords,
    csvPreview,
    setCsvPreview,
    handleFileUpload,
    handleCsvUpload,
  } = useFileUpload();

  const handleStep2Continue = () => {
    if (!allChecked) {
      showSnackbar("Please accept all consent items to continue", "error");
      return;
    }
    saveProgress(3);
    setCurrentStep(3);
  };

  const handleStep3Continue = async () => {
    await saveToDatabase();
    saveProgress(4);
    setCurrentStep(4);
  };

  const handleStep3Skip = () => {
    saveProgress(4);
    setCurrentStep(4);
  };

  const handleVerificationSave = () => {
    const recordsToSave = extractedRecords.filter((r) => r.confidence >= 50);
    setImportedCount((prev) => prev + recordsToSave.length);
    const providers = [
      ...new Set(recordsToSave.map((r) => r.provider).filter(Boolean)),
    ];
    setProviderCount((prev) => prev + providers.length);

    showSnackbar(`${recordsToSave.length} records added!`, "success");
    setShowModal(null);
    setExtractedRecords([]);
    saveProgress(4, { importedCount: importedCount + recordsToSave.length });
  };

  const handleCsvImport = () => {
    setImportedCount((prev) => prev + csvPreview.validRows);
    setProviderCount((prev) => prev + 3);
    showSnackbar(
      `Imported ${csvPreview.validRows} of ${csvPreview.totalRows} records`,
      "success",
    );
    setShowModal(null);
    setCsvPreview(null);
    saveProgress(4, { importedCount: importedCount + csvPreview.validRows });
  };

  const handleComplete = async () => {
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_completed: true }),
      });
    } catch (error) {
      console.error("Failed to save onboarding status:", error);
    }

    localStorage.removeItem("claritydx_onboarding");
    localStorage.removeItem("pendingFullName");
    localStorage.removeItem("pendingDiagnosis");
    window.location.href = "/dashboard";
  };

  // Step 1: Welcome
  if (currentStep === 1) {
    return (
      <WelcomeStep
        onGetStarted={() => {
          saveProgress(2);
          setCurrentStep(2);
        }}
        onShowModal={setShowModal}
      />
    );
  }

  // Step 2: Legal Consent
  if (currentStep === 2) {
    return (
      <>
        <LegalConsentStep
          progressPercentage={getProgressPercentage()}
          consents={consents}
          setConsents={setConsents}
          allChecked={allChecked}
          onContinue={handleStep2Continue}
          onShowModal={setShowModal}
          stepNumber={2}
          totalSteps={5}
        />
        <LegalDocumentModal
          modalType={showModal}
          onClose={() => setShowModal(null)}
        />
        <Snackbar snackbar={snackbar} />
      </>
    );
  }

  // Step 3: Health Profile
  if (currentStep === 3) {
    return (
      <HealthProfileStep
        progressPercentage={getProgressPercentage()}
        healthProfile={healthProfile}
        setHealthProfile={setHealthProfile}
        onContinue={handleStep3Continue}
        onSkip={handleStep3Skip}
        stepNumber={3}
        totalSteps={5}
      />
    );
  }

  // Step 4: Import Records
  if (currentStep === 4) {
    return (
      <>
        <ImportRecordsStep
          progressPercentage={getProgressPercentage()}
          importedCount={importedCount}
          providerCount={providerCount}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          onFileUpload={(e) =>
            handleFileUpload(e, showSnackbar, () =>
              setShowModal("verification"),
            )
          }
          onCsvUpload={(e) =>
            handleCsvUpload(e, () => setShowModal("csvPreview"))
          }
          onShowModal={setShowModal}
          onContinue={() => {
            saveProgress(5);
            setCurrentStep(5);
          }}
          stepNumber={4}
          totalSteps={5}
        />
        <VerificationModal
          extractedRecords={
            showModal === "verification" ? extractedRecords : null
          }
          onSave={handleVerificationSave}
          onCancel={() => {
            setShowModal(null);
            setExtractedRecords([]);
          }}
        />
        <CsvPreviewModal
          csvPreview={showModal === "csvPreview" ? csvPreview : null}
          onImport={handleCsvImport}
          onCancel={() => {
            setShowModal(null);
            setCsvPreview(null);
          }}
        />
        {showModal === "portalConnect" && (
          <PortalConnectModal
            onClose={() => setShowModal(null)}
            showSnackbar={showSnackbar}
          />
        )}
        {showModal === "manualEntry" && (
          <ManualEntryModal
            onClose={() => setShowModal(null)}
            showSnackbar={showSnackbar}
          />
        )}
        <Snackbar snackbar={snackbar} />
      </>
    );
  }

  // Step 5: Ready
  if (currentStep === 5) {
    return (
      <ReadyStep
        importedCount={importedCount}
        providerCount={providerCount}
        onComplete={handleComplete}
      />
    );
  }

  return null;
}
