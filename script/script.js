/* === Variables principales === */
const paletteContainer = document.getElementById('palette'); // contenedor de la paleta actual
const toast = document.getElementById('toast');              // mensaje flotante de copiado
const savedContainer = document.getElementById('saved-palettes'); // sección de paletas guardadas
let palette = []; // estado global de la paleta actual

/* === Conversión de formatos === */
// Convierte cualquier color a HEX
function rgbToHex(color) {
  if (color.startsWith("#")) return color;
  const nums = color.match(/\d+/g);
  if (!nums) return "#ffffff";
  const [r, g, b] = nums.map(Number);
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

// Convierte RGB a HSL
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

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
  lockBtn.onclick = () => {
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
  colorInput.value = color.startsWith("#") ? color : rgbToHex(color);

  colorInput.oninput = (e) => {
    box.style.background = e.target.value;
    code.textContent = `${e.target.value} | ${rgbToHex(e.target.value)}`;
    box.dataset.baseColor = e.target.value;
    palette[index].color = e.target.value;
  };

  wheel.onclick = () => colorInput.click();

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

  range.oninput = () => {
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

  // Guardamos el color original en una propiedad fija
  box.dataset.originalColor = color; 
  box.dataset.baseColor = color; // este se puede ir modificando

  const code = document.createElement("div");
  code.className = "color-code";
  code.textContent = `${color} | ${rgbToHex(color)}`;
  box.appendChild(code);

  box.appendChild(createLockButton(index, locked));
  box.appendChild(createWheelButton(index, box, code, color));
  box.appendChild(createTransparencySlider(index, box, code));

  code.onclick = () => {
    navigator.clipboard.writeText(rgbToHex(box.dataset.originalColor));
    showToast();
  };

  wrapper.appendChild(box);
  paletteContainer.appendChild(wrapper);
}

/* === Función: muestra el mensaje de copiado === */
function showToast() {
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

/* === Renderiza paletas guardadas desde localStorage === */
function renderSaved() {
  const savedContainer = document.getElementById('palettes-list');
  const saved = JSON.parse(localStorage.getItem('palettes') || '[]');

  savedContainer.innerHTML = ''; // limpia solo la lista

  if (saved.length === 0) {
    savedContainer.innerHTML = '<p>No hay paletas guardadas aún.</p>';
    return;
  }

  saved.forEach((p, index) => {
    const item = document.createElement('div');
    item.className = 'saved-item';
    item.innerHTML = `<h4>${p.name} - ${p.date}</h4>`;

    const colorsList = document.createElement('ul');
    colorsList.className = 'palette';
    p.colors.forEach(c => {
      const li = document.createElement('li');
      li.className = 'saved-color';
      li.style.background = c.split("|")[0].trim();
      li.title = c;
      colorsList.appendChild(li);
    });
    item.appendChild(colorsList);

    // Botón para cargar paleta guardada
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Cargar esta paleta';
    loadBtn.onclick = () => {
      paletteContainer.innerHTML = '';
      p.colors.forEach((c, i) => {
        createColorBox(c.split("|")[0].trim(), false, i);
      });
      updateBackgroundWithPalette(p.colors.map(c => c.split("|")[0].trim()));
    };
    item.appendChild(loadBtn);

    // Botón para eliminar paleta guardada
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Eliminar';
    deleteBtn.style.background = '#ff4d4d';
    deleteBtn.onclick = () => {
      saved.splice(index, 1);
      localStorage.setItem('palettes', JSON.stringify(saved));
      renderSaved();
    };
    item.appendChild(deleteBtn);

    savedContainer.appendChild(item);
  });
}

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

document.getElementById("save-btn").onclick = () => {
  const colors = [...document.querySelectorAll('.color-code')].map(c => c.textContent);
  if (colors.length === 0) {
    alert("No hay colores para guardar.");
    return;
  }
  const name = prompt('Nombre de la paleta:'); // opción de guardar con nombre
  if (name) {
    const date = new Date().toLocaleString();
    const paletteObj = { name, date, colors };
    const saved = JSON.parse(localStorage.getItem('palettes') || '[]');
    saved.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(saved));
    renderSaved();
  }
};

document.getElementById("clear-saved-btn").onclick = () => {
  localStorage.removeItem('palettes');
  renderSaved();
};

/* === Inicializa mostrando paletas guardadas === */
renderSaved();