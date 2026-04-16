document.addEventListener('DOMContentLoaded', function () {
    function getCurrentUserDisplayName() {
      try {
        const rawUser = localStorage.getItem('user');
        if (!rawUser) return "";

        const user = JSON.parse(rawUser);
        if (!user || typeof user !== 'object') return "";

        return user.name || user.user_name || user.username || user.email || "";
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
        return "";
      }
    }

    function updateHeaderUserName() {
      const displayName = getCurrentUserDisplayName();
      if (!displayName) return;

      const userNameElements = document.querySelectorAll('.header-user .user-name h3, #user_name');
      userNameElements.forEach((element) => {
        element.textContent = displayName;
      });
    }

    function updateTime() {
      const now = new Date();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      let seconds = now.getSeconds();
      // Format with leading zeros if needed
      hours = hours < 10 ? '0' + hours : hours;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;
      const formattedTime = `${hours}:${minutes}`;
      // Update the time element
      const timeElement = document.querySelector('.header-time .time');
      if (timeElement) {
        timeElement.textContent = formattedTime;
      }
    }
    
    // Update immediately, then every second
    updateHeaderUserName();
    updateTime();
    setInterval(updateTime, 1000);

    // // Lấy tên user và cập nhật vào giao diện
    // fetch('/api/user/profile')
    //   .then(res => res.json())
    //   .then(data => {
    //       if (data && data.name) {
    //       document.getElementById('userName').textContent = data.name;
    //       }
    //   })
    //   .catch(() => {
    //       // Có thể giữ nguyên tên mặc định hoặc xử lý lỗi nếu muốn
    //   });

    // Khi user bấm nút đăng xuất
    // localStorage.removeItem('user');
    // window.location.href = "login.html";
  });
  