import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoGridItem } from "./bento-grid-item";

const reviews = [
    {
        text: "Nikhil turned a bottlenecked telemetry pipeline into a production-grade system with stable latency under heavy load.",
        author: "Engineering Manager",
        role: "Industrial IoT Platform"
    },
    {
        text: "He balances product intuition with deep systems thinking. Features shipped faster and observability became much better.",
        author: "Product Lead",
        role: "AI Analytics Team"
    },
    {
        text: "From architecture to implementation, he owns outcomes. His code reviews also raise the team's standards.",
        author: "Senior Engineer",
        role: "Data Platform"
    },
];

export default function ReviewCarousel() {
    const [index, setIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextReview = () => {
        setIndex((prev) => (prev + 1) % reviews.length);
    };

    const previousReview = () => {
        setIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    useEffect(() => {
        if (isPaused) {
            return;
        }

        const interval = window.setInterval(() => {
            nextReview();
        }, 6000);

        return () => window.clearInterval(interval);
    }, [index, isPaused]);

    return (
        <BentoGridItem className="py-2 w-full">
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                        opacity: 1,
                        y: 0,
                        transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 },
                    },
                }}
                className="h-full flex flex-col justify-center p-8 md:p-12"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <h2 className="text-3xl md:text-3xl font-bold mb-1">What Teams Say</h2>
                <p className="text-sm text-muted-foreground mb-6">Trusted feedback from collaborators</p>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="text-xl text-muted-foreground italic text-center"
                        >
                            "{reviews[index].text}"
                            <br />
                            <span className="mt-4 inline-block text-lg font-semibold text-accent">- {reviews[index].author}</span>
                            <br />
                            <span className="text-sm text-muted-foreground">{reviews[index].role}</span>
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-6 flex items-center justify-center gap-3">
                        <button
                            onClick={previousReview}
                            className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
                        >
                            Prev
                        </button>
                        <button
                            onClick={nextReview}
                            className="rounded-full bg-accent px-4 py-2 text-sm text-accent-foreground transition hover:bg-accent/90"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </motion.div>
        </BentoGridItem>
    );
}
