interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
  color?: "blue" | "emerald" | "orange" | "purple";
}

export default function ProgressBar({ 
  progress, 
  className = "", 
  showPercentage = false,
  color = "blue" 
}: ProgressBarProps) {
  const getColorClasses = (color: string) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-500";
      case "orange":
        return "bg-orange-500";
      case "purple":
        return "bg-purple-500";
      default:
        return "gradient-electric-violet";
    }
  };

  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className={`sparkwave-progress ${className}`}>
      <div 
        className={`sparkwave-progress-bar ${getColorClasses(color)}`}
        style={{ width: `${clampedProgress}%` }}
      >
        {showPercentage && (
          <span className="text-xs text-white font-semibold px-2 py-1">
            {Math.round(clampedProgress)}%
          </span>
        )}
      </div>
    </div>
  );
}
