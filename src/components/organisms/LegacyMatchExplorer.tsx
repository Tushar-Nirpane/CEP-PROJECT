'use client';

import React, { useState, useEffect } from 'react';
import { Search, Database, UserX, ArrowRight } from 'lucide-react';
import { legacyRollEngine, SearchMatchResult } from '@/lib/db/sqlite-indexeddb-engine';
import { MatchScoreCard } from '../molecules/MatchScoreCard';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { useVerificationStore } from '@/stores/verificationStore';

interface LegacyMatchExplorerProps {
  onMatchConfirmed: (record: SearchMatchResult | null) => void;
}

export const LegacyMatchExplorer: React.FC<LegacyMatchExplorerProps> = ({ onMatchConfirmed }) => {
  const { manualSearchQuery, setManualSearchQuery, selectedLegacyRecord, setSelectedLegacyRecord } =
    useVerificationStore();

  const [matches, setMatches] = useState<SearchMatchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecordsInDb, setTotalRecordsInDb] = useState(0);
  const [partFilter] = useState('');

  useEffect(() => {
    const initDb = async () => {
      const count = await legacyRollEngine.initialize();
      setTotalRecordsInDb(count);
      runSearch();
    };
    initDb();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const runSearch = async () => {
    setIsLoading(true);
    try {
      const results = await legacyRollEngine.searchVoter({
        queryName: manualSearchQuery.name,
        queryEpic: manualSearchQuery.epic,
        queryRelative: manualSearchQuery.relative,
        partFilter,
        minScoreThreshold: 20,
      });
      setMatches(results);

      // Auto-select if top match is >= 95%
      if (!selectedLegacyRecord && results.length > 0 && results[0].matchScore >= 95) {
        setSelectedLegacyRecord(results[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecord = (record: SearchMatchResult) => {
    setSelectedLegacyRecord(record);
  };

  const handleProceed = () => {
    onMatchConfirmed(selectedLegacyRecord);
  };

  const handleProceedWithoutMatch = () => {
    setSelectedLegacyRecord(null);
    onMatchConfirmed(null);
  };

  return (
    <div className="space-y-6">
      {/* Search Bar & Query Controls */}
      <div className="p-5 rounded-2xl bg-white border border-[#BEC3C8] shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#BEC3C8]/60 pb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-[#0C3B5D]" />
            <h3 className="text-sm font-extrabold text-[#0C3B5D]">
              2002-04 Legacy Voter Roll Local Snapshot
            </h3>
          </div>
          <Badge variant="blue">
            {totalRecordsInDb} Records Indexed in Browser OPFS/IDB
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold text-[#0C3B5D] block mb-1">
              Search Name (Soundex / Fuzzy)
            </label>
            <div className="relative">
              <input
                type="text"
                value={manualSearchQuery.name}
                onChange={(e) => setManualSearchQuery({ name: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                placeholder="e.g. Ramesh Sharma"
                className="w-full text-xs rounded-xl bg-[#FDFEFE] border border-[#BEC3C8] text-[#302D2D] pl-8 pr-3 py-2.5 focus:ring-2 focus:ring-[#0C3B5D] focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-[#2C638A] absolute left-2.5 top-3" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#0C3B5D] block mb-1">
              Exact Legacy EPIC No.
            </label>
            <input
              type="text"
              value={manualSearchQuery.epic}
              onChange={(e) => setManualSearchQuery({ epic: e.target.value.toUpperCase() })}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder="e.g. XYZ1029384"
              className="w-full text-xs font-mono font-bold rounded-xl bg-[#FDFEFE] border border-[#BEC3C8] text-[#302D2D] px-3 py-2.5 focus:ring-2 focus:ring-[#0C3B5D] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#0C3B5D] block mb-1">
              Relative / Parent Name
            </label>
            <input
              type="text"
              value={manualSearchQuery.relative}
              onChange={(e) => setManualSearchQuery({ relative: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && runSearch()}
              placeholder="e.g. Dwarka Prasad"
              className="w-full text-xs rounded-xl bg-[#FDFEFE] border border-[#BEC3C8] text-[#302D2D] px-3 py-2.5 focus:ring-2 focus:ring-[#0C3B5D] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="text-[11px] text-[#302D2D]/70 font-medium">
            Powered by Double Metaphone & Levenshtein distance matrix
          </span>
          <Button
            onClick={runSearch}
            isLoading={isLoading}
            variant="primary"
            size="sm"
            leftIcon={<Search className="w-3.5 h-3.5" />}
          >
            Search Snapshot
          </Button>
        </div>
      </div>

      {/* Search Results List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#0C3B5D]">
          <span>Ranked Phonetic Matches ({matches.length})</span>
          {selectedLegacyRecord && (
            <span className="text-[#AC6953]">
              Selected: {selectedLegacyRecord.fullName} ({selectedLegacyRecord.epicNo})
            </span>
          )}
        </div>

        {matches.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white border border-[#BEC3C8] shadow-card space-y-3">
            <UserX className="w-8 h-8 text-[#BEC3C8] mx-auto" />
            <p className="text-sm text-[#302D2D]/80 font-medium">
              No matching legacy records found in 2002-04 snapshot.
            </p>
            <Button onClick={handleProceedWithoutMatch} variant="outline" size="sm">
              Proceed as New / Unlinked Registration
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {matches.map((record) => (
              <MatchScoreCard
                key={record.id}
                match={record}
                isSelected={selectedLegacyRecord?.id === record.id}
                onSelect={handleSelectRecord}
                queryName={manualSearchQuery.name}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button onClick={handleProceedWithoutMatch} variant="ghost" size="md">
          Skip Linkage (No Match)
        </Button>

        <Button
          onClick={handleProceed}
          disabled={!selectedLegacyRecord}
          variant="cta"
          size="lg"
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Confirm Linkage & Proceed to Checklist
        </Button>
      </div>
    </div>
  );
};
