import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

const backdrop = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
const panel = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 30 } },
  exit: { opacity: 0, y: 12, scale: 0.97, transition: { duration: 0.15 } },
};

/**
 * Shared confirm dialog for destructive/important admin actions - replaces
 * native window.confirm() so behavior is consistent with the app's own modal
 * styling (see OrdersPage.jsx cancel/return modals for the pattern this mirrors).
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdrop}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[60] p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget && !loading) onCancel?.(); }}
        >
          <motion.div
            variants={panel}
            className="bg-surface rounded-xl max-w-sm w-full p-6 space-y-4 border border-border shadow-2xl"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-red-50 text-danger shrink-0">
                <AlertTriangle className="h-5 w-5" strokeWidth={2} />
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold text-ink">{title}</h3>
                {description && <p className="text-sm text-ink-muted mt-1">{description}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button type="button" variant={variant} onClick={onConfirm} disabled={loading}>
                {loading ? 'Please wait…' : confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
