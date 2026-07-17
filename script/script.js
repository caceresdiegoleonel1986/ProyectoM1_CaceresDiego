/* === Variables principales === */
const paletteContainer = document.getElementById('palette'); // Contenedor de la paleta actual
const toast = document.getElementById('toast');              // Mensaje de copiado
const savedContainer = document.getElementById('saved-palettes'); // Contenedor de paletas guardadas

/* === Función: convierte cualquier color a HEX === */
function rgbToHex(color) {
  if (color.startsWith("#")) return color; // Si ya es HEX, lo devuelve
  const nums = color.match(/\d+/g);        // Extrae números de RGB/RGBA
  if (!nums) return "#ffffff";
  const [r, g, b] = nums.map(Number);
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

/* === Función: genera un color aleatorio en distintos formatos === */
function randomColor(format) {
  if (format === 'rgba') {
    return `rgba(${rand(255)},${rand(255)},${rand(255)},1)`;
  } else if (format === 'hsl') {
    return `hsl(${rand(360)},${rand(100)}%,${rand(100)}%)`;
  } else {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  }
}
function rand(max) { return Math.floor(Math.random() * max); }

/* === Función: genera la paleta respetando los bloqueos === */
function generatePalette() {
  const size = parseInt(document.getElementById('palette-size').value);
  const format = document.getElementById('format').value;
  const colors = [...document.querySelectorAll('.color-code')].map(c => c.textContent);
  updateBackgroundWithPalette(colors); // ✅ actualiza el fondo con la paleta generada

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

  paletteContainer.innerHTML = "";

  // Renderiza primero los bloqueados
  lockedColors.forEach((color, i) => {
    createColorBox(color, true, i);
  });

  // Completa con nuevos colores
  for (let i = lockedColors.length; i < size; i++) {
    const color = randomColor(format);
    createColorBox(color, false, i);
  }
}

/* === Función: crea una caja de color con controles === */
function createColorBox(color, locked, index) {
  const wrapper = document.createElement("div");
  wrapper.className = "color-wrapper";

  const box = document.createElement("div");
  box.className = "color-box";
  box.style.background = color;
  box.dataset.baseColor = color;

  // Texto con el código del color
  const code = document.createElement("div");
  code.className = "color-code";
  code.textContent = `${color} | ${rgbToHex(color)}`;
  box.appendChild(code);

  // Botón de candado
  const lockBtn = document.createElement("button");
  lockBtn.className = "lock-btn";
  lockBtn.textContent = locked ? "🔒" : "🔓";
  lockBtn.onclick = () => {
    lockBtn.textContent = lockBtn.textContent === "🔓" ? "🔒" : "🔓";
  };
  box.appendChild(lockBtn);

  // Botón de rueda cromática (abre selector flotante debajo del botón)
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
  };

  wheel.onclick = () => {
    colorInput.click(); // ✅ abre el selector flotante
  };

  box.appendChild(wheel);
  box.appendChild(colorInput);

  // Slider de transparencia
  const range = document.createElement("input");
  range.type = "range";
  range.min = 0;
  range.max = 100;
  range.value = 100;
  range.oninput = () => {
  const alpha = range.value / 100;
  const baseColor = box.dataset.baseColor;

  if (baseColor.startsWith("#")) {
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);
    const rgba = `rgba(${r},${g},${b},${alpha})`;
    box.style.background = rgba;
    code.textContent = `${rgba} | ${rgbToHex(baseColor)}`;
  } else if (baseColor.startsWith("hsl")) {
    const hsla = baseColor.replace("hsl", "hsla").replace(")", `, ${alpha})`);
    box.style.background = hsla;
    code.textContent = `${hsla} | ${rgbToHex(box.style.background)}`;
  } else if (baseColor.startsWith("rgba")) {
    const rgba = baseColor.replace(/, *[0-9.]+\)$/, `, ${alpha})`);
    box.style.background = rgba;
    code.textContent = `${rgba} | ${rgbToHex(rgba)}`;
  }
};
  box.appendChild(range);

  // Copiar HEX al hacer clic
  box.onclick = () => {
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
  const name = prompt('Nombre de la paleta:');
  if (name) {
    const date = new Date().toLocaleString();
    const palette = { name, date, colors };
    let saved = JSON.parse(localStorage.getItem('palettes') || '[]');
    saved.push(palette);
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

    // Miniaturas de colores guardados como lista
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

    // Botón para cargar paleta
    const loadBtn = document.createElement('button');
    loadBtn.textContent = 'Cargar esta paleta';
    loadBtn.onclick = () => {
      paletteContainer.innerHTML = '';
      p.colors.forEach(c => {
        const box = document.createElement('div');
        box.className = 'color-box';
        box.style.background = c.split("|")[0].trim();
        const code = document.createElement('div');
        code.className = 'color-code';
        code.textContent = c;
        box.appendChild(code);
        paletteContainer.appendChild(box);
      });
      updateBackgroundWithPalette(p.colors);
    };
    item.appendChild(loadBtn);

    // Botón para eliminar paleta
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
renderSaved();