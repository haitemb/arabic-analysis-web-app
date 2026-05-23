import React, { useCallback, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './ui/button';
import { modalDebug, modalDebugDomState } from '../utils/modalDebug';

export interface AppModalProps {
  /** Stable id for debug logs (e.g. "profile-delete") */
  modalId: string;
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  /** Custom footer; if omitted and onConfirm is set, default Cancel/Confirm buttons are shown */
  footer?: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
  destructive?: boolean;
  /** Block overlay click / Escape while true */
  disableDismiss?: boolean;
}

export function AppModal({
  modalId,
  open,
  onClose,
  title,
  description,
  children,
  footer,
  onConfirm,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  confirmLoading = false,
  destructive = false,
  disableDismiss = false,
}: AppModalProps) {
  const reactId = useId();
  const portalHostId = `app-modal-root-${modalId}`;
  const panelRef = useRef<HTMLDivElement>(null);
  const prevOpen = useRef(open);

  const handleClose = useCallback(
    (reason: string) => {
      if (disableDismiss || confirmLoading) {
        modalDebug(modalId, 'close-blocked', { reason, disableDismiss, confirmLoading });
        return;
      }
      modalDebug(modalId, 'close', { reason });
      onClose();
    },
    [modalId, onClose, disableDismiss, confirmLoading],
  );

  useEffect(() => {
    if (open === prevOpen.current) return;
    prevOpen.current = open;
    modalDebug(modalId, open ? 'open' : 'closed', { reactId });
    if (open) {
      requestAnimationFrame(() => modalDebugDomState(modalId, 'after-open-raf'));
    }
  }, [open, modalId, reactId]);

  useEffect(() => {
    if (!open) return;

    modalDebug(modalId, 'mount-effects', { reactId });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    modalDebug(modalId, 'body-scroll-locked', { previousOverflow });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        modalDebug(modalId, 'escape-pressed');
        handleClose('escape');
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
      modalDebug(modalId, 'unmount-effects', { restoredOverflow: previousOverflow });
    };
  }, [open, modalId, reactId, handleClose]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const t = window.setTimeout(() => modalDebugDomState(modalId, 'panel-mounted'), 50);
    return () => window.clearTimeout(t);
  }, [open, modalId]);

  if (!open) {
    return null;
  }

  modalDebug(modalId, 'render-portal', { reactId });

  const defaultFooter =
    onConfirm &&
    !footer && (
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end mt-4">
        <Button
          type="button"
          variant="outline"
          disabled={confirmLoading}
          onClick={() => handleClose('cancel-button')}
        >
          {cancelText}
        </Button>
        <Button
          type="button"
          disabled={confirmLoading}
          className={
            destructive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }
          onClick={() => {
            modalDebug(modalId, 'confirm-click');
            void onConfirm();
          }}
        >
          {confirmLoading ? 'جاري المعالجة...' : confirmText}
        </Button>
      </div>
    );

  const content = (
    <div id={portalHostId} data-app-modal-host={modalId}>
      <div
        data-app-modal-overlay
        role="presentation"
        onClick={() => {
          modalDebug(modalId, 'overlay-click');
          handleClose('overlay');
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100000,
          backgroundColor: 'rgba(0, 0, 0, 0.55)',
        }}
      />
      <div
        ref={panelRef}
        data-app-modal-panel
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${portalHostId}-title`}
        aria-describedby={description ? `${portalHostId}-desc` : undefined}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 100001,
          width: 'min(100% - 2rem, 28rem)',
          maxHeight: 'min(90vh, 600px)',
          overflowY: 'auto',
          backgroundColor: '#ffffff',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '1.5rem',
        }}
      >
        <h2
          id={`${portalHostId}-title`}
          className="text-lg font-semibold text-blue-900 text-right mb-2"
        >
          {title}
        </h2>
        {description ? (
          <p
            id={`${portalHostId}-desc`}
            className="text-sm text-gray-600 text-right mb-4"
          >
            {description}
          </p>
        ) : null}
        {children}
        {footer ?? defaultFooter}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
