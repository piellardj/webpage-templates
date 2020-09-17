// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Homepage {
    /* Retrieve projects URLs from DOM, in their order of appearance */
    function retrieveProjectsUrls(): string[] {
        const projectUrlStart = "https://piellardj.github.io/";

        const result: string[] = [];

        // don't use forEach because not standard and fails on IE11
        const potentialLinks = document.querySelectorAll(".card-footer a");
        for (let i = 0; i < potentialLinks.length; ++i) {
            const href = (potentialLinks[i] as HTMLLinkElement).href;
            if (href && href.indexOf(projectUrlStart) === 0) {
                result.push(href);
            }
        }

        return result;
    }

    function shuffleList<T>(list: T[]): void {
        function swap(index1: number, index2: number): void {
            if (index1 !== index2) {
                const tmp = list[index1];
                list[index1] = list[index2];
                list[index2] = tmp;
            }
        }

        for (let currentIndex = list.length - 1; currentIndex > 0; --currentIndex) {
            const substituteIndex = Math.floor(0.9999 * currentIndex * Math.random());
            swap(currentIndex, substituteIndex);
        }
    }

    const logo = document.querySelector("a#logo") as HTMLLinkElement;
    if (logo) {
        const projectsUrls = retrieveProjectsUrls();

        let nextIndex = 0;
        /**
         * Updates the logo's href with an url from the shuffled list.
         */
        function randomizeLogoHref(): void {
            if (nextIndex === 0) {
                shuffleList(projectsUrls);
            }

            logo.href = projectsUrls[nextIndex];
            nextIndex = (nextIndex + 1) % projectsUrls.length;
        }

        logo.classList.add("dynamic-logo");
        logo.href = "#"; // default value if no projects on the page
        logo.onclick = randomizeLogoHref;
        logo.onauxclick = randomizeLogoHref;
        randomizeLogoHref();
    }
}
