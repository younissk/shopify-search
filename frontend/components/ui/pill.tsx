export default function Pill({ 
  text, 
  onClick, 
  fixed = false 
}: { 
  text: string, 
  onClick?: () => void,
  fixed?: boolean 
}) {
  const baseClasses = "rounded-[var(--radius-xs)] border-2 border-[var(--border)] border-dashed bg-[var(--primary)] px-4 py-2 text-xs uppercase tracking-[0.22em] text-[var(--secondary)] cursor-pointer transition-all duration-200 hover:bg-opacity-90";
  
  const fixedClasses = fixed 
    ? "fixed bottom-0 left-0 right-0 w-full z-50 mx-0 rounded-none border-t-2 border-b-0 py-4 text-center" 
    : "";
  
  return (
    <div 
      className={`${baseClasses} ${fixedClasses}`}
      onClick={onClick}
      data-testid={fixed ? "mobile-fixed-button" : "pill-button"}
    >
      {text}
    </div>
  );
}
