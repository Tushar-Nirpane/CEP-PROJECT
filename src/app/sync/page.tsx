'use client';

import React from 'react';
import { SyncCenter } from '@/components/organisms/SyncCenter';
import { RefreshCw, Lock } from 'lucide-react';
import { Badge } from '@/components/atoms/Badge';

export default function SyncPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 text-[#0C3B5D]" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#0C3B5D] tracking-tight">
              Cryptographic Sync Center & Uplink Gateway
            </h1>
          </div>
          <p className="text-xs text-[#302D2D]/80 mt-1">
            Audit, verify, export, and upload AES-GCM-256 encrypted verification bundles to central servers.
          </p>
        </div>

        <Badge variant="blue" icon={<Lock className="w-3 h-3" />}>
          AES-GCM-256 / SHA-256 AEAD Active
        </Badge>
      </div>

      <SyncCenter />
    </div>
  );
}
