// Props for click targets that are not native buttons (images, cards, headings)
// so keyboard and screen reader users can activate them too.
export const clickable = (onClick) => ({
    onClick,
    role: 'button',
    tabIndex: 0,
    onKeyDown: (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e);
        }
    },
});
