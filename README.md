![Logo](assets/img/logo.png)

## Generador de Paletas de Colores

Aplicación web para crear, personalizar y guardar paletas de colores en dos formatos (RGBA, HSL).
 El usuario puede generar colores aleateorios, bloquear colores, ajustar transparencia, elegir colores manualmente y guardar paletas con nombre en `localStorage`.

---

![Demo del proyecto](assets/img/Generador-de-paletas.gif)

---

## 🚀 Características
- Generación automática de paletas en  **RGBA** o **HSL**.
- Bloqueo de colores para mantenerlos fijos al regenerar, presionando el ícono de candado (🔓/🔒)
- Selector cromático 🎨 para elegir colores manualmente.
- Slider de transparencia (solo disponible en RGBA).
- Copiado rápido del código HEX al portapapeles.
- Guardado de paletas con nombre y fecha en `localStorage`.
- Carga y eliminación de paletas guardadas.
- Fondo dinámico que se actualiza con la paleta actual.

---

## 📂 Instalación
1. Clonar o descargar el repositorio.
2. Abrir `index.html` en el navegador.
3. o entra en el siguiente enlace: https://caceresdiegoleonel1986.github.io/ProyectoM1_CaceresDiego/

---

## 🖥️ Uso
1. Seleccionar el tamaño de la paleta (6, 8 o 9 colores) y el formato (hsl o rgba).
2. Presionar **Generar paleta**.
3. Bloquear colores o modificarlos con el selector cromático.
4. Ajustar transparencia (RGBA).
5. Hacer clic en el código para copiar el HEX.
6. Guardar la paleta con nombre.
7. Cargar o eliminar paletas desde la sección de paletas guardadas.

---

## Estructura

```
📁 P1
│
├── 📄 index.html → Página principal del proyecto.
├── 📄 README.md → Documentación general y guía de uso.
│
├── 📁 assets → Recursos multimedia del proyecto.
│   └── 📁 img → Imágenes utilizadas en la interfaz.
│       ├── 🖼️ logo.png → Logo principal de Colorfly Studio.
│       └── 🎞️ Generador-de-paletas.gif → Demostración animada del generador.
│
├── 📁 documentos → Archivos de referencia y documentación adicional.
│   └── 📁 doc AI → Material generado con ayuda de IA.
│       └── 📂 Capturas de pantallas Copilot → Imágenes del proceso de desarrollo.
│
├── 📁 script → Código JavaScript del proyecto.
│   └── ⚙️ script.js → Lógica principal: generación, guardado y manejo de paletas.
│
└── 📁 style → Estilos visuales del proyecto.
    └── 🎨 style.css → Diseño y formato de la interfaz.
```

---

## 🛠️ Herramientas
- HTML5
- CSS
- JavaScript
- Git
- GitHub

## Uso de IA en el proyecto
Durante la creación de este proyecto utilicé **IA como asistente de programación y diseño**.  
La IA me ayudó en diferentes etapas:
- **Generación de código**: obtuve ejemplos de funciones en JavaScript para manejar paletas de colores en formatos **HSL** y **RGBA**.
- **Corrección y optimización**: revisé estructuras de HTML, CSS y JS para mejorar la organización y evitar errores.
- **Documentación**: la IA colaboró en la redacción de este README y en la explicación de las funciones principales.
- **Aprendizaje**: me permitió entender paso a paso cómo funcionan las conversiones de color, el manejo de transparencia y la interacción con `localStorage`.
- **Creatividad visual**: sugerencias de animaciones en CSS y efectos para el logo y el fondo dinámico.

👉 En resumen, la IA fue una herramienta de apoyo que aceleró el desarrollo y me permitió enfocarme en la lógica y el diseño del proyecto, mientras aprendía técnicas programación.

Aquí puede ver las capturas del uso de AI en el proyecto.

[Ver todas las capturas](documentos/docAI)