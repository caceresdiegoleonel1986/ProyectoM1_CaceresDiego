/* === Módulos importados === */
import { rgbToHex, rgbToHsl } from './utils.js';
import { initIroIfNeeded, openIroPicker as pickerOpen, closeIroModal, iroPicker } from './picker.js';
import { renderSaved, showToast, showConfirmToast, clearAllSavedWithConfirm } from './ui.js';
import { getSavedPalettes, savePaletteObject } from './storage.js';

/* === Variables principales === */
const paletteContainer = document.getElementById('palette'); // contenedor de la paleta actual
const toast = document.getElementById('toast');              // mensaje flotante de copiado
const savedContainer = document.getElementById('saved-palettes'); // sección de paletas guardadas
let palette = []; // estado global de la paleta actual
let currentBoxIndex = null;

// Genera un color aleatorio en HEX, RGBA o HSL
function getRandomColor(format) {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  if (format === "rgba") {
    const a = (Math.random()).toFixed(2);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  } else if (format === "hsl") {
    const h = Math.floor(Math.random() * 360);
    const s = Math.floor(Math.random() * 100);
    const l = Math.floor(Math.random() * 100);
    return `hsl(${h}, ${s}%, ${l}%)`;
  } else {
    return rgbToHex(`rgb(${r},${g},${b})`);
  }
}

/* === Generación y actualización de paleta === */
// Genera una nueva paleta respetando los bloqueos
function generatePalette() {
  const size = parseInt(document.getElementById('palette-size').value);
  const format = document.getElementById('format').value;

  // Detecta colores bloqueados
  const wrappers = paletteContainer.querySelectorAll(".color-wrapper");
  const lockedMap = {};
  wrappers.forEach((wrapper, i) => {
    const box = wrapper.querySelector(".color-box");
    const lockBtn = box.querySelector(".lock-btn");
    if (lockBtn && lockBtn.textContent === "🔒") {
      lockedMap[i] = box.dataset.baseColor;
    }
  });

  // Genera nueva paleta
  palette = [];
  for (let i = 0; i < size; i++) {
    if (lockedMap[i]) {
      palette.push({ color: lockedMap[i], locked: true });
    } else {
      const newColor = getRandomColor(format);
      palette.push({ color: newColor, locked: false });
    }
  }

  // Renderiza en pantalla
  paletteContainer.innerHTML = "";
  palette.forEach((item, i) => {
    createColorBox(item.color, item.locked, i);
  });

  // Actualiza fondo del body
  updateBackgroundWithPalette(palette.map(item => item.color));
}

// Actualiza el formato de las cajas al cambiar el selector
function updatePaletteFormat() {
  const format = document.getElementById('format').value;
  const boxes = document.querySelectorAll('.color-box');

  boxes.forEach((box, i) => {
    let baseColor = box.dataset.baseColor;
    if (!baseColor.startsWith("#")) baseColor = rgbToHex(baseColor);

    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    let newColor;
    if (format === 'hsl') {
      const hsl = rgbToHsl(r, g, b);
      newColor = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    } else if (format === 'rgba') {
      newColor = `rgba(${r}, ${g}, ${b}, 1)`;
    } else {
      newColor = rgbToHex(baseColor);
    }

    const code = box.querySelector('.color-code');
    code.textContent = `${newColor} | ${rgbToHex(baseColor)}`;
    palette[i].color = newColor;
  });
}

/* === Componentes de cada caja === */
// Botón de bloqueo
function createLockButton(index, locked) {
  const lockBtn = document.createElement("button");
  lockBtn.className = "lock-btn";
  lockBtn.textContent = locked ? "🔒" : "🔓";
  lockBtn.onclick = (event) => {
    event.stopPropagation();
    const lockedNow = lockBtn.textContent === "🔓";
    lockBtn.textContent = lockedNow ? "🔒" : "🔓";
    palette[index].locked = lockedNow;
  };
  return lockBtn;
}

// Botón de rueda cromática
function createWheelButton(index, box, code, color) {
  const wheel = document.createElement("button");
  wheel.className = "wheel-btn";
  wheel.innerHTML = "🎨";

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.className = "color-input-overlay";
  colorInput.setAttribute('aria-label', 'Selector de color nativo');
  colorInput.title = 'Abrir selector de color nativo';
  colorInput.value = color.startsWith("#") ? color : rgbToHex(color);

  colorInput.oninput = (e) => {
    box.style.background = e.target.value;
    code.textContent = `${e.target.value} | ${rgbToHex(e.target.value)}`;
    box.dataset.baseColor = e.target.value;
    palette[index].color = e.target.value;
  };

  wheel.onclick = (event) => {
    event.stopPropagation();
    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const useNativeOnSmall = isTouch && window.innerWidth <= 600;
    if (useNativeOnSmall) {
      // En móviles pequeños preferimos el selector nativo
      colorInput.value = rgbToHex(box.style.background);
      colorInput.click();
      return;
    }
    // En escritorio o pantallas grandes usamos iro.js
    currentBoxIndex = index;
    openIroPicker(rgbToHex(box.style.background));
  };

  colorInput.onclick = (event) => {
    event.stopPropagation();
  };

  const container = document.createElement("div");
  container.appendChild(wheel);
  container.appendChild(colorInput);
  return container;
}

// Slider de transparencia
function createTransparencySlider(index, box, code) {
  const range = document.createElement("input");
  range.type = "range";
  range.min = 0;
  range.max = 100;
  range.value = 100;
  
  range.onclick = (event) => {
    event.stopPropagation();
  };

  range.oninput = (event) => {
    event.stopPropagation();
    const alpha = range.value / 100;
    const originalColor = box.dataset.originalColor; // siempre el original

    const hexBase = originalColor.startsWith("#") ? originalColor : rgbToHex(originalColor);
    const r = parseInt(hexBase.slice(1, 3), 16);
    const g = parseInt(hexBase.slice(3, 5), 16);
    const b = parseInt(hexBase.slice(5, 7), 16);

    // Si alpha = 1, vuelve al color original
    let newColor = alpha === 1 ? originalColor : `rgba(${r},${g},${b},${alpha})`;

    box.style.background = newColor;
    code.textContent = `${newColor} | ${hexBase}`;

    // Guardamos el color actual, pero no tocamos el original
    palette[index].color = newColor;
    box.dataset.baseColor = newColor;
  };

  return range;
}

// Renderizado de cajas
function createColorBox(color, locked, index) {
  const wrapper = document.createElement("div");
  wrapper.className = "color-wrapper";

  const box = document.createElement("div");
  box.className = "color-box";
  box.style.background = color;

  // Guardamos el color original
  box.dataset.originalColor = color;
  box.dataset.baseColor = color;

  const code = document.createElement("div");
  code.className = "color-code";
  code.textContent = `${color} | ${rgbToHex(color)}`;
  box.appendChild(code);

  // Botones
  box.appendChild(createLockButton(index, locked));
  box.appendChild(createWheelButton(index, box, code, color));

  // Solo mostrar slider si el formato no es HSL
  const format = document.getElementById('format').value;
  if (format !== 'hsl') {
    box.appendChild(createTransparencySlider(index, box, code));
  }

   // 🔹 Ahora el click es sobre toda la caja
  const isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  box.onclick = () => {
    const isTouchDeviceLocal = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const smallScreen = window.innerWidth <= 600;
    if (isTouchDeviceLocal && smallScreen) {
      // en móvil pequeño, abrir el selector nativo directamente
      const input = box.querySelector('.color-input-overlay');
      if (input) {
        input.value = rgbToHex(box.style.background);
        input.click();
        return;
      }
    }
    if (isTouchDeviceLocal) {
      // en touch devices grandes abrimos el picker avanzado
      currentBoxIndex = index;
      openIroPicker(rgbToHex(box.style.background));
      return;
    }
    const textToCopy = code.textContent;
    navigator.clipboard.writeText(textToCopy);
    showToast("Formato y HEX copiados ✔");
  };

  wrapper.appendChild(box);
  paletteContainer.appendChild(wrapper);
}

/* === Función: muestra el mensaje de copiado === */
// ahora `renderSaved`, `showToast` y `showConfirmToast` vienen de `ui.js`

// Escucha global para cambios desde iro.js
window.addEventListener('iro:color:change', (e) => {
  if (currentBoxIndex === null) return;
  const boxes = document.querySelectorAll('.color-box');
  const box = boxes[currentBoxIndex];
  if (!box) return;
  const hex = e.detail.hex;
  const code = box.querySelector('.color-code');
  box.style.background = hex;
  code.textContent = `${hex} | ${rgbToHex(hex)}`;
  box.dataset.baseColor = hex;
  palette[currentBoxIndex].color = hex;
});

document.getElementById("clear-saved-btn").onclick = () => {
  const saved = JSON.parse(localStorage.getItem('palettes') || '[]');

  if (saved.length === 0) {
    // 🔹 Si no hay paletas, mostramos un toast automático
    showToast("No existen paletas guardadas ❌");
    return;
  }

  // 🔹 Si sí hay paletas, mostramos el toast de confirmación
  showConfirmToast("¿Seguro que quieres eliminar todas las paletas?", () => {
    localStorage.removeItem('palettes');
    renderSaved();
    showToast("Todas las paletas fueron eliminadas ✔");
  });
};

/* === Actualiza el fondo del body con la paleta cargada === */
function updateBackgroundWithPalette(colors) {
  const hexColors = colors.map(c => c.split("|")[0].trim());
  const gradient = `linear-gradient(270deg, ${hexColors.join(", ")})`;
  document.body.style.background = gradient;
  document.body.style.backgroundSize = "600% 600%";
  document.body.style.animation = "gradientMove 20s ease infinite";
}

/* === Botones principales === */
document.getElementById("generate-btn").onclick = generatePalette;
document.getElementById("format").onchange = updatePaletteFormat;

// Lógica para abrir el formulario integrado de guardado
const saveForm = document.getElementById('save-form');
const saveNameInput = document.getElementById('save-name');
const saveConfirmBtn = document.getElementById('save-confirm');
const saveCancelBtn = document.getElementById('save-cancel');
let previousActiveElement = null;
// --- Helpers para trap focus en modales ---
function getFocusableElements(container) {
  return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'));
}

function trapFocus(container) {
  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  container._focusHandler = function(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };
  document.addEventListener('keydown', container._focusHandler);
}

function releaseFocus(container) {
  if (container && container._focusHandler) {
    document.removeEventListener('keydown', container._focusHandler);
    delete container._focusHandler;
  }
}

document.getElementById("save-btn").onclick = () => {
  const colors = [...document.querySelectorAll('.color-code')].map(c => c.textContent);
  if (colors.length === 0) {
    alert("No hay colores para guardar.");
    return;
  }
  // Guardamos temporalmente los colores en el dataset del formulario
  saveForm.dataset.colors = JSON.stringify(colors);
  saveNameInput.value = "";
  previousActiveElement = document.activeElement;
  saveForm.classList.add('show');
  saveForm.setAttribute('aria-hidden', 'false');
  setTimeout(() => {
    saveNameInput.focus();
    trapFocus(saveForm);
  }, 50);
};

saveConfirmBtn.onclick = () => {
  const name = saveNameInput.value.trim();
  if (!name) {
    alert('Ingrese un nombre para la paleta.');
    saveNameInput.focus();
    return;
  }
  const colors = JSON.parse(saveForm.dataset.colors || '[]');
  const saved = getSavedPalettes();
  const existsIndex = saved.findIndex(s => s.name && s.name.toLowerCase() === name.toLowerCase());

  const doSave = () => {
    const date = new Date().toLocaleString();
    const paletteObj = { name, date, colors };
    savePaletteObject(paletteObj);
    renderSaved();
    saveForm.classList.remove('show');
    saveForm.setAttribute('aria-hidden', 'true');
    releaseFocus(saveForm);
    showToast("Paleta guardada ✔");
    if (previousActiveElement) previousActiveElement.focus();
  };

  if (existsIndex >= 0) {
    showConfirmToast("Ya existe una paleta con ese nombre. ¿Sobrescribir?", doSave);
  } else {
    doSave();
  }
};

saveCancelBtn.onclick = () => {
  saveForm.classList.remove('show');
  saveForm.setAttribute('aria-hidden', 'true');
  releaseFocus(saveForm);
  if (previousActiveElement) previousActiveElement.focus();
};

// Soporte para Enter y Escape en el input
saveNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveConfirmBtn.click();
  if (e.key === 'Escape') saveCancelBtn.click();
});

// Cerrar modales con Escape cuando estén abiertos
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (saveForm.classList.contains('show')) saveCancelBtn.click();
    if (iroModal && iroModal.classList.contains('show')) document.getElementById('iro-close').click();
  }
});

// Integrar trap focus con iro modal (usa picker.js para inicializar el picker)
let iroModal = document.getElementById('iro-modal');

function openIroPicker(hex) {
  // `currentBoxIndex` debe estar seteado por el llamador
  pickerOpen(hex);
  iroModal = document.getElementById('iro-modal');
  iroModal.classList.add('show');
  iroModal.setAttribute('aria-hidden', 'false');
  // focus al botón cerrar
  setTimeout(() => {
    const closeBtn = document.getElementById('iro-close');
    if (closeBtn) closeBtn.focus();
    trapFocus(iroModal);
  }, 50);
}

// Cerrar modal
document.getElementById('iro-close').onclick = () => {
  closeIroModal();
  releaseFocus(iroModal);
  currentBoxIndex = null;
};

// Cerrar al hacer click fuera del contenido
document.getElementById('iro-modal').addEventListener('click', (e) => {
  if (e.target.id === 'iro-modal') {
    document.getElementById('iro-close').click();
  }
});

/* === Inicializa mostrando paletas guardadas === */
renderSaved();

/* === Genera la paleta inicial cuando carga la página === */
generatePalette();