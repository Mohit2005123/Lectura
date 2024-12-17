import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export function AnimatedTestimonialsDemo({ flashCards }) {
  const testimonials = flashCards.map((flashcard) => ({
    heading: flashcard.heading,
    content: flashcard.content,
  }));

  return <AnimatedTestimonials testimonials={testimonials} />;
}
