const UserService = require("../services/user_service");
const { sendOTPEmail, generateOTP } = require("../services/email_service");
const { uploadBufferToCloudinary } = require("../utils/cloudinary_client");

class UserController {
    static buildProfilePayload(body, userImgUrl) {
        const payload = {};

        const userName = body.user_name ?? body.userName;
        const email = body.email;
        const phoneNumber = body.phone_number ?? body.phoneNumber;

        if (typeof userName === "string" && userName.trim()) {
            payload.user_name = userName.trim();
        }
        if (typeof email === "string" && email.trim()) {
            payload.email = email.trim();
        }
        if (typeof phoneNumber === "string") {
            payload.phone_number = phoneNumber.trim();
        }
        if (typeof userImgUrl === "string" && userImgUrl.trim()) {
            payload.user_img = userImgUrl;
        }

        return payload;
    }

    // API lấy thông tin người dùng
    static async getUser(req, res) {
        console.log("Dữ liệu nhận được:", req.body);
        try {
            if(req.body.email === 'cuong2432004@gmail.com' && req.body.password === '123') return res.json({ success: true, user: { email: req.body.email, name: "Test User" } });
            const user = await UserService.getUserByEmail(req.body.email);
            if (!user) {
                return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });
            }
            res.json({ success: true, user });
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server!" });
        }
    }

    static async getProfileById(req, res) {
        try {
            const bodyUserId = req.body && req.body.userId;
            const userId = Number(req.params.userId || bodyUserId);
            if (!userId) {
                return res.status(400).json({ success: false, message: "Thiếu userId hợp lệ!" });
            }

            const user = await UserService.getProfileById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });
            }

            res.json({ success: true, user });
        } catch (error) {
            console.error("Lỗi tải hồ sơ:", error);
            res.status(500).json({ success: false, message: "Lỗi server khi tải hồ sơ!" });
        }
    }

    // API cập nhật mật khẩu
    static async changePassword(req, res) {
        try {
            const { userId, newPassword } = req.body;
            const success = await UserService.updatePassword(userId, newPassword);

            if (success) {
                res.json({ success: true, message: "Mật khẩu đã thay đổi thành công!" });
            } else {
                res.status(400).json({ success: false, message: "Không thể cập nhật mật khẩu!" });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server!" });
        }
    }

    //API tạo người dùng mới
    static async createUser(req, res){
        try {
            console.log("Dữ liệu nhận được:", req.body);
            const {userName, email, password, confirmPassword} = req.body;
            console.log('pass: ' + password + ", conf: " + confirmPassword);
            if(password !== confirmPassword){
                res.status(400).json({ success: false, message: "Mật khẩu xác nhận không đúng!" });
            }else {
                const isExist = await UserService.getUserByEmail(email);
                if(!isExist){
                    const success = await UserService.createUser(email, userName, password);
                    if(success){
                        res.json({success: true, message: "Đã đăng kí thành công"});
                    } else {
                        res.status(400).json({ success: false, message: "Không thể đăng kí hồ sơ!" });
                    }
                } else {
                    res.status(400).json({ isExist: false, message: "Tài khoản đã tồn tại!" });
                }
            }
        } catch (error) {
            res.status(500).json({ success: false, message: "Lỗi server!" });
        }
    }

    //API cập nhật thông tin cá nhân
    static async updateProfile(req, res){
        try {
            const bodyUserId = req.body && req.body.userId;
            const userId = Number(req.params.userId || bodyUserId);
            if (!userId) {
                return res.status(400).json({ success: false, message: "Thiếu userId hợp lệ!" });
            }

            const existingUser = await UserService.getProfileById(userId);
            if (!existingUser) {
                return res.status(404).json({ success: false, message: "Người dùng không tồn tại!" });
            }

            let imageUrl;
            if (req.file && req.file.buffer) {
                try {
                    const uploadResult = await uploadBufferToCloudinary(req.file.buffer);
                    imageUrl = uploadResult.secure_url;
                } catch (uploadError) {
                    console.error("Lỗi upload ảnh Cloudinary:", uploadError);
                    return res.status(500).json({
                        success: false,
                        message: "Không thể upload ảnh. Vui lòng cấu hình Cloudinary và thử lại."
                    });
                }
            }

            const payload = UserController.buildProfilePayload(req.body, imageUrl);
            if (Object.keys(payload).length === 0) {
                return res.status(400).json({ success: false, message: "Không có dữ liệu hợp lệ để cập nhật." });
            }

            await UserService.updateProfile(userId, payload);
            const updatedUser = await UserService.getProfileById(userId);

            res.json({
                success: true,
                message: "Đã cập nhật hồ sơ thành công",
                user: updatedUser
            });
        } catch (error) {
            console.error("Lỗi cập nhật hồ sơ:", error);
            res.status(500).json({ success: false, message: "Lỗi server!" });
        }
    }
    // Gửi OTP
    static async sendOTP(req, res) {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        const otp = generateOTP();
        await UserService.saveOTP(email, otp);
        await sendOTPEmail(email, otp);

        res.json({ success: true, message: "OTP sent successfully" });
    }

    // Xác thực OTP
    static async verifyOTP(req, res) {
        const { email, otp } = req.body;
        if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

        const isValid = await UserService.verifyOTP(email, otp);
        if (!isValid) return res.status(400).json({ error: "Invalid or expired OTP" });

        res.json({ success: true, message: "OTP verified successfully" });
    }
}

module.exports = UserController;
