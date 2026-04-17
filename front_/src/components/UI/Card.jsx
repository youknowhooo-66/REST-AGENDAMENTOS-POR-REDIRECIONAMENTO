import { cn } from "../../lib/utils";

const Card = ({ children, className, noPadding = false, ...props }) => {
  return (
    <div
      className={cn(
        // Base structure
        "rounded-xl border transition-all duration-300",
        
        // Efeito Glassmorphism Premium aplicado via index.css
        // .glass-card lida com o bg e border para light/dark automaticamente
        "glass-card",
        
        !noPadding && "p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;