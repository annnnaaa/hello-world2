import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  variant?: 'destructive' | 'primary';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmLabel = 'Delete',
  variant = 'destructive',
}: ConfirmDialogProps) {
  function handleConfirm() {
    onConfirm();
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="text-sm text-slate-400">{description}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant={variant} onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
