'use client';

import React from 'react';
import { DynamicRuleSchema, DynamicRuleField } from '@/lib/rules/default-checklist-config';
import { Info } from 'lucide-react';

interface DynamicRuleEngineProps {
  schema: DynamicRuleSchema;
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onBulkChange?: (values: Record<string, any>) => void;
}

export const DynamicRuleEngine: React.FC<DynamicRuleEngineProps> = ({
  schema,
  values,
  onChange,
}) => {
  const evaluateDependency = (field: DynamicRuleField): boolean => {
    if (!field.dependsOn) return true;

    const { field: targetField, operator, value: targetVal } = field.dependsOn;
    const parentValue = values[targetField];

    switch (operator) {
      case 'truthy':
        return Boolean(parentValue);
      case 'falsy':
        return !parentValue;
      case 'equals':
        return parentValue === targetVal;
      case 'not_equals':
        return parentValue !== targetVal;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Schema Header Metadata */}
      <div className="p-4 rounded-xl bg-white border border-[#BEC3C8] shadow-card flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-extrabold text-[#0C3B5D]">{schema.title}</h3>
          <p className="text-xs text-[#302D2D]/80 mt-0.5">{schema.authority}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2 py-0.5 rounded bg-[#E8EBEB] border border-[#BEC3C8] text-[#0C3B5D] font-mono font-bold">
            v{schema.version}
          </span>
          <span className="text-[11px] px-2.5 py-0.5 rounded bg-[#0C3B5D] text-white font-bold">
            Rule Engine Active
          </span>
        </div>
      </div>

      {/* Checklist Sections with Alternating Backgrounds */}
      {schema.sections.map((section, sIdx) => (
        <div
          key={section.sectionId}
          className={`p-6 rounded-2xl border border-[#BEC3C8] space-y-4 shadow-card ${
            sIdx % 2 === 0 ? 'bg-white' : 'bg-[#E8EBEB]/50'
          }`}
        >
          <div className="border-b border-[#BEC3C8]/70 pb-3">
            <h4 className="text-base font-extrabold text-[#0C3B5D]">{section.sectionTitle}</h4>
            <p className="text-xs text-[#302D2D]/80 mt-0.5">{section.description}</p>
          </div>

          <div className="space-y-4 pt-1">
            {section.fields.map((field) => {
              const isVisible = evaluateDependency(field);
              if (!isVisible) return null;

              const currentValue = values[field.key];

              return (
                <div
                  key={field.key}
                  className="p-4 rounded-xl bg-white border border-[#BEC3C8] shadow-sm space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <label className="text-xs font-bold text-[#0C3B5D] cursor-pointer">
                      {field.label}{' '}
                      {field.required && <span className="text-red-500">*</span>}
                    </label>

                    {field.dependsOn && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#AC6953]/15 text-[#AC6953] border border-[#AC6953]/30">
                        Conditional Trigger
                      </span>
                    )}
                  </div>

                  {field.helpText && (
                    <p className="text-[11px] text-[#302D2D]/70 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5 text-[#2C638A] shrink-0" />
                      <span>{field.helpText}</span>
                    </p>
                  )}

                  {/* Field Control Renderers */}
                  <div className="pt-1">
                    {field.type === 'boolean' && (
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={Boolean(currentValue)}
                          onChange={(e) => onChange(field.key, e.target.checked)}
                          className="w-5 h-5 rounded border-[#BEC3C8] text-[#0C3B5D] focus:ring-[#0C3B5D] cursor-pointer"
                        />
                        <span
                          className={`text-xs font-bold ${
                            currentValue ? 'text-emerald-700' : 'text-[#302D2D]/70'
                          }`}
                        >
                          {currentValue ? 'CONFIRMED / YES' : 'NOT VERIFIED / NO'}
                        </span>
                      </label>
                    )}

                    {field.type === 'select' && (
                      <select
                        value={currentValue || ''}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        className="w-full text-xs font-medium rounded-xl bg-[#FDFEFE] border border-[#BEC3C8] text-[#302D2D] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0C3B5D]"
                      >
                        <option value="">-- Select Option --</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'radio' && (
                      <div className="space-y-2">
                        {field.options?.map((opt) => (
                          <label
                            key={opt.value}
                            className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                              currentValue === opt.value
                                ? 'bg-[#E8EBEB] border-[#0C3B5D] text-[#0C3B5D] font-bold shadow-sm'
                                : 'bg-[#FDFEFE] border-[#BEC3C8] text-[#302D2D] hover:border-[#2C638A]'
                            }`}
                          >
                            <input
                              type="radio"
                              name={field.key}
                              value={opt.value}
                              checked={currentValue === opt.value}
                              onChange={(e) => onChange(field.key, e.target.value)}
                              className="text-[#0C3B5D] focus:ring-[#0C3B5D]"
                            />
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={currentValue || ''}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        placeholder="Enter observation notes..."
                        className="w-full text-xs rounded-xl bg-[#FDFEFE] border border-[#BEC3C8] text-[#302D2D] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0C3B5D]"
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        rows={3}
                        value={currentValue || ''}
                        onChange={(e) => onChange(field.key, e.target.value)}
                        placeholder="Enter formal statutory remarks..."
                        className="w-full text-xs rounded-xl bg-[#FDFEFE] border border-[#BEC3C8] text-[#302D2D] p-3 focus:outline-none focus:ring-2 focus:ring-[#0C3B5D]"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
