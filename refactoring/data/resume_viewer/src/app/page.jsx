import React, { useState, useCallback } from "react";
import { Button, Card, Pill, Input, TextArea } from "../../components/ui";
import {
  FileText,
  Link as LinkIcon,
  User,
  ArrowRight,
  Loader2,
  Sparkles,
  Upload,
} from "lucide-react";
import useUpload from "@/utils/useUpload";

export default function CreateResumePage() {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(null);
  const [input, setInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);

  const onStartParsing = async () => {
    if (!input || input.trim().length === 0) {
      alert(
        "Please provide some information about yourself to create your resume.",
      );
      return;
    }

    setIsParsing(true);
    try {
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawInput: input, type: method }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Parsing failed");
      }

      const parsedData = await response.json();

      // Save the new resume
      const saveResponse = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Resume - ${parsedData.personalInfo?.fullName || "New"}`,
          content: parsedData,
          template_id: "classic",
        }),
      });

      if (!saveResponse.ok) {
        throw new Error("Failed to save resume");
      }

      const savedResume = await saveResponse.json();
      window.location.href = `/resumes/${savedResume.id}`;
    } catch (error) {
      console.error(error);
      alert(
        error.message ||
          "Something went wrong while creating your resume. Please try again with different content.",
      );
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12">
          <a
            href="/"
            className="text-xs font-medium text-[#6B7280] hover:text-[#111827] mb-4 inline-block"
          >
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-semibold text-[#111827] tracking-tight">
            Create ATS Resume
          </h1>
          <p className="text-[#6B7280] text-sm">
            Choose from 12 professional templates and let AI optimize your
            content
          </p>
        </header>

        <div className="flex gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? "bg-[#2563EB]" : "bg-[#E5E7EB]"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-[#111827]">
              How would you like to start?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => {
                  setMethod("text");
                  setStep(2);
                }}
                className="flex flex-col items-start p-6 bg-white border border-[#E5E7EB] rounded-md hover:border-[#2563EB] hover:bg-[#F9FAFB] transition-all text-left group"
              >
                <div className="p-3 bg-[#EFF6FF] rounded-md text-[#2563EB] mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  <User size={24} />
                </div>
                <h3 className="font-semibold text-[#111827] mb-1">
                  Manual Entry
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Type or paste your information from scratch.
                </p>
              </button>

              <button
                onClick={() => {
                  setMethod("file");
                  setStep(2);
                }}
                className="flex flex-col items-start p-6 bg-white border border-[#E5E7EB] rounded-md hover:border-[#2563EB] hover:bg-[#F9FAFB] transition-all text-left group"
              >
                <div className="p-3 bg-[#EFF6FF] rounded-md text-[#2563EB] mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  <Upload size={24} />
                </div>
                <h3 className="font-semibold text-[#111827] mb-1">
                  Paste Resume
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Copy text from your existing resume.
                </p>
              </button>

              <button
                onClick={() => {
                  setMethod("linkedin");
                  setStep(2);
                }}
                className="flex flex-col items-start p-6 bg-white border border-[#E5E7EB] rounded-md hover:border-[#2563EB] hover:bg-[#F9FAFB] transition-all text-left group"
              >
                <div className="p-3 bg-[#EFF6FF] rounded-md text-[#2563EB] mb-4 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  <LinkIcon size={24} />
                </div>
                <h3 className="font-semibold text-[#111827] mb-1">
                  LinkedIn Profile
                </h3>
                <p className="text-xs text-[#6B7280]">
                  Paste details from your LinkedIn profile.
                </p>
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <Card className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-[#111827]">
              {method === "file"
                ? "Paste your resume text"
                : method === "linkedin"
                  ? "Paste LinkedIn Profile Content"
                  : "Tell us about yourself"}
            </h2>

            <TextArea
              label={
                method === "linkedin"
                  ? "Copy and paste text from your LinkedIn 'About' or 'Experience' sections"
                  : method === "file"
                    ? "Paste the text from your current resume here"
                    : "Share your experience, education, skills, and any relevant information"
              }
              placeholder={
                method === "linkedin"
                  ? "About: I'm a software engineer with 5 years of experience...\nExperience: Software Engineer at Tech Co..."
                  : method === "file"
                    ? "John Doe\njohn@email.com | (555) 123-4567\n\nExperience:\nSoftware Engineer at Tech Co..."
                    : "I'm a software engineer with 5 years of experience in full-stack development. I've worked at Tech Co as a Senior Developer..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-80"
            />

            <div className="flex justify-between mt-4">
              <Button variant="ghost" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!input || input.trim().length === 0}
              >
                Continue
                <ArrowRight size={16} />
              </Button>
            </div>
          </Card>
        )}

        {step === 3 && (
          <Card className="flex flex-col items-center text-center gap-6 py-12">
            <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB]">
              <Sparkles
                size={32}
                className={isParsing ? "animate-pulse" : ""}
              />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-[#111827] tracking-tight">
                Ready to Create Your Resume
              </h2>
              <p className="text-[#6B7280] text-sm mt-2 max-w-sm">
                Our AI will structure your information and optimize it for ATS
                systems. You'll be able to choose from 12 professional
                templates.
              </p>
            </div>

            <Button
              className="w-full max-w-xs h-12"
              onClick={onStartParsing}
              disabled={isParsing}
            >
              {isParsing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  Generate My Resume
                </>
              )}
            </Button>

            <button
              className="text-xs text-[#6B7280] hover:text-[#111827]"
              onClick={() => setStep(2)}
              disabled={isParsing}
            >
              Need to change something? Go back
            </button>
          </Card>
        )}
      </div>
    </div>
  );
}
