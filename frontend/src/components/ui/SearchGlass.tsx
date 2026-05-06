export default function SearchGlass({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
}) {
  return (
    <div className="relative w-full max-w-xl mx-auto">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="
          w-full
          px-6 py-4
          rounded-full
          bg-white/20
          backdrop-blur-xl
          border border-white/30
          text-white
          placeholder-white/70
          focus:outline-none
          focus:ring-2 focus:ring-violet-500
          transition
        "
      />

      <button
        onClick={onSubmit}
        className="
          absolute right-2 top-1/2 -translate-y-1/2
          w-10 h-10
          rounded-full
          bg-violet-600
          flex items-center justify-center
          text-white
          hover:bg-violet-700
        "
      >
        🔍
      </button>
    </div>
  );
}