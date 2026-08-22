'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react';
import { StepProgress } from '@/components/atoms/StepProgress';
import { OCRScanPipeline } from '@/components/organisms/OCRScanPipeline';
import { LegacyMatchExplorer } from '@/components/organisms/LegacyMatchExplorer';
import { DynamicRuleEngine } from '@/components/organisms/DynamicRuleEngine';
import { DEFAULT_DYNAMIC_RULE_SCHEMA } from '@/lib/rules/default-checklist-config';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { useVerificationStore } from '@/stores/verificationStore';
import { useSyncStore } from '@/stores/syncStore';
import {
  encryptVerificationRecord,
  VerificationRecord,
} from '@/lib/crypto/sync-bundle';

export default function VerifyPage() {
  const {
    currentStep,
    setStep,
    officerId,
    partNo,
    ocrState,
    selectedLegacyRecord,
    checklistValues,
    setChecklistValue,
    setGeneratedBundleId,
    isSealing,
    setIsSealing,
    resetWizard,
  } = useVerificationStore();

  const { enqueueBundle } = useSyncStore();
  const [sealSummary, setSealSummary] = useState<any>(null);

  const handleOCRComplete = () => {
    setStep(2);
  };

  const handleMatchComplete = () => {
    setStep(3);
  };

  const handleExecuteSeal = async () => {
    setIsSealing(true);

    try {
      const record: VerificationRecord = {
        id: 'REC-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
        epicNo: ocrState?.extractedEpic || selectedLegacyRecord?.epicNo || 'PENDING-EPIC',
        fullName: ocrState?.extractedName || selectedLegacyRecord?.fullName || 'Verified Citizen',
        relativeName: ocrState?.extractedRelative || selectedLegacyRecord?.relativeName,
        partNo,
        serialNo: selectedLegacyRecord?.serialNo ? `#${selectedLegacyRecord.serialNo}` : undefined,
        verificationStatus: checklistValues.fieldVerdict || 'VERIFIED',
        matchScore: selectedLegacyRecord?.matchScore || 0,
        ocrConfidence: ocrState?.confidence || 90,
        checklistResponses: checklistValues,
        discrepancyNotes: checklistValues.officerRemarks,
        timestamp: new Date().toISOString(),
        officerId,
        geoCoordinates: {
          latitude: 26.8467,
          longitude: 80.9462,
          accuracy: 8,
        },
      };

      const encryptedBundle = await encryptVerificationRecord(record, officerId);
      await enqueueBundle(encryptedBundle);

      setGeneratedBundleId(encryptedBundle.bundleId);
      setSealSummary({
        bundleId: encryptedBundle.bundleId,
        checksum: encryptedBundle.checksum,
        algorithm: encryptedBundle.algorithm,
        status: record.verificationStatus,
        voter: record.fullName,
        epic: record.epicNo,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      setStep(4);
    } catch (err: any) {
      alert(`Cryptographic sealing error: ${err.message}`);
    } finally {
      setIsSealing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Progress Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#BEC3C8] shadow-card">
        <StepProgress currentStep={currentStep} onSelectStep={(step) => setStep(step)} />
      </div>

      {/* Step 1: On-Device Document OCR */}
      {currentStep === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#0C3B5D] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0C3B5D] text-white text-xs flex items-center justify-center font-bold">
                1
              </span>
              Capture & On-Device OCR Extraction
            </h2>
            <Badge variant="blue">Tesseract.js Web Worker</Badge>
          </div>
          <OCRScanPipeline onScanComplete={handleOCRComplete} />
        </div>
      )}

      {/* Step 2: 2002-04 Legacy Roll Phonetic Matching */}
      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#0C3B5D] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0C3B5D] text-white text-xs flex items-center justify-center font-bold">
                2
              </span>
              2002-04 Legacy Voter Roll Linkage
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to OCR
            </Button>
          </div>
          <LegacyMatchExplorer onMatchConfirmed={handleMatchComplete} />
        </div>
      )}

      {/* Step 3: Dynamic Rule Engine Checklist */}
      {currentStep === 3 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[#0C3B5D] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#0C3B5D] text-white text-xs flex items-center justify-center font-bold">
                3
              </span>
              Statutory Field Checklist (Dynamic Engine)
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(2)}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              Back to Match
            </Button>
          </div>

          <DynamicRuleEngine
            schema={DEFAULT_DYNAMIC_RULE_SCHEMA}
            values={checklistValues}
            onChange={(key, val) => setChecklistValue(key, val)}
          />

          <div className="flex justify-between items-center pt-4">
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(2)}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Previous Step
            </Button>

            <Button
              variant="cta"
              size="lg"
              onClick={handleExecuteSeal}
              isLoading={isSealing}
              leftIcon={<Lock className="w-4 h-4" />}
            >
              Cryptographically Seal & Enqueue
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Verification Sealed & Encrypted */}
      {currentStep === 4 && (
        <div className="p-8 rounded-3xl bg-white border border-[#BEC3C8] text-center space-y-6 shadow-card">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-extrabold text-[#0C3B5D] tracking-tight">
              Verification Cryptographically Sealed
            </h2>
            <p className="text-xs text-[#302D2D]/80">
              The record has been encrypted on-device with <strong className="text-[#0C3B5D]">AES-GCM-256</strong> and safely stored in browser IndexedDB.
            </p>
          </div>

          {sealSummary && (
            <div className="p-5 rounded-2xl bg-[#E8EBEB] border border-[#BEC3C8] text-left max-w-md mx-auto space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-[#302D2D]/70 font-semibold">Bundle ID:</span>
                <span className="text-[#AC6953] font-bold">{sealSummary.bundleId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#302D2D]/70 font-semibold">Elector:</span>
                <span className="text-[#0C3B5D] font-bold">{sealSummary.voter}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#302D2D]/70 font-semibold">EPIC No:</span>
                <span className="text-[#0C3B5D] font-bold">{sealSummary.epic}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#302D2D]/70 font-semibold">Status:</span>
                <span className="text-emerald-700 font-extrabold">{sealSummary.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#302D2D]/70 font-semibold">Algorithm:</span>
                <span className="text-[#302D2D] font-medium">{sealSummary.algorithm}</span>
              </div>
              <div className="pt-1 text-[10px] text-[#302D2D]/70 break-all">
                <span className="text-[#0C3B5D] font-bold block">SHA-256 Digest:</span>
                {sealSummary.checksum}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button
              onClick={resetWizard}
              variant="cta"
              size="md"
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Verify Next Elector
            </Button>

            <Link href="/sync">
              <Button
                variant="outline"
                size="md"
                leftIcon={<ShieldCheck className="w-4 h-4" />}
              >
                Inspect in Sync Center
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
