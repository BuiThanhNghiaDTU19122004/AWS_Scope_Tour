class Sidebar extends HTMLElement {
    connectedCallback(){
        this.innerHTML = `
            <nav id="sidebar">
                <ul class="sidebar-part1">
                <li>
                    <img class = "logo-img" src="../public/img/introduction/icon.png" alt="Scope Tour"  >
                    <span class="logo">Scope Tour</span>
                    <button onclick=toggleSidebar() id="toggle-btn">
                    <i class="fa-solid fa-angles-left"></i>        
                    </button>
                </li>
                <li data-id="home">
                    <a href="introduction.html">
                        <i class="fa-solid fa-house"></i>          
                        <span>Home</span>
                    </a>
                </li>
                <li>
                    <button onclick=toggleSubMenu(this) class="dropdown-btn">
                    <i class="fa-solid fa-list-check"></i>            
                    <span>List goals</span>
                    <i class="fa-solid fa-angle-down"></i>          
                    </button>
                    <ul class="sub-menu">
                        <div>
                        <li data-id="personal">
                            <a href="#">
                            <i class="fa-solid fa-user"></i>
                            Personal
                            </a>
                        </li>
                        <li data-id="team">
                            <a href="list-goal-team.html">
                            <i class="fa-solid fa-people-group"></i>
                            Team
                            </a>
                        </li>
                        <li data-id="calendar">
                            <a href="#">
                            <i class="fa-solid fa-calendar-days"></i>
                            Calendar
                            </a>
                        </li>
                        </div>
                    </ul>
                </li>
                <li data-id="messages">
                    <a href="message.html">
                    <i class="fa-solid fa-comment-dots"></i>            
                    <span>Messages</span>
                    </a>
                </li>
                <li data-id="pet">
                    <a href="select-pet.html">
                        <i class="fa-solid fa-paw"></i>
                        <span>Pet</span>
                    </a>
                </li>
                <li data-id="user-profile">
                    <a href="user-profile.html">
                        <i class="fa-solid fa-user-gear"></i>
                        <span>User Profile</span>
                    </a>
                </li>
                <li data-id="notification">
                    <a href="notification.html">
                        <i class="fa-solid fa-bell"></i>
                        <span>Notification</span>
                    </a>
                </li>
                <li data-id="setting">
                    <a href="setting.html">
                    <i class="fa-solid fa-gear"></i>
                        <span>Setting</span>
                    </a>
                </li>
                </ul>

                <ul class="sidebar-part2">
                <li data-id="help">
                    <a href="help.html">
                    <i class="fa-solid fa-circle-question"></i>
                        <span>Help</span>
                    </a>
                </li>
                <li data-id="log-out">
                    <a href="#" data-action="logout">
                    <i class="fa-solid fa-right-from-bracket"></i>
                        <span>Log out</span>
                    </a>
                </li>
                </ul>
            </nav>
        `;

        this.setActiveMenu();
        this.bindLogoutAction();
    }

    setActiveMenu() {
        const activeMenu = this.getAttribute("data-active-menu");
        if (!activeMenu) return;

        const selectedItem = this.querySelector(`li[data-id="${activeMenu}"]`);
        if (selectedItem) {
            selectedItem.classList.add("active");

            // Nếu item này là một menu con (nằm trong sub-menu)
            // const parentMenu = selectedItem.closest(".sub-menu");
            // if (parentMenu) {
            //     // Mở menu cha
            //     const parentLi = parentMenu.closest("li");
            //     if (parentLi) {
            //         parentLi.querySelector(".dropdown-btn").classList.add("active-parent");
            //         parentMenu.style.display = "block"; // Hiển thị sub-menu
            //     }
            // }
        }
    }

    bindLogoutAction() {
        const logoutLink = this.querySelector('[data-action="logout"]');
        if (!logoutLink) return;

        logoutLink.addEventListener("click", async (event) => {
            event.preventDefault();

            const isConfirmed = await this.showLogoutConfirmationModal();
            if (!isConfirmed) return;

            localStorage.removeItem("user");
            localStorage.removeItem("loggedInUser");
            localStorage.removeItem("currentUserId");

            window.location.href = "login.html";
        });
    }

    showLogoutConfirmationModal() {
        return new Promise((resolve) => {
            if (typeof bootstrap === "undefined") {
                resolve(true);
                return;
            }

            const existingModal = document.getElementById("logout-confirm-modal");
            if (existingModal) {
                existingModal.remove();
            }

            const modalWrapper = document.createElement("div");
            modalWrapper.innerHTML = `
                <div class="modal fade" id="logout-confirm-modal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Confirm Logout</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <p class="mb-0">Bạn có chắc muốn đăng xuất không?</p>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="logout-cancel-btn">Cancel</button>
                                <button type="button" class="btn btn-primary" id="logout-confirm-btn">Logout</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modalWrapper.firstElementChild);

            const modalElement = document.getElementById("logout-confirm-modal");
            const bsModal = new bootstrap.Modal(modalElement);
            let isResolved = false;

            const cleanup = () => {
                modalElement.remove();
            };

            const finalize = (value) => {
                if (isResolved) return;
                isResolved = true;
                resolve(value);
            };

            document.getElementById("logout-confirm-btn").addEventListener("click", () => {
                finalize(true);
                bsModal.hide();
            });

            document.getElementById("logout-cancel-btn").addEventListener("click", () => {
                finalize(false);
            });

            modalElement.addEventListener("hidden.bs.modal", () => {
                finalize(false);
                cleanup();
            });

            bsModal.show();
        });
    }
}

customElements.define('custom-sidebar', Sidebar);