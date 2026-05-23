/** Debug helper for custom modals — logs to browser DevTools console (F12). */

const PREFIX = '[AppModal]';

if (import.meta.env.DEV) {
  console.info(
    `${PREFIX} Debug logging enabled. Filter console by "AppModal" when testing Profile/History popups.`,
  );
}

export type ModalDebugPayload = Record<string, unknown>;

export function modalDebug(
  modalId: string,
  event: string,
  payload?: ModalDebugPayload,
): void {
  const timestamp = new Date().toISOString();
  const message = `${PREFIX} [${modalId}] ${event}`;
  if (payload !== undefined) {
    console.log(message, { timestamp, ...payload });
  } else {
    console.log(message, { timestamp });
  }
}

/** Snapshot DOM / body state when investigating freeze (overlay without visible panel). */
export function modalDebugDomState(modalId: string, phase: string): void {
  const body = document.body;
  const html = document.documentElement;
  const portal = document.getElementById(`app-modal-root-${modalId}`);

  modalDebug(modalId, `dom-state:${phase}`, {
    bodyOverflow: body.style.overflow || '(css)',
    bodyPointerEvents: body.style.pointerEvents || '(css)',
    htmlOverflow: html.style.overflow || '(css)',
    portalFound: !!portal,
    portalChildCount: portal?.childElementCount ?? 0,
    activeElement: document.activeElement?.tagName ?? null,
    openModalCount: document.querySelectorAll('[data-app-modal-overlay]').length,
  });

  if (portal) {
    const panel = portal.querySelector('[data-app-modal-panel]');
    if (panel) {
      const rect = panel.getBoundingClientRect();
      const styles = window.getComputedStyle(panel);
      modalDebug(modalId, `panel-metrics:${phase}`, {
        rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        opacity: styles.opacity,
        visibility: styles.visibility,
        display: styles.display,
        zIndex: styles.zIndex,
        transform: styles.transform,
      });
    } else {
      modalDebug(modalId, `panel-metrics:${phase}`, { error: 'panel element not found in portal' });
    }
  }
}
