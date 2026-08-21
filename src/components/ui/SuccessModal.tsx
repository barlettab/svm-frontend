interface SuccessModalProps {
  open: boolean;
  message: string;
  code: string;
  onClose: () => void;
}

export function SuccessModal({
  open,
  message,
  code,
  onClose,
}: SuccessModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700">
          ✓
        </div>
        <p className="text-base font-semibold text-slate-900">{message}</p>
        <p className="mt-2 font-mono text-lg font-semibold text-blue-700">
          {code}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600/40"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
