/**
 * Punto de entrada centralizado para todos los módulos de mapaBuscadorFosas
 * Facilita las importaciones y mantiene las rutas organizadas
 */

import { FiltrosManager } from './filtrosManager.js';
import { ToggleManager } from './toggleManager.js';
import { Templates } from './templates.js';
import { DataManager } from './dataManager.js';
import { MobileSheetManager } from './mobileSheetManager.js';

// Re-exportaciones nombradas
export { FiltrosManager, ToggleManager, Templates, DataManager, MobileSheetManager };

// Exportación por defecto que incluye todos los managers
export default {
  FiltrosManager,
  ToggleManager,
  Templates,
  DataManager,
  MobileSheetManager
};
