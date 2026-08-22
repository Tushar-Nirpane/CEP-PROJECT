'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileCheck2,
  Search,
  Database,
  Cpu,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { MetricCard } from '@/components/molecules/MetricCard';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import { useSyncStore } from '@/stores/syncStore';
import { useVerificationStore } from '@/stores/verificationStore';
import { legacyRollEngine } from '@/lib/db/sqlite-indexeddb-engine';

export default function DashboardPage() {
  const { pendingBundles, isOnline, initializeStore } = useSyncStore();
  const { officerId, partNo, resetWizard } = useVerificationStore();
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    initializeStore();
    legacyRollEngine.initialize().then(setTotalRecords);
  }, [initializeStore]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="rounded-3xl bg-[#FDFEFE] border border-[#BEC3C8] p-6 sm:p-10 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="cta" icon={<Sparkles className="w-3 h-3" />}>
                OFFLINE-FIRST FIELD AUDIT ENGINE
              </Badge>
              <span className="text-xs text-[#2C638A] font-bold font-mono">
                Jurisdiction: {partNo}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0C3B5D] tracking-tight">
              SIR-Assist Field Officer Workspace
            </h1>
            <p className="text-sm sm:text-base text-[#302D2D] leading-relaxed">
              Verify electors and audit decadal legacy roll linkages (2002-04) completely offline.
              Features zero-leak on-device OCR, client-side Soundex matching, and Web Crypto AES-GCM-256 seal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/verify" onClick={resetWizard}>
              <Button
                variant="cta"
                size="lg"
                leftIcon={<FileCheck2 className="w-5 h-5" />}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Start Verification
              </Button>
            </Link>

            <Link href="/search">
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Search className="w-5 h-5" />}
              >
                Legacy Roll (02-04)
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row (Cards: Background #FFFFFF, Heading #0C3B5D, Secondary #2C638A, Border #BEC3C8) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Indexed 2002-04 Roll"
          value={totalRecords}
          subtitle="Cached in Browser OPFS/IDB"
          icon={<Database className="w-5 h-5" />}
          trend="● 100% Offline Ready"
        />
        <MetricCard
          title="Pending Sync Bundles"
          value={pendingBundles.length}
          subtitle="Encrypted with AES-GCM-256"
          icon={<Lock className="w-5 h-5" />}
          trend={
            pendingBundles.length > 0
              ? `${pendingBundles.length} awaiting uplink`
              : 'All bundles up-to-date'
          }
        />
        <MetricCard
          title="Field Officer ID"
          value={officerId.split('-')[0]}
          subtitle={officerId}
          icon={<ShieldCheck className="w-5 h-5" />}
          trend="Certified Session"
        />
        <MetricCard
          title="Gateway Uplink Status"
          value={isOnline ? 'Online' : 'Offline'}
          subtitle={isOnline ? 'Direct central ingestion' : 'Buffered in local vault'}
          icon={<Cpu className="w-5 h-5" />}
          trend={isOnline ? '● Ready for instant sync' : '● Stored locally in IDB'}
        />
      </div>

      {/* Alternating Section (Background: #E8EBEB) */}
      <div className="p-8 rounded-3xl bg-[#E8EBEB] border border-[#BEC3C8] space-y-6">
        <div className="max-w-xl">
          <h2 className="text-xl font-extrabold text-[#0C3B5D]">
            Core Technical Capabilities
          </h2>
          <p className="text-xs text-[#302D2D] mt-1">
            Engineered for high resilience in remote locations with intermittent or non-existent connectivity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Module 1: Zero-Leak OCR */}
          <div className="p-6 rounded-2xl bg-white border border-[#BEC3C8] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8EBEB] flex items-center justify-center text-[#0C3B5D]">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-[#0C3B5D]">On-Device OCR Worker</h3>
            <p className="text-xs text-[#302D2D] leading-relaxed">
              Worker-thread based Tesseract.js pipeline extracts EPIC numbers and names in milliseconds.
              No photographic imagery or citizen PII ever leaves browser sandboxes.
            </p>
          </div>

          {/* Module 2: Phonetic Soundex Engine */}
          <div className="p-6 rounded-2xl bg-white border border-[#BEC3C8] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8EBEB] flex items-center justify-center text-[#0C3B5D]">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-[#0C3B5D]">Phonetic & Levenshtein Matching</h3>
            <p className="text-xs text-[#302D2D] leading-relaxed">
              Combines Soundex and Double Metaphone indexing with tokenized Levenshtein similarity
              to resolve name variations and transliterations across decadal rolls.
            </p>
          </div>

          {/* Module 3: Web Crypto Vault */}
          <div className="p-6 rounded-2xl bg-white border border-[#BEC3C8] shadow-card space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8EBEB] flex items-center justify-center text-[#0C3B5D]">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-[#0C3B5D]">Encrypted Sync Bundles</h3>
            <p className="text-xs text-[#302D2D] leading-relaxed">
              Every completed verification is packaged into an AES-GCM-256 encrypted payload with
              SHA-256 checksums, ensuring physical device safety in remote outposts.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="p-6 rounded-2xl bg-white border border-[#BEC3C8] shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-sm font-extrabold text-[#0C3B5D]">Need to inspect queued uploads?</h4>
          <p className="text-xs text-[#302D2D]/80">
            View encrypted ciphertexts, verify decryption keys, or push to the central gateway in Sync Center.
          </p>
        </div>
        <Link href="/sync">
          <Button
            variant="outline"
            size="md"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Open Sync Center ({pendingBundles.length})
          </Button>
        </Link>
      </div>
    </div>
  );
}
