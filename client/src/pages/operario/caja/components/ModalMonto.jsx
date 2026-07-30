import { useState } from 'react';
import { fmt } from '../../../../lib/format';
import { Button } from '../../../../components/ui/Button';

export function ModalMonto({ titulo, descripcion, accion, ocupado, ultimoCierre, onConfirm, onClose }) {
    const [monto, setMonto] = useState('');

    return (
        <div className="pos-modal-overlay" onClick={onClose}>
            <div className="pos-modal" onClick={(e) => e.stopPropagation()}>
                <h3>{titulo}</h3>
                <p className="pos-modal-desc">{descripcion}</p>

                {titulo === 'Abrir caja' && ultimoCierre?.closingAmount !== undefined && (
                    <div className="pos-modal-info">
                        <p className="pos-modal-info-title">📋 Último cierre:</p>
                        <p className="pos-modal-info-amount">{fmt(ultimoCierre.closingAmount)}</p>
                        {ultimoCierre.closedAt && (
                            <p className="pos-modal-info-date">
                                {new Date(ultimoCierre.closedAt).toLocaleString('es-AR')}
                            </p>
                        )}
                    </div>
                )}

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    autoFocus
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0.00"
                />
                <Button
                    variant="success"
                    disabled={ocupado || monto === ''}
                    onClick={() => onConfirm(Number(monto))}
                >
                    {ocupado ? 'Procesando…' : accion}
                </Button>
                <Button variant="link" onClick={onClose}>Cancelar</Button>
            </div>
        </div>
    );
}
