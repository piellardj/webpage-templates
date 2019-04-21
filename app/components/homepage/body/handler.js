(function() {
    const logo = document.getElementById("logo");
    const projectsUrls = [];

    const projectUrlStart = "https://piellardj.github.io/";

    // don't use forEach because not standard and fails on IE11
    const potentialLinks = document.querySelectorAll(".card-footer a");
    for (let i = 0; i < potentialLinks.length; ++i) {
        const href = potentialLinks[i].href;
        if (href && href.indexOf(projectUrlStart) === 0) {
            projectsUrls.push(href);
        }
    }

    /**
     * Updates the logo's href with the url of a random project.
     * @return {boolean}
     */
    function randomizeLogoHref() {
        if (projectsUrls.length > 0) {
            const i = Math.floor(0.999 * projectsUrls.length * Math.random());
            logo.href = projectsUrls[i];
        }
        return true;
    }

    logo.classList.add("dynamic-logo");
    logo.href = "#"; // default value if no projects on the page
    randomizeLogoHref();
    logo.onclick = randomizeLogoHref;
    logo.onauxclick = randomizeLogoHref;
})();
