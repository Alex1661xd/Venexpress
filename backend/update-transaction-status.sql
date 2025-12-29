-- Script para actualizar estados de transacciones antes de cambiar el enum
-- Ejecutar este script ANTES de iniciar el backend con el nuevo enum

BEGIN;

-- Actualizar transacciones con estado 'procesando' a 'pendiente_venezuela'
UPDATE transactions 
SET status = 'pendiente_venezuela' 
WHERE status = 'procesando';

-- Actualizar transacciones con estado 'enviado_venezuela' a 'pendiente_colombia'
UPDATE transactions 
SET status = 'pendiente_colombia' 
WHERE status = 'enviado_venezuela';

-- Actualizar historial con estado 'procesando' a 'pendiente_venezuela'
UPDATE transaction_history 
SET status = 'pendiente_venezuela' 
WHERE status = 'procesando';

-- Actualizar historial con estado 'enviado_venezuela' a 'pendiente_colombia'
UPDATE transaction_history 
SET status = 'pendiente_colombia' 
WHERE status = 'enviado_venezuela';

COMMIT;

-- Verificar que no queden estados antiguos
SELECT status, COUNT(*) 
FROM transactions 
GROUP BY status;

SELECT status, COUNT(*) 
FROM transaction_history 
GROUP BY status;
