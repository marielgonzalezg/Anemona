type WidgetsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function WidgetsModal({
  isOpen,
  onClose,
}: WidgetsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute bottom-16 right-0 z-50 w-64 rounded-2xl bg-white p-4 shadow-xl border border-gray-100">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-[#EB0029]">Widgets</h2>

        <button
          onClick={onClose}
          className="rounded-md px-2 py-1 text-gray-500 hover:bg-gray-100 hover:text-black transition"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <button className="w-full rounded-xl bg-gray-100 p-3 text-left hover:bg-gray-200 transition">
          Widget 1
        </button>

        <button className="w-full rounded-xl bg-gray-100 p-3 text-left hover:bg-gray-200 transition">
          Widget 2
        </button>

        <button className="w-full rounded-xl bg-gray-100 p-3 text-left hover:bg-gray-200 transition">
          Widget 3
        </button>
      </div>
    </div>
  );
}