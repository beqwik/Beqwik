interface AuthInputProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
}

export default function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: AuthInputProps) {
  return (
    <div className="mb-5">

      <label className="block text-sm text-slate-300 mb-2">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="
          w-full
          rounded-xl
          border
          border-slate-700
          bg-slate-950
          px-4
          py-3
          text-white
          placeholder:text-slate-500
          outline-none
          focus:border-violet-500
          transition
        "
      />
    </div>
  );
}