# 🎨 Generador de Paletas de Colores

Aplicación web para crear, personalizar y guardar paletas de colores en distintos formatos (HEX, RGBA, HSL).  
Permite bloquear colores, ajustar transparencia, elegir colores manualmente y guardar paletas con nombre en `localStorage`.

---

## 🚀 Características
- Generación automática de paletas en **HEX**, **RGBA** o **HSL**.
- Bloqueo de colores para mantenerlos fijos al regenerar.
- Selector cromático 🎨 para elegir colores manualmente.
- Slider de transparencia (solo disponible en HEX y RGBA).
- Copiado rápido del código HEX al portapapeles.
- Guardado de paletas con nombre y fecha en `localStorage`.
- Carga y eliminación de paletas guardadas.
- Fondo dinámico que se actualiza con la paleta actual.

---

## 📂 Instalación
1. Clonar o descargar el repositorio.
2. Colocar los archivos en una carpeta de proyecto:
   - `index.html`
   - `style.css`
   - `script.js`
   - Carpeta `assets/img` para el logo.
3. Abrir `index.html` en el navegador.

---

## 🖥️ Uso
1. Seleccionar el tamaño de la paleta y el formato.
2. Presionar **Generar paleta**.
3. Bloquear colores o modificarlos con el selector cromático.
4. Ajustar transparencia (solo HEX/RGBA).
5. Hacer clic en el código para copiar el HEX.
6. Guardar la paleta con nombre.
7. Cargar o eliminar paletas desde la sección de guardadas.

---

## 🛠️ Funciones principales

### Conversión de formatos
- `rgbToHex(color)` → Convierte RGB a HEX.
- `rgbToHsl(r,g,b)` → Convierte RGB a HSL.
- `getRandomColor(format)` → Genera un color aleatorio en el formato elegido.

### Generación y actualización
- `generatePalette()` → Crea una nueva paleta respetando bloqueos.
- `updatePaletteFormat()` → Cambia el formato de las cajas al selector elegido.

### Componentes de cada caja
- `createLockButton(index, locked)` → Botón para bloquear/desbloquear color.
- `createWheelButton(index, box, code, color)` → Selector cromático 🎨.
- `createTransparencySlider(index, box, code)` → Slider de transparencia (HEX/RGBA).
- `createColorBox(color, locked, index)` → Renderiza cada color en pantalla.

### Interacciones
- `showToast()` → Muestra el mensaje de copiado.
- `renderSaved()` → Lista las paletas guardadas desde `localStorage`.
- `updateBackgroundWithPalette(colors)` → Actualiza el fondo con la paleta actual.

---