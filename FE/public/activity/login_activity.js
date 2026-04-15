const API_BASE_URL = (window.APP_CONFIG && window.APP_CONFIG.API_BASE_URL)
    || window.BASE_URL
    || "http://localhost:3000/api";

document.querySelector(".btn-login").addEventListener("click", async (event) => {
    event.preventDefault(); // Ngăn chặn gửi form nếu có lỗi

    const emailInput = document.querySelector("#edt_email");
    const email = emailInput.value.trim();
    const passwordInput = document.querySelector("#edt_password");
    const password = passwordInput.value;

    let isValid = true;

    // Ẩn tất cả lỗi trước khi kiểm tra
    document.querySelectorAll(".error").forEach(error => {
        error.style.display = "none";
    });

    // Kiểm tra email
    let emailError = document.getElementById("email_error");
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
        emailError.textContent = "Email không được để trống!";
        emailError.style.display = "block";
        isValid = false;
    } else if (!emailRegex.test(email)) {
        emailError.textContent = "Email không hợp lệ!";
        emailError.style.display = "block";
        isValid = false;
    }

    // Kiểm tra password
    let passwordError = document.getElementById("password_error");
    if (!password) {
        passwordError.textContent = "Mật khẩu không được để trống!";
        passwordError.style.display = "block";
        isValid = false;
    } else if (password.length < 6) {
        passwordError.textContent = "Mật khẩu phải có ít nhất 6 ký tự!";
        passwordError.style.display = "block";
        isValid = false;
    }

    // Ngăn gửi request nếu có lỗi
    if (!isValid) {
        return;
    }

    console.log("📩 Dữ liệu gửi đi:", { email, password }); // Kiểm tra email có bị undefined không?

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        // Kiểm tra lỗi HTTP
        if (!response.ok) {
            alert("Lỗi đăng nhập! Kiểm tra email/mật khẩu.");
            console.log(response);
            return;
        }

        const data = await response.json();

        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user)); 

            // 🧠 Lấy token từ URL nếu có
            const urlParams = new URLSearchParams(window.location.search);
            const inviteToken = urlParams.get("token");

            if (inviteToken) {
                // 🔁 Gửi token để join nhóm
                const joinRes = await fetch(`${API_BASE_URL}/join/join-team`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, token: inviteToken })
                });

                const joinData = await joinRes.json();
                console.log("🔗 Kết quả join team:", joinData);

                if (!joinData.success) {
                    alert("Cảnh báo: Không thể tham gia nhóm: " + joinData.message);
                }
            }

            window.location.href = "list-goal-team.html";
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert("Lỗi kết nối máy chủ!");
        console.error("Lỗi:", error);
    }
});
