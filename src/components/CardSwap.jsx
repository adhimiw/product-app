import {
    Children,
    cloneElement,
    isValidElement,
    useEffect,
    useMemo,
    useRef,
} from 'react';
import gsap from 'gsap';
import './CardSwap.css';

export const Card = ({ customClass, ref, ...rest }) => (
    <div
        ref={ref}
        {...rest}
        className={`card ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
    />
);

const makeSlot = (i, distX, distY, total) => ({
    x: i * distX,
    y: -i * distY,
    z: -i * distX * 1.5,
    zIndex: total - i,
});

const placeNow = (el, slot, skew) =>
    gsap.set(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skew,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true,
    });

const CardSwap = ({
    width = 500,
    height = 400,
    cardDistance = 60,
    verticalDistance = 70,
    delay = 5000,
    pauseOnHover = false,
    onCardClick,
    skewAmount = 6,
    easing = 'elastic',
    children,
}) => {
    const config =
        easing === 'elastic'
            ? {
                  ease: 'elastic.out(0.6,0.9)',
                  durDrop: 2,
                  durMove: 2,
                  durReturn: 2,
                  promoteOverlap: 0.9,
                  returnDelay: 0.05,
              }
            : {
                  ease: 'power1.inOut',
                  durDrop: 0.8,
                  durMove: 0.8,
                  durReturn: 0.8,
                  promoteOverlap: 0.45,
                  returnDelay: 0.2,
              };

    const childArr = useMemo(() => Children.toArray(children), [children]);

    const order = useRef(null);
    if (order.current === null) {
        order.current = Array.from({ length: childArr.length }, (_, i) => i);
    }

    const tlRef = useRef(null);
    const intervalRef = useRef();
    const container = useRef(null);
    const swapRef = useRef(null);

    // Manually advance the deck when a card is clicked, so visitors can
    // browse through every banner and read it (instead of navigating away).
    // Handled by delegation on the container so cloneElement passes only
    // plain values (keeps refs out of render-time closures).
    const handleCardClick = (e) => {
        const card = e.target.closest('.card');
        if (!card || !container.current) return;
        const i = Array.from(container.current.children).indexOf(card);
        if (i === -1) return;
        onCardClick?.(i);
        if (tlRef.current && tlRef.current.isActive()) return; // ignore mid-flight clicks
        clearInterval(intervalRef.current);
        swapRef.current?.();
        intervalRef.current = window.setInterval(() => swapRef.current?.(), delay);
    };

    useEffect(() => {
        // Skip GSAP during prerender (?prerender flag) so the snapshot's DOM
        // matches React's initial render — otherwise baked inline transforms
        // break hydration. GSAP runs normally for real visitors.
        if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('prerender')) {
            return;
        }
        // Card elements are read from the DOM at commit time instead of via
        // per-child refs, so no ref values are touched during render.
        const cards = Array.from(container.current.children);
        const total = cards.length;
        cards.forEach((el, i) =>
            placeNow(
                el,
                makeSlot(i, cardDistance, verticalDistance, total),
                skewAmount
            )
        );

        const swap = () => {
            if (order.current.length < 2) return;

            const [front, ...rest] = order.current;
            const elFront = cards[front];
            const tl = gsap.timeline();
            tlRef.current = tl;

            tl.to(elFront, {
                y: '+=500',
                duration: config.durDrop,
                ease: config.ease,
            });

            tl.addLabel('promote', `-=${config.durDrop * config.promoteOverlap}`);
            rest.forEach((idx, i) => {
                const el = cards[idx];
                const slot = makeSlot(i, cardDistance, verticalDistance, cards.length);
                tl.set(el, { zIndex: slot.zIndex }, 'promote');
                tl.to(
                    el,
                    {
                        x: slot.x,
                        y: slot.y,
                        z: slot.z,
                        duration: config.durMove,
                        ease: config.ease,
                    },
                    `promote+=${i * 0.15}`
                );
            });

            const backSlot = makeSlot(
                cards.length - 1,
                cardDistance,
                verticalDistance,
                cards.length
            );
            tl.addLabel('return', `promote+=${config.durMove * config.returnDelay}`);
            tl.call(
                () => {
                    gsap.set(elFront, { zIndex: backSlot.zIndex });
                },
                undefined,
                'return'
            );
            tl.set(elFront, { x: backSlot.x, z: backSlot.z }, 'return');
            tl.to(
                elFront,
                {
                    y: backSlot.y,
                    duration: config.durReturn,
                    ease: config.ease,
                },
                'return'
            );

            tl.call(() => {
                order.current = [...rest, front];
            });
        };

        swapRef.current = swap;
        swap();
        intervalRef.current = window.setInterval(swap, delay);

        if (pauseOnHover) {
            const node = container.current;
            const pause = () => {
                tlRef.current?.pause();
                clearInterval(intervalRef.current);
            };
            const resume = () => {
                tlRef.current?.play();
                intervalRef.current = window.setInterval(swap, delay);
            };
            node.addEventListener('mouseenter', pause);
            node.addEventListener('mouseleave', resume);
            return () => {
                node.removeEventListener('mouseenter', pause);
                node.removeEventListener('mouseleave', resume);
                clearInterval(intervalRef.current);
            };
        }
        return () => clearInterval(intervalRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cardDistance, verticalDistance, delay, pauseOnHover, skewAmount, easing]);

    const rendered = childArr.map((child, i) =>
        isValidElement(child)
            ? cloneElement(child, {
                  key: i,
                  style: { width, height, ...(child.props.style ?? {}) },
              })
            : child
    );

    return (
        // Click-to-advance is a mouse convenience; the deck auto-advances and
        // each card's CTA button stays keyboard-reachable.
        <div
            ref={container}
            role="presentation"
            className="card-swap-container"
            style={{ width, height }}
            onClick={handleCardClick}
        >
            {rendered}
        </div>
    );
};

export default CardSwap;
