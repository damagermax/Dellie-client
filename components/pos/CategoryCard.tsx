"use client";

type CategoryCardProps = {
  title: string;
  active?: boolean;
  onClick: () => void;
};

export default function CategoryCard({ title, active = false, onClick }: CategoryCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center border-b-2 px-3 py-2.5 text-center transition md:rounded-[18px] md:border md:px-4 md:py-2 ${
        active ? "border-[#2d837d] bg-white md:bg-[#edf7f6]" : "border-transparent bg-white hover:border-gray-300 md:border-[#dfdfdf] md:bg-[#fafafa] md:hover:bg-white"
      }`}
    >
      <div className={`whitespace-nowrap text-sm font-semibold leading-tight md:text-[15px] ${active ? "text-[#236d68]" : "text-gray-500"}`}>{title}</div>
    </button>
  );
}
