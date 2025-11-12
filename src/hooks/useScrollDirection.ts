import { useEffect, useState } from "react";

type ScrollDirection = "up" | "down" | null;

const useScrollDirection = () => {
	const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null);
	const [prevScrollY, setPrevScrollY] = useState(0);

	useEffect(() => {
		const threshold = 5;
		let ticking = false;

		const updateScrollDirection = () => {
			const scrollY = window.scrollY;

			if (Math.abs(scrollY - prevScrollY) < threshold) {
				ticking = false;
				return;
			}

			setScrollDirection(scrollY > prevScrollY ? "down" : "up");
			setPrevScrollY(scrollY);
			ticking = false;
		};

		const onScroll = () => {
			if (!ticking) {
				window.requestAnimationFrame(updateScrollDirection);
				ticking = true;
			}
		};

		window.addEventListener("scroll", onScroll);

		return () => window.removeEventListener("scroll", onScroll);
	}, [prevScrollY]);

	return scrollDirection;
};

export default useScrollDirection;
