"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/images/auth/auth-retail-pos.png",
    title: "Sell \n  with confidence",
    detail: "Fast checkout, organized stock, and clear daily operations across every shift.",
  },
  {
    src: "/images/auth/auth-warehouse-stock.png",
    title: "Know \n  what is in stock",
    detail: "Track inventory movement across shelves, locations, and teams without losing control.",
  },
  {
    src: "/images/auth/auth-pharmacy-purchase.png",
    title: "Stay \n  ready for demand",
    detail: "Manage deliveries and keep critical items available when customers need them most.",
  },
  {
    src: "/images/auth/auth-restaurant-sales.png",
    title: "See \n  the business clearly",
    detail: "Bring sales, purchases, payments, and growth into one calm operating system.",
  },
  {
    src: "/images/auth/auth-finance-insight.png",
    title: "Keep \n cash flow in focus",
    detail: "Track revenue, balances, expenses, and payment activity with the visibility every owner and finance lead needs.",
  },
];

export default function AuthHeroIllustration() {
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = slides.length;

  useEffect(() => {
    if (activeIndex < slideCount) {
      return;
    }

    setActiveIndex(0);
  }, [activeIndex, slideCount]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [slideCount]);

  const activeSlide = slides[activeIndex];

  return (
    <section className="absolute inset-0" aria-label="Business growth stories">
      {slides.map((slide, index) => (
        <Image key={slide.src} src={slide.src} alt="" fill priority={index === 0} sizes="100vw" className={["object-cover object-center transition-opacity duration-1000 ease-out", index === activeIndex ? "opacity-100" : "opacity-0"].join(" ")} />
      ))}

      <div className="absolute inset-0 bg-[linear-gradient(114deg,rgba(7,21,20,0.88)_0%,rgba(9,29,27,0.68)_32%,rgba(8,25,23,0.48)_56%,rgba(244,241,234,0.22)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(247,200,85,0.14),transparent_22%),radial-gradient(circle_at_70%_24%,rgba(255,255,255,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(45,131,125,0.16),transparent_30%)]" />
      <div className="absolute inset-y-0 right-0 w-[46%] bg-[linear-gradient(90deg,rgba(8,24,22,0)_0%,rgba(8,24,22,0.16)_12%,rgba(8,24,22,0.28)_35%,rgba(8,24,22,0.42)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-[#081917]/86 via-[#081917]/34 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-4 sm:px-8 sm:pb-6 lg:bottom-8 lg:px-12 lg:pb-0">
        <div className=" lg:pb-36">
          <div className="transition-opacity  lg:!w-[45rem] duration-500 ease-out">
            <p className=" text-[1.85rem] whitespace-pre-line font-semibold leading-[1.02] tracking-tight text-white sm:text-[2.55rem] lg:text-[5.15rem]">{activeSlide.title}</p>
            <p className="mt-3 hidden max-w-[66ch] text-sm leading-6 text-white/82 sm:block sm:text-xl lg:max-w-[60ch]">{activeSlide.detail}</p>
          </div>

          <div className="mt-4 flex items-center gap-2 sm:mt-5">
            {slides.map((slide, index) => (
              <button
                key={slide.src}
                type="button"
                aria-label={`Show story ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={["rounded-full transition-all", index === activeIndex ? "h-2 w-11 bg-[#f7c855] shadow-[0_0_0_4px_rgba(247,200,85,0.12)]" : "h-2 w-5 bg-white/28 hover:bg-white/52"].join(" ")}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
