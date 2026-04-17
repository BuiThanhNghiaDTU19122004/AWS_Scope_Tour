const isLocalHost =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";
const fallbackApiBaseUrl = isLocalHost
    ? "http://localhost:3000/api"
    : `${window.location.origin}/api`;

document.addEventListener("DOMContentLoaded", function () {
    const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL)
        || window.BASE_URL
        || fallbackApiBaseUrl;

    const sendBtn = document.getElementById("sendBtn");
    const emailInput = document.getElementById("emailInput");
    const messageElement = document.getElementById("message");

    sendBtn.addEventListener("click", function () {
        const email = emailInput.value.trim();

        if (!email) {
            messageElement.style.color = "red";
            messageElement.innerText = "Please enter an email.";
            return;
        }

        console.log("Email:", email);

        fetch(`${API_BASE_URL}/invitation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })
        .then(response => response.json())
        .then(data => {
            if(data.success) messageElement.style.color = "green";
            else messageElement.style.color = "red";
            messageElement.innerText = data.message || "Invitation sent successfully!";
        })
        .catch(error => {
            console.error("API Error:", error);
            messageElement.style.color = "red";
            messageElement.innerText = "Failed to send invitation.";
        });
    });
});
