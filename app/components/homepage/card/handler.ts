namespace Page.Homepage.Card {
    function bindCardsActiveEvent(): void {
        const allCardFrames = document.querySelectorAll<HTMLElement>(".card-frame");
        const ACTIVE_CLASS = "active";

        document.addEventListener("click", (event: Event) => {
            for (let i = 0; i < allCardFrames.length; i++) {
                const cardFrame = allCardFrames[i]!;
                cardFrame.classList.remove(ACTIVE_CLASS);
            }

            const target = event.target as HTMLElement;
            let current: HTMLElement | null = target;
            while (current) {
                if (current.classList.contains("card-frame")) {
                    current.classList.add(ACTIVE_CLASS);
                    break;
                }
                current = current.parentElement;
            }
        });

        for (let i = 0; i < allCardFrames.length; i++) {
            const cardFrame = allCardFrames[i]!;
            cardFrame.addEventListener("mouseleave", () => {
                cardFrame.classList.remove(ACTIVE_CLASS);
            });
        }
    }

    bindCardsActiveEvent();
}
