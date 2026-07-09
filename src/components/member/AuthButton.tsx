interface AuthButtonProps {
  children: React.ReactNode;
  loading?: boolean;
  type?: "button" | "submit";
}

export default function AuthButton({
  children,
  loading = false,
  type = "submit",
}: AuthButtonProps) {
  return (
    <button
      type={type}
      disabled={loading}
      className="
        w-full
        py-3
        rounded-xl
        bg-violet-600
        hover:bg-violet-700
        transition
        text-white
        font-semibold
        disabled:opacity-60
        disabled:cursor-not-allowed
      "
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}