'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  FileCode2,
  UploadCloud,
} from 'lucide-react';
import { useSyncStore } from '@/stores/syncStore';
import { decryptSyncBundle, EncryptedSyncBundle, VerificationRecord } from '@/lib/crypto/sync-bundle';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';

export const SyncCenter: React.FC = () => {
  const {
    pendingBundles,
    syncHistory,
    isOnline,
    isSyncing,
    lastSyncTimestamp,
    triggerUplinkSync,
    removeBundle,
    clearAllPending,
  } = useSyncStore();

  const [selectedBundle, setSelectedBundle] = useState<EncryptedSyncBundle | null>(null);
  const [decryptedRecord, setDecryptedRecord] = useState<VerificationRecord | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  const handleInspectBundle = async (bundle: EncryptedSyncBundle) => {
    setSelectedBundle(bundle);
    setDecryptedRecord(null);
  };

  const handleDecrypt = async () => {
    if (!selectedBundle) return;
    setIsDecrypting(true);
    try {
      const record = await decryptSyncBundle(selectedBundle);
      setDecryptedRecord(record);
    } catch (err: any) {
      alert(`Decryption Error: ${err.message}`);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleSyncUplink = async () => {
    setSyncFeedback(null);
    const res = await triggerUplinkSync();
    setSyncFeedback({
      message: res.message,
      success: res.success,
    });
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(pendingBundles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SIR_SYNC_BUNDLES_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Uplink Action */}
      <div className="p-6 rounded-2xl bg-[#0C3B5D] text-white shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
            <h3 className="text-lg font-bold text-white">Local-First Cryptographic Sync Vault</h3>
          </div>
          <p className="text-xs text-white/80">
            {pendingBundles.length} encrypted bundle(s) stored locally in browser IndexedDB with AES-GCM-256.
          </p>
          {lastSyncTimestamp && (
            <p className="text-[11px] text-white/70 font-mono">
              Last Gateway Ingestion: {new Date(lastSyncTimestamp).toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {pendingBundles.length > 0 && (
            <Button
              onClick={handleExportJSON}
              variant="outline"
              size="md"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Air-Gap Bundle
            </Button>
          )}

          <Button
            onClick={handleSyncUplink}
            isLoading={isSyncing}
            variant="cta"
            size="md"
            leftIcon={<UploadCloud className="w-4 h-4" />}
          >
            {isOnline ? 'Push to Central Ingestion' : 'Offline (Queued in IDB)'}
          </Button>
        </div>
      </div>

      {syncFeedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 border shadow-sm ${
            syncFeedback.success
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-amber-50 border-amber-300 text-amber-900'
          }`}
        >
          {syncFeedback.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span>{syncFeedback.message}</span>
        </div>
      )}

      {/* Main Grid: Pending Bundles List + Encrypted Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Bundles List */}
        <div className="lg:col-span-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-[#0C3B5D]">
            <span>Pending Encrypted Bundles ({pendingBundles.length})</span>
            {pendingBundles.length > 0 && (
              <button
                onClick={clearAllPending}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors"
              >
                Clear Queue
              </button>
            )}
          </div>

          {pendingBundles.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-white border border-[#BEC3C8] shadow-card space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h5 className="text-sm font-bold text-[#0C3B5D]">All Bundles Fully Synced</h5>
              <p className="text-xs text-[#302D2D]/70 font-medium">
                No local pending verifications. New records created in Field Verify will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
              {pendingBundles.map((bundle) => {
                const isSelected = selectedBundle?.bundleId === bundle.bundleId;

                return (
                  <div
                    key={bundle.bundleId}
                    onClick={() => handleInspectBundle(bundle)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? 'bg-[#E8EBEB] border-[#AC6953] shadow-md ring-2 ring-[#AC6953]/20'
                        : 'bg-white border-[#BEC3C8] hover:border-[#2C638A]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-[#AC6953]" />
                          <span className="text-xs font-bold font-mono text-[#0C3B5D]">
                            {bundle.bundleId}
                          </span>
                          <Badge
                            variant={
                              bundle.metadata.verifiedStatus === 'VERIFIED'
                                ? 'emerald'
                                : bundle.metadata.verifiedStatus === 'DISCREPANCY'
                                ? 'amber'
                                : 'crimson'
                            }
                            size="sm"
                          >
                            {bundle.metadata.verifiedStatus}
                          </Badge>
                        </div>
                        <p className="text-xs font-bold text-[#0C3B5D] mt-1">
                          {bundle.metadata.voterName} ({bundle.metadata.epicNo})
                        </p>
                        <p className="text-[11px] text-[#302D2D]/70 font-mono font-medium">
                          Part: {bundle.metadata.partNo} • {new Date(bundle.timestamp).toLocaleTimeString()}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeBundle(bundle.bundleId);
                        }}
                        className="text-[#BEC3C8] hover:text-red-600 p-1 transition-colors"
                        title="Delete Bundle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Encrypted Payload & Decryption Inspector */}
        <div className="lg:col-span-6">
          {selectedBundle ? (
            <div className="p-5 rounded-2xl bg-white border border-[#BEC3C8] shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-[#BEC3C8]/60 pb-3">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-[#0C3B5D]" />
                  <h4 className="text-xs font-extrabold text-[#0C3B5D]">
                    Bundle Inspector: {selectedBundle.bundleId}
                  </h4>
                </div>
                <Button
                  onClick={handleDecrypt}
                  isLoading={isDecrypting}
                  variant="outline"
                  size="sm"
                  leftIcon={<Unlock className="w-3.5 h-3.5" />}
                >
                  Verify Decryption
                </Button>
              </div>

              {/* Ciphertext Metrics */}
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className="text-[#302D2D]/70 font-semibold">Algorithm:</span>{' '}
                  <span className="text-[#0C3B5D] font-bold">{selectedBundle.algorithm}</span>
                </div>
                <div>
                  <span className="text-[#302D2D]/70 font-semibold">SHA-256 Checksum:</span>{' '}
                  <span className="text-[#2C638A] font-bold break-all">{selectedBundle.checksum}</span>
                </div>
                <div>
                  <span className="text-[#302D2D]/70 font-semibold">Initialization Vector (IV):</span>{' '}
                  <span className="text-[#302D2D] font-medium break-all">{selectedBundle.iv}</span>
                </div>
                <div>
                  <span className="text-[#302D2D]/70 font-semibold">AES-GCM Ciphertext (Base64):</span>
                  <div className="p-2.5 rounded-lg bg-[#E8EBEB] border border-[#BEC3C8] text-[10px] text-[#302D2D] max-h-24 overflow-y-auto break-all mt-1 font-mono">
                    {selectedBundle.encryptedData}
                  </div>
                </div>
              </div>

              {/* Decrypted Payload Output */}
              {decryptedRecord && (
                <div className="mt-4 pt-4 border-t border-[#BEC3C8]/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Payload Decrypted & SHA-256 Verified</span>
                  </div>
                  <pre className="p-3 rounded-xl bg-[#E8EBEB] border border-[#BEC3C8] text-[11px] text-[#302D2D] font-mono overflow-x-auto max-h-56">
                    {JSON.stringify(decryptedRecord, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center rounded-2xl bg-white border border-[#BEC3C8] shadow-card text-[#302D2D]/70 text-xs font-medium">
              Select any pending bundle on the left to inspect its on-device cryptographic seal and cipher data.
            </div>
          )}
        </div>
      </div>

      {/* Sync History Audit Trail */}
      {syncHistory.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-[#BEC3C8] shadow-card space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#0C3B5D]">
            Recent Ingestion Gateway Receipts ({syncHistory.length})
          </h4>
          <div className="space-y-2">
            {syncHistory.slice(0, 5).map((hist) => (
              <div
                key={hist.batchId}
                className="flex items-center justify-between p-3 rounded-xl bg-[#E8EBEB] border border-[#BEC3C8] text-xs font-mono"
              >
                <div>
                  <span className="font-bold text-[#0C3B5D]">{hist.batchId}</span>
                  <span className="text-[#302D2D]/80 ml-2 font-medium">({hist.count} record(s) transmitted)</span>
                </div>
                <div className="text-right">
                  <span className="text-[#2C638A] font-bold">{hist.responseRef}</span>
                  <span className="text-[10px] text-[#302D2D]/70 block font-medium">
                    {new Date(hist.syncedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
