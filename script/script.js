/* === Variables principales === */
const paletteContainer = document.getElementById('palette');
const toast = document.getElementById('toast');
const savedContainer = document.getElementById('saved-palettes');
let palette = []; // estado global

/* === Función: convierte cualquier color a HEX === */
function rgbToHex(color) {
  if (color.startsWith("#")) return color;
  const nums = color.match(/\d+/g);
  if (!nums) return "#ffffff";
  const [r, g, b] = nums.map(Number);
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

/* === Función: genera un color aleatorio en distintos formatos === */
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

/* === Función: genera la paleta respetando los bloqueos === */
function generatePalette() {
  const size = parseInt(document.getElementById('palette-size').value);
  const format = document.getElementById('format').value;

  // Guarda colores bloqueados
  const wrappers = paletteContainer.querySelectorAll(".color-wrapper");
  const lockedColors = [];
  wrappers.forEach(wrapper => {
    const box = wrapper.querySelector(".color-box");
    const lockBtn = box.querySelector(".lock-btn");
    if (lockBtn && lockBtn.textContent === "🔒") {
      lockedColors.push(box.dataset.baseColor);
    }
  });

  // Genera nueva paleta
  palette = [];
  for (let i = 0; i < size; i++) {
    if (lockedColors[i]) {
      palette.push({ color: lockedColors[i], locked: true });
    } else {
      const newColor = getRandomColor(format);
      palette.push({ color: newColor, locked: false });
    }
  }

  // Limpia y renderiza
  paletteContainer.innerHTML = "";
  palette.forEach((item, i) => {
    createColorBox(item.color, item.locked, i);
  });

  // Actualiza fondo
  updateBackgroundWithPalette(palette.map(item => item.color));
}

/* === Auxiliares === */
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

function createWheelButton(index, box, code, color) {
  const wheel = document.createElement("button");
  wheel.className = "wheel-btn";
  wheel.innerHTML = "🎨";

  const colorInput = document.createElement("input");
  colorInput.type = "color";
  colorInput.className = "color-input-overlay";
  colorInput.value = rgbToHex(color);

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

function createTransparencySlider(index, box, code) {
  const range = document.createElement("input");
  range.type = "range";
  range.min = 0;
  range.max = 100;
  range.value = 100;

  range.oninput = () => {
    const alpha = range.value / 100;
    let baseColor = box.dataset.baseColor;

    // Convertir cualquier formato a HEX primero
    if (!baseColor.startsWith("#")) {
      baseColor = rgbToHex(baseColor);
    }

    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    const rgba = `rgba(${r},${g},${b},${alpha})`;

      // Actualiza fondo y texto dinámicamente
      box.style.background = rgba;
      code.textContent = `${rgba} | ${rgbToHex(baseColor)}`;

      // Guarda el color actual con transparencia
      palette[index].color = rgba;
  };
  return range;
}

/* === Función principal: crea la caja de color === */
function createColorBox(color, locked, index) {
  const wrapper = document.createElement("div");
  wrapper.className = "color-wrapper";

  const box = document.createElement("div");
  box.className = "color-box";
  box.style.background = color;
  box.dataset.baseColor = color;

  const code = document.createElement("div");
  code.className = "color-code";
  code.textContent = `${color} | ${rgbToHex(color)}`;
  box.appendChild(code);

  // Añadir componentes modulares
  box.appendChild(createLockButton(index, locked));
  box.appendChild(createWheelButton(index, box, code, color));
  box.appendChild(createTransparencySlider(index, box, code));

  // Copiar HEX al hacer clic en el código
  code.onclick = () => {
    navigator.clipboard.writeText(rgbToHex(box.dataset.baseColor));
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

/* === Botones principales === */
document.getElementById("generate-btn").onclick = generatePalette;

document.getElementById("save-btn").onclick = () => {
  const colors = [...document.querySelectorAll('.color-code')].map(c => c.textContent);
  if (colors.length === 0) {
    alert("No hay colores para guardar.");
    return;
  }
  const name = prompt('Nombre de la paleta:');
  if (name) {
    const date = new Date().toLocaleString();
    const paletteObj = { name, date, colors };
    let saved = JSON.parse(localStorage.getItem('palettes') || '[]');
    saved.push(paletteObj);
    localStorage.setItem('palettes', JSON.stringify(saved));
    renderSaved();
  }
};

document.getElementById("clear-btn").onclick = () => {
  localStorage.removeItem('palettes');
  renderSaved();
};

/* === Función: renderiza las paletas guardadas === */
function renderSaved() {
  savedContainer.innerHTML = '';
  const saved = JSON.parse(localStorage.getItem('palettes') || '[]');
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
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Cargar esta paleta';
    loadBtn.onclick = () => {
      paletteContainer.innerHTML = '';
      p.colors.forEach((c, i) => {
        createColorBox(c.split("|")[0].trim(), false, i);
      });
      updateBackgroundWithPalette(p.colors);
    };
    item.appendChild(loadBtn);
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

  /* === Función: actualiza el fondo del body con la paleta cargada === */
function updateBackgroundWithPalette(colors) {
  const hexColors = colors.map(c => c.split("|")[0].trim());
  const gradient = `linear-gradient(270deg, ${hexColors.join(", ")})`;
  document.body.style.background = gradient;
  document.body.style.backgroundSize = "600% 600%";
  document.body.style.animation = "gradientMove 20s ease infinite";
}

/* === Inicializa mostrando paletas guardadas === */
renderSaved();//