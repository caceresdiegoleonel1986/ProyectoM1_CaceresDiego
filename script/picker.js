import { rgbToHex } from './utils.js';

export let iroPicker = null;
export let iroModal = null;

export function initIroIfNeeded(initialHex) {
  if (iroPicker || !window.iro) return;
  iroPicker = new iro.ColorPicker('#iro-picker', { width: 220, color: initialHex || '#ffffff' });
  // Emitimos un evento global cuando cambia el color
  iroPicker.on('color:change', (color) => {
    const ev = new CustomEvent('iro:color:change', { detail: { hex: color.hexString } });
    window.dispatchEvent(ev);
  });
}

export function openIroPicker(hex) {
  initIroIfNeeded(hex);
  if (iroPicker) iroPicker.color.set(hex);
  if (!iroModal) iroModal = document.getElementById('iro-modal');
  iroModal.classList.add('show');
  iroModal.setAttribute('aria-hidden', 'false');
}

export function closeIroModal() {
  if (!iroModal) iroModal = document.getElementById('iro-modal');
  if (iroModal) {
    iroModal.classList.remove('show');
    iroModal.setAttribute('aria-hidden', 'true');
  }
}
