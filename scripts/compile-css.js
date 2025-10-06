// Compila todo el SCSS de la app a un único CSS minificado para PRE/PROD
// Entrada: app/styles/main.scss → Salida: public/css/layout.css
// Se ejecuta vía npm scripts (css:build) antes de build:pre y build:prod
import * as sass from 'sass'
import fs from 'fs'
import path from 'path'

// Rutas de entrada/salida
const input = path.join(process.cwd(), 'app', 'styles', 'main.scss')
const outDir = path.join(process.cwd(), 'public', 'css')
const outFile = path.join(outDir, 'layout.css')

// Asegura que exista la carpeta de destino
fs.mkdirSync(outDir, { recursive: true })

try {
  // Compila y minifica (compressed) el SCSS de entrada
  const result = sass.compile(input, { style: 'compressed' })
  // Escribe el CSS resultante
  fs.writeFileSync(outFile, result.css)
  // Log con tamaño final para control rápido
  const sizeKb = (fs.statSync(outFile).size / 1024).toFixed(2)
  console.log(`✅ CSS compilado -> ${outFile} (${sizeKb} KB)`) 
} catch (e) {
  // Falla el proceso de build si la compilación de SCSS da error
  console.error('❌ Error compilando SCSS:', e)
  process.exit(1)
}


