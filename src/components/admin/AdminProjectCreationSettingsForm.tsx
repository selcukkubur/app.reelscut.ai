'use client';

import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Api } from '@/lib/api-client';
import type { AdminProjectCreationSettingsDTO } from '@/shared/types';

interface Props {
  initial: AdminProjectCreationSettingsDTO;
}

const MAX_REASON_LENGTH = 500;
const REQUIRED_DISABLED_REASON = 'Please add a short reason before disabling project creation.';

export function AdminProjectCreationSettingsForm({ initial }: Props) {
  const [settings, setSettings] = useState<AdminProjectCreationSettingsDTO>(initial);
  const [draftReason, setDraftReason] = useState(initial.projectCreationDisabledReason);
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [pendingChange, setPendingChange] = useState<{ nextEnabled: boolean } | null>(null);

  const normalizedDraftReason = draftReason.trim();
  const reasonForSave = normalizedDraftReason.slice(0, MAX_REASON_LENGTH);

  const requestToggle = (nextEnabled: boolean) => {
    if (saving) return;
    setValidationError(null);
    setPendingChange({ nextEnabled });
  };

  const apply = async () => {
    if (!pendingChange) return;
    const nextEnabled = pendingChange.nextEnabled;

    if (!nextEnabled && !reasonForSave) {
      setValidationError(REQUIRED_DISABLED_REASON);
      return;
    }

    const previous = settings;
    const nextState: AdminProjectCreationSettingsDTO = {
      projectCreationEnabled: nextEnabled,
      projectCreationDisabledReason: reasonForSave,
    };

    setSettings(nextState);
    setSaving(true);
    setValidationError(null);
    try {
      const updated = await Api.updateAdminProjectCreationSettings(nextState);
      setSettings(updated);
      setDraftReason(updated.projectCreationDisabledReason);
    } catch (err) {
      console.error('Failed to update project creation settings', err);
      setSettings(previous);
      setDraftReason(previous.projectCreationDisabledReason);
      return;
    } finally {
      setSaving(false);
      setPendingChange(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
        <div className="space-y-1">
        <Label className="text-base font-medium text-gray-900 dark:text-gray-100">Project creation</Label>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Turn project creation on/off across the whole app.
          </p>
        </div>
        <Switch
          checked={settings.projectCreationEnabled}
          onCheckedChange={requestToggle}
          disabled={saving || !!pendingChange}
          aria-label="Enable project creation"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="project-creation-reason" className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Reason (shown to users when disabled)
        </Label>
        <Textarea
          id="project-creation-reason"
          value={draftReason}
          maxLength={MAX_REASON_LENGTH}
          onChange={(e) => setDraftReason(e.target.value)}
          className="min-h-28 resize-y bg-white dark:bg-gray-950"
          placeholder="Explain why creation is disabled and when it may resume..."
          disabled={saving}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          A reason is required whenever project creation is disabled.
        </p>
        {!settings.projectCreationEnabled ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
            <p className="leading-5">Creation is disabled. Live reason: {reasonForSave || 'No reason provided.'}</p>
          </div>
        ) : null}
        {validationError ? <p className="text-sm text-rose-600 dark:text-rose-300">{validationError}</p> : null}
      </div>

      <Dialog
        open={!!pendingChange}
        onOpenChange={(open) => {
          if (!open && !saving) {
            setPendingChange(null);
            setValidationError(null);
          }
        }}
      >
        <DialogContent className="max-w-md" ariaDescription="Confirm project creation change">
          <DialogHeader>
            <DialogTitle>Confirm project creation setting</DialogTitle>
            <DialogDescription className="sr-only">Confirm changing project creation availability.</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action will {pendingChange?.nextEnabled ? 'enable' : 'disable'} project creation across the app.
          </p>
          {validationError ? <p className="text-sm text-rose-600 dark:text-rose-300">{validationError}</p> : null}
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                if (!saving) {
                  setPendingChange(null);
                  setValidationError(null);
                }
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={apply} disabled={saving}>
              {saving ? 'Saving…' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
