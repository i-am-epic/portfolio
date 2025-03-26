import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BentoGridItem } from "./bento-grid-item";

const reviews = [
    { text: "Nikhil’s debugging skills are legendary. I once saw him fix a bug just by staring at the code.", author: "A colleague" },
    { text: "We asked him to optimize a data pipeline. He made it 10x faster and then said, 'It could still be better.'", author: "A manager" },
    { text: "Good at data. Bad at replying to texts on time.", author: "A friend" },
];

export default function ReviewCarousel() {
    const [index, setIndex] = useState(0);

    const nextReview = () => {
        setIndex((prev) => (prev + 1) % reviews.length);
    };

    return (
        <BentoGridItem className="md:col-span-2 md:row-span-1 py-2 w-full">
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
            >
                <h2 className="text-3xl md:text-3xl font-bold mb-6">What They Say</h2>

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
                            <span className="text-lg font-semibold text-accent">– {reviews[index].author}</span>
                        </motion.div>
                    </AnimatePresence>

                    {/* Next Review Button */}
                    <button
                        onClick={nextReview}
                        className="mt-6 mx-auto block bg-accent text-white px-4 py-2 rounded-full text-lg hover:bg-accent/90 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </motion.div>
        </BentoGridItem>
    );
}
