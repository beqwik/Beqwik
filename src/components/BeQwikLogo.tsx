import logo from "../assets/images/Beqwik-Logo-removebg-preview.png";

interface BeQwikLogoProps {
  className?: string;
  showText?: boolean;
  size?: number;
  textColorClass?: string;
}

export const BeQwikLogo = ({
  className = "",
  size,
}: BeQwikLogoProps) => {
  return (
    <img
      src={logo}
      alt="BeQwik"
      className={`w-auto object-contain ${size ? "" : "h-10 md:h-[46px] lg:h-[52px]"} ${className}`}
      style={size ? { height: size, width: "auto" } : undefined}
    />
  );
};

export default BeQwikLogo;
