import { cn } from "@/lib/utils";

interface PlaceholderImageProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  text?: string;
}

export const PlaceholderImage = ({
  className,
  text = "No Image",
  ...props
}: PlaceholderImageProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gray-100 text-gray-400 rounded-md",
        className
      )}
      {...props}
    >
      <span className="text-sm">{text}</span>
    </div>
  );
};

export default PlaceholderImage;
