document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL)
        || window.BASE_URL
        || "http://localhost:3000/api";

    const profileForm = document.getElementById("profile-form");
    if (!profileForm) {
        return;
    }

    const nameInput = document.getElementById("profile-name");
    const emailInput = document.getElementById("profile-email");
    const phoneInput = document.getElementById("profile-phone");
    const bioInput = document.getElementById("profile-bio");
    const imageInput = document.getElementById("profile-image-input");
    const imagePreview = document.getElementById("profile-image-preview");
    const displayNameEl = document.getElementById("profile-display-name");
    const displayEmailEl = document.getElementById("profile-display-email");
    const headerNameEl = document.getElementById("user_name");
    const resetButton = document.getElementById("reset-profile-btn");
    const submitButton = profileForm.querySelector("button[type='submit']");

    const defaultAvatar = "../public/img/introduction/icon.png";
    let selectedImageFile = null;
    let originalProfile = {
        user_name: "",
        email: "",
        phone_number: "",
        user_img: "",
        bio: ""
    };

    function getStoredUser() {
        try {
            const rawUser = localStorage.getItem("user");
            if (!rawUser) return null;
            return JSON.parse(rawUser);
        } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
            return null;
        }
    }

    function getCurrentUserId() {
        const user = getStoredUser();
        if (!user) return null;

        const possibleIds = [user.user_id, user.id, user.userId];
        for (const idValue of possibleIds) {
            const parsedId = Number(idValue);
            if (Number.isInteger(parsedId) && parsedId > 0) {
                return parsedId;
            }
        }

        return null;
    }

    function createModalContainerIfNeeded() {
        let modalContainer = document.getElementById("modal-status-action-container");
        if (!modalContainer) {
            modalContainer = document.createElement("div");
            modalContainer.id = "modal-status-action-container";
            document.body.appendChild(modalContainer);
        }
        return modalContainer;
    }

    function showFeedbackModal(message, variant = "success", title = "Success") {
        const modalContainer = createModalContainerIfNeeded();
        const isError = variant === "danger";
        const modalId = isError ? "profile-error-modal" : "profile-success-modal";
        const iconClass = isError ? "fa-circle-exclamation" : "fa-circle-check";

        modalContainer.innerHTML = `
            <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-${variant} text-white">
                            <h5 class="modal-title d-flex align-items-center">
                                <i class="fa-solid ${iconClass} me-2"></i>${title}
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body text-center py-4">
                            <p class="fs-5 mb-0">${message}</p>
                        </div>
                        <div class="modal-footer justify-content-center">
                            <button type="button" class="btn btn-${variant} px-4" data-bs-dismiss="modal">OK</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (typeof bootstrap === "undefined") {
            console.error("Bootstrap JS is required for modals.");
            return;
        }

        const modalElement = document.getElementById(modalId);
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        modalElement.addEventListener("hidden.bs.modal", () => {
            modalContainer.innerHTML = "";
        }, { once: true });
    }

    function showSuccessModal(message) {
        showFeedbackModal(message, "success", "Profile Updated");
    }

    function showErrorModal(message) {
        showFeedbackModal(message, "danger", "Update Failed");
    }

    function setLoading(isLoading) {
        if (!submitButton) return;
        submitButton.disabled = isLoading;
        submitButton.textContent = isLoading ? "Saving..." : "Save Changes";
    }

    function updateHeaderName(name) {
        const safeName = name || "User";
        if (headerNameEl) {
            headerNameEl.textContent = safeName;
        }
    }

    function renderProfile(profile) {
        const userName = profile.user_name || "User";
        const userEmail = profile.email || "user@email.com";

        nameInput.value = profile.user_name || "";
        emailInput.value = profile.email || "";
        phoneInput.value = profile.phone_number || "";
        if (bioInput) {
            bioInput.value = profile.bio || "";
        }

        displayNameEl.textContent = userName;
        displayEmailEl.textContent = userEmail;
        updateHeaderName(userName);

        imagePreview.src = profile.user_img || defaultAvatar;
    }

    function syncUserToLocalStorage(profile) {
        const currentUser = getStoredUser() || {};
        const mergedUser = {
            ...currentUser,
            user_name: profile.user_name || currentUser.user_name || currentUser.name,
            email: profile.email || currentUser.email,
            phone_number: profile.phone_number || currentUser.phone_number,
            user_img: profile.user_img || currentUser.user_img
        };

        localStorage.setItem("user", JSON.stringify(mergedUser));
    }

    async function loadProfile() {
        const userId = getCurrentUserId();
        if (!userId) {
            showErrorModal("Cannot determine user identity. Please log in again.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/user-profile/${userId}`);
            const data = await response.json();

            if (!response.ok || !data.success || !data.user) {
                throw new Error(data.message || "Unable to load profile data");
            }

            originalProfile = {
                user_name: data.user.user_name || "",
                email: data.user.email || "",
                phone_number: data.user.phone_number || "",
                user_img: data.user.user_img || "",
                bio: ""
            };

            renderProfile(originalProfile);
            syncUserToLocalStorage(originalProfile);
        } catch (error) {
            console.error("Profile load error:", error);
            showErrorModal(error.message || "Failed to load profile.");
        }
    }

    function resetFormToOriginal() {
        selectedImageFile = null;
        imageInput.value = "";
        renderProfile(originalProfile);
    }

    imageInput.addEventListener("change", (event) => {
        const file = event.target.files && event.target.files[0];
        if (!file) {
            selectedImageFile = null;
            imagePreview.src = originalProfile.user_img || defaultAvatar;
            return;
        }

        selectedImageFile = file;
        imagePreview.src = URL.createObjectURL(file);
    });

    resetButton.addEventListener("click", resetFormToOriginal);

    profileForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const userId = getCurrentUserId();
        if (!userId) {
            showErrorModal("Cannot determine user identity. Please log in again.");
            return;
        }

        const formData = new FormData();
        formData.append("user_name", nameInput.value.trim());
        formData.append("email", emailInput.value.trim());
        formData.append("phone_number", phoneInput.value.trim());
        if (selectedImageFile) {
            formData.append("image", selectedImageFile);
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/user-profile/${userId}`, {
                method: "PUT",
                body: formData
            });
            const data = await response.json();

            if (!response.ok || !data.success || !data.user) {
                throw new Error(data.message || "Profile update failed");
            }

            originalProfile = {
                ...originalProfile,
                user_name: data.user.user_name || "",
                email: data.user.email || "",
                phone_number: data.user.phone_number || "",
                user_img: data.user.user_img || ""
            };

            syncUserToLocalStorage(originalProfile);
            renderProfile(originalProfile);
            selectedImageFile = null;
            imageInput.value = "";
            showSuccessModal("Your profile has been saved successfully.");
        } catch (error) {
            console.error("Profile update error:", error);
            showErrorModal(error.message || "Failed to update profile.");
        } finally {
            setLoading(false);
        }
    });

    loadProfile();
});
