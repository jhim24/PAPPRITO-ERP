// ==========================================================
// PAPPRITO ERP
// SIDEBAR CONTROLLER
// File : assets/js/sidebar.js
// Description : Responsive Sidebar Controller
// ==========================================================

(function () {

    "use strict";

    // ======================================================
    // GET SIDEBAR
    // ======================================================

    function getSidebar() {

        return document.querySelector(".sidebar");

    }

    // ======================================================
    // GET MENU TOGGLE
    // ======================================================

    function getMenuToggle() {

        return document.getElementById("menuToggle");

    }

    // ======================================================
    // OPEN SIDEBAR
    // ======================================================

    function openSidebar() {

        const sidebar = getSidebar();

        if (!sidebar) return;

        sidebar.classList.add("show");

        document.body.classList.add("sidebar-open");

    }

    // ======================================================
    // CLOSE SIDEBAR
    // ======================================================

    function closeSidebar() {

        const sidebar = getSidebar();

        if (!sidebar) return;

        sidebar.classList.remove("show");

        document.body.classList.remove("sidebar-open");

    }

    // ======================================================
    // TOGGLE SIDEBAR
    // ======================================================

    function toggleSidebar() {

        const sidebar = getSidebar();

        if (!sidebar) return;

        sidebar.classList.toggle("show");

        document.body.classList.toggle(
            "sidebar-open",
            sidebar.classList.contains("show")
        );

    }

    // ======================================================
    // INITIALIZE SIDEBAR
    // ======================================================

    window.initializeSidebar = function () {

        /*
         * IMPORTANT:
         *
         * Sidebar and navbar are loaded dynamically
         * by app.js.
         *
         * Therefore we do NOT depend on
         * DOMContentLoaded.
         */

        const sidebar = getSidebar();

        if (!sidebar) {

            console.warn(
                "PAPPRITO SIDEBAR: Sidebar element not found."
            );

            return;

        }

        // --------------------------------------------------
        // Remove old initialization marker
        // --------------------------------------------------

        sidebar.dataset.sidebarReady = "true";

        // --------------------------------------------------
        // Restore active menu
        // --------------------------------------------------

        const currentPage =
            localStorage.getItem("currentPage");

        const menuLinks =
            sidebar.querySelectorAll(".sidebar-menu a");

        menuLinks.forEach(link => {

            link.classList.remove("active");

        });

        if (currentPage) {

            menuLinks.forEach(link => {

                const onclick =
                    link.getAttribute("onclick") || "";

                if (
                    currentPage.includes("dashboard") &&
                    onclick.includes("openDashboard")
                ) {

                    link.classList.add("active");

                }

            });

        }

    };

    // ======================================================
    // GLOBAL CLICK HANDLER
    // ======================================================
    //
    // Event delegation is intentional.
    //
    // This allows the hamburger to work even when
    // #menuToggle is dynamically inserted AFTER
    // DOMContentLoaded.
    //
    // ======================================================

    document.addEventListener("click", function (event) {

        const menuToggle =
            event.target.closest("#menuToggle");

        // --------------------------------------------------
        // HAMBURGER
        // --------------------------------------------------

        if (menuToggle) {

            event.preventDefault();

            event.stopPropagation();

            toggleSidebar();

            return;

        }

        // --------------------------------------------------
        // SIDEBAR MENU
        // --------------------------------------------------

        const menuLink =
            event.target.closest(".sidebar-menu a");

        if (menuLink) {

            const sidebar = getSidebar();

            // Active menu

            if (sidebar) {

                sidebar
                    .querySelectorAll(".sidebar-menu a")
                    .forEach(link => {

                        link.classList.remove("active");

                    });

            }

            menuLink.classList.add("active");

            // Save active menu

            localStorage.setItem(
                "activeMenu",
                menuLink.innerText.trim()
            );

            // Close sidebar on mobile

            if (window.innerWidth <= 992) {

                closeSidebar();

            }

            return;

        }

        // --------------------------------------------------
        // CLICK OUTSIDE SIDEBAR
        // --------------------------------------------------

        const sidebar = getSidebar();

        if (!sidebar) return;

        if (window.innerWidth > 992) return;

        if (
            sidebar.classList.contains("show") &&
            !sidebar.contains(event.target)
        ) {

            closeSidebar();

        }

    });

    // ======================================================
    // ESC KEY
    // ======================================================

    document.addEventListener("keydown", function (event) {

        if (event.key !== "Escape") return;

        if (window.innerWidth > 992) return;

        closeSidebar();

    });

    // ======================================================
    // WINDOW RESIZE
    // ======================================================

    window.addEventListener("resize", function () {

        if (window.innerWidth > 992) {

            closeSidebar();

        }

    });

})();
