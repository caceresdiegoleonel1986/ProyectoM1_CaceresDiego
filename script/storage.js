// Manejo de almacenamiento de paletas en localStorage
export function getSavedPalettes() {
  return JSON.parse(localStorage.getItem('palettes') || '[]');
}

export function setSavedPalettes(arr) {
  localStorage.setItem('palettes', JSON.stringify(arr));
}

export function savePaletteObject(paletteObj) {
  const saved = getSavedPalettes();
  const idx = saved.findIndex(s => s.name && s.name.toLowerCase() === paletteObj.name.toLowerCase());
  if (idx >= 0) saved[idx] = paletteObj; else saved.push(paletteObj);
  setSavedPalettes(saved);
}

export function deletePaletteAt(index) {
  const saved = getSavedPalettes();
  saved.splice(index, 1);
  setSavedPalettes(saved);
}

export function clearAllPalettes() {
  localStorage.removeItem('palettes');
}
