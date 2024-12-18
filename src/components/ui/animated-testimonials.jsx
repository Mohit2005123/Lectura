"use client";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export const AnimatedTestimonials = ({ testimonials, autoplay = false }) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    if (active < testimonials.length - 1) {
      setActive((prev) => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (active > 0) {
      setActive((prev) => prev - 1);
    }
  };
  

  const isActive = (index) => index === active;

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10;

  return (
    <div className="max-w-sm md:max-w-4xl mx-auto antialiased font-sans px-4 md:px-8 lg:px-12 py-20">
      <div className="relative flex items-center gap-4 md:gap-6">
        {/* Image Div with Random Color and Content */}
        <div
          className="relative flex-1 h-80 md:h-96"
          style={{ flexBasis: "70%" }}
        >
          <AnimatePresence>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index} // Use index as fallback key
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  rotate: randomRotateY(),
                }}
                animate={{
                  opacity: isActive(index) ? 1 : 0.7,
                  scale: isActive(index) ? 1 : 0.95,
                  rotate: isActive(index) ? 0 : randomRotateY(),
                  zIndex: isActive(index)
                    ? 999
                    : testimonials.length + 2 - index,
                  y: isActive(index) ? [0, -80, 0] : 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  rotate: randomRotateY(),
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 flex items-center justify-center rounded-3xl"
                style={{
                  backgroundColor: `rgb(${Math.floor(Math.random() * 100)}, ${Math.floor(
                    Math.random() * 100
                  )}, ${Math.floor(Math.random() * 100)})`,
                }}
                
              >
                {/* Content Inside the Div */}
                <div className="text-center px-8">
                  <h3 className="text-4xl font-bold md:pb-7 text-white">
                    {testimonial.heading} {/* Use heading */}
                  </h3>
                  <motion.p className="text-2xl text-gray-200 mt-4">
                    {testimonial.content?.split(" ").map((word, idx) => (
                      <motion.span
                        key={idx}
                        initial={{
                          filter: "blur(10px)",
                          opacity: 0,
                          y: 5,
                        }}
                        animate={{
                          filter: "blur(0px)",
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          duration: 0.2,
                          ease: "easeInOut",
                          delay: 0.02 * idx,
                        }}
                        className="inline-block"
                      >
                        {word}&nbsp;
                      </motion.span>
                    ))}
                  </motion.p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Buttons Positioned on Left and Right */}
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-[-4rem] transform -translate-y-1/2 h-12 w-12 bg-gray-200 dark:bg-neutral-800 flex items-center justify-center rounded-full"
          >
            <IconArrowLeft className="h-6 w-6 text-black dark:text-neutral-400" />
          </button>
          <button
            onClick={handleNext}
            className="absolute top-1/2 right-[-4rem] transform -translate-y-1/2 h-12 w-12 bg-gray-200 dark:bg-neutral-800 flex items-center justify-center rounded-full"
          >
            <IconArrowRight className="h-6 w-6 text-black dark:text-neutral-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
