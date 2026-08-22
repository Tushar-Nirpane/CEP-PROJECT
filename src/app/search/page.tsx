'use client';

import React from 'react';
import { Database, Sparkles } from 'lucide-react';
import { LegacyMatchExplorer } from '@/components/organisms/LegacyMatchExplorer';
import { Badge } from '@/components/atoms/Badge';
import { useRouter } from 'next/navigation';
import { useVerificationStore } from '@/stores/verificationStore';

export default function SearchPage() {
  const router = useRouter();
  const { setStep } = useVerificationStore();

  const handleMatchSelect = () => {
    setStep(3);
    router.push('/verify');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-[#0C3B5D]" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0C3B5D] tracking-tight">
              2002-04 Legacy Voter Roll Explorer
            </h1>
          </div>
          <p className="text-xs text-[#302D2D]/80 mt-1">
            Standalone offline phonetic search across historic decadal voter lists stored in browser OPFS/IDB.
          </p>
        </div>

        <Badge variant="blue" icon={<Sparkles className="w-3 h-3" />}>
          Soundex & Levenshtein Engine Ready
        </Badge>
      </div>

      <LegacyMatchExplorer onMatchConfirmed={handleMatchSelect} />
    </div>
  );
}
