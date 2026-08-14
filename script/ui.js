import { getSavedPalettes, deletePaletteAt, clearAllPalettes } from './storage.js';
import { rgbToHex } from './utils.js';

export function showToast(message) {
  const toastMsg = document.getElementById('toast');
  toastMsg.textContent = message;
  toastMsg.classList.add('show', 'toast-copy');
  setTimeout(() => toastMsg.classList.remove('show', 'toast-copy'), 3000);
}

export function showConfirmToast(message, onConfirm) {
  const toast = document.getElementById('toast-confirm');
  toast.innerHTML = `
    <p>${message}</p>
    <button id="confirm-yes">Sí</button>
    <button id="confirm-no">No</button>
  `;
  toast.classList.add('show');

  document.getElementById('confirm-yes').onclick = () => {
    toast.classList.remove('show');
    onConfirm();
  };
  document.getElementById('confirm-no').onclick = () => {
    toast.classList.remove('show');
  };
}

export function renderSaved() {
  const savedContainer = document.getElementById('palettes-list');
  const saved = getSavedPalettes();

  savedContainer.innerHTML = '';

  saved.forEach((p, index) => {
    const item = document.createElement('div');
    item.className = 'saved-item';
    item.innerHTML = `<h4>${p.name} - ${p.date}</h4>`;

    const colorsList = document.createElement('ul');
    colorsList.className = 'palette';
    p.colors.forEach(c => {
      const li = document.createElement('li');
      li.className = 'saved-color';
      li.style.background = c.split('|')[0].trim();
      li.title = c;
      colorsList.appendChild(li);
    });
    item.appendChild(colorsList);

    // Botón para cargar paleta guardada (dispara evento)
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Cargar esta paleta';
    loadBtn.onclick = () => {
      const ev = new CustomEvent('palette:load', { detail: { colors: p.colors } });
      window.dispatchEvent(ev);
    };
    item.appendChild(loadBtn);

    // Botón para eliminar paleta guardada con confirmación
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.style.background = '#ff4d4d';
    deleteBtn.onclick = () => {
      const doDelete = () => {
        deletePaletteAt(index);
        renderSaved();
        showToast('Paleta eliminada ✔');
      };
      showConfirmToast('¿Seguro que quieres eliminar esta paleta?', doDelete);
    };
    item.appendChild(deleteBtn);

    savedContainer.appendChild(item);
  });
}

export function clearAllSavedWithConfirm() {
  const doClear = () => {
    clearAllPalettes();
    renderSaved();
    showToast('Todas las paletas fueron eliminadas ✔');
  };
  showConfirmToast('¿Seguro que quieres eliminar todas las paletas?', doClear);
}
