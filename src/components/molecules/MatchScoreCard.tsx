import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, UserCheck } from 'lucide-react';
import { SearchMatchResult } from '@/lib/db/sqlite-indexeddb-engine';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';

interface MatchScoreCardProps {
  match: SearchMatchResult;
  isSelected?: boolean;
  onSelect?: (match: SearchMatchResult) => void;
  queryName?: string;
}

export const MatchScoreCard: React.FC<MatchScoreCardProps> = ({
  match,
  isSelected = false,
  onSelect,
}) => {
  const getScoreBadge = (score: number) => {
    if (score >= 90) {
      return (
        <Badge variant="emerald" icon={<CheckCircle2 className="w-3 h-3" />}>
          {score}% EXACT / PHONETIC
        </Badge>
      );
    }
    if (score >= 70) {
      return (
        <Badge variant="amber" icon={<AlertTriangle className="w-3 h-3" />}>
          {score}% SOUNDEX MATCH
        </Badge>
      );
    }
    return (
      <Badge variant="crimson" icon={<XCircle className="w-3 h-3" />}>
        {score}% PARTIAL MATCH
      </Badge>
    );
  };

  return (
    <div
      onClick={() => onSelect?.(match)}
      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm ${
        isSelected
          ? 'bg-[#E8EBEB]/60 border-[#AC6953] ring-2 ring-[#AC6953]/20 shadow-md'
          : 'bg-white border-[#BEC3C8] hover:border-[#2C638A] hover:bg-[#FDFEFE]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-[#0C3B5D]">{match.fullName}</h4>
            <span className="text-xs px-2 py-0.5 rounded bg-[#E8EBEB] text-[#0C3B5D] font-mono font-bold">
              {match.epicNo}
            </span>
          </div>

          <p className="text-xs text-[#302D2D]/80 mt-1">
            <span className="text-[#2C638A] font-semibold">Relative:</span> {match.relativeName} (
            {match.relationType}) • <span className="text-[#2C638A] font-semibold">Age:</span> {match.age} •{' '}
            <span className="text-[#2C638A] font-semibold">Gender:</span> {match.gender}
          </p>
        </div>

        <div>{getScoreBadge(match.matchScore)}</div>
      </div>

      <div className="mt-3 pt-3 border-t border-[#BEC3C8]/60 flex flex-wrap items-center justify-between gap-2 text-xs text-[#302D2D]/80">
        <div className="flex items-center gap-4">
          <span>
            <strong className="text-[#0C3B5D]">Part:</strong> {match.partNo} (Sec {match.sectionNo})
          </span>
          <span>
            <strong className="text-[#0C3B5D]">Serial:</strong> #{match.serialNo}
          </span>
          <span className="hidden sm:inline">
            <strong className="text-[#0C3B5D]">Soundex:</strong>{' '}
            <code className="text-[#AC6953] font-mono font-bold">{match.soundexName}</code>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isSelected ? (
            <span className="text-xs font-bold text-[#AC6953] flex items-center gap-1">
              <UserCheck className="w-4 h-4" /> Selected Linkage
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(match);
              }}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Select
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
