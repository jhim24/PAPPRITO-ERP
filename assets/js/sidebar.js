// ==========================================
// PAPPRITO ERP
// SIDEBAR CONTROLLER
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    initializeSidebar();

});

// ==========================================
// INITIALIZE SIDEBAR
// ==========================================

function initializeSidebar(){

    const menuToggle = document.getElementById("menuToggle");

    const sidebar = document.querySelector(".sidebar");

    // -----------------------------
    // TOGGLE SIDEBAR
    // -----------------------------

    if(menuToggle){

        menuToggle.addEventListener("click", ()=>{

            sidebar.classList.toggle("show");

        });

    }

    // -----------------------------
    // ACTIVE MENU
    // -----------------------------

    document.querySelectorAll(".sidebar-menu a").forEach(link=>{

        link.addEventListener("click",function(){

            document.querySelectorAll(".sidebar-menu a")
            .forEach(item=>{

                item.classList.remove("active");

            });

            this.classList.add("active");

            // Close sidebar on mobile

            if(window.innerWidth <= 992){

                sidebar.classList.remove("show");

            }

        });

    });

}

// ==========================================
// AUTO CLOSE WHEN CLICK OUTSIDE
// ==========================================

document.addEventListener("click",function(e){

    const sidebar = document.querySelector(".sidebar");

    const toggle = document.getElementById("menuToggle");

    if(!sidebar || !toggle) return;

    if(window.innerWidth > 992) return;

    if(

        !sidebar.contains(e.target) &&

        !toggle.contains(e.target)

    ){

        sidebar.classList.remove("show");

    }

});
