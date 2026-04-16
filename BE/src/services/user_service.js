const User = require("../models/User");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const PROFILE_ATTRIBUTES = [
    "user_id",
    "user_name",
    "email",
    "phone_number",
    "user_img",
    "created_at"
];

class UserService {
    // Lấy thông tin người dùng bằng Email
    static async getUserByEmail(email) {
        try {
            return await User.findOne({ where: { email } });
        } catch (error) {
            console.error("Lỗi khi lấy người dùng theo email:", error);
            throw error;
        }
    }

    // Lấy thông tin người dùng bằng ID
    static async getUserById(userId) {
        try {
            return await User.findByPk(userId);
        } catch (error) {
            console.error("Lỗi khi lấy người dùng theo ID:", error);
            throw error;
        }
    }

    static async getProfileById(userId) {
        try {
            return await User.findByPk(userId, {
                attributes: PROFILE_ATTRIBUTES
            });
        } catch (error) {
            console.error("Lỗi khi lấy hồ sơ người dùng theo ID:", error);
            throw error;
        }
    }

    // Cập nhật mật khẩu cho người dùng
    static async updatePassword(userId, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const [updated] = await User.update({ password: hashedPassword }, { where: { user_id: userId } });
            return updated > 0; // Trả về true nếu cập nhật thành công
        } catch (error) {
            console.error("Lỗi khi cập nhật mật khẩu:", error);
            throw error;
        }
    }

    // Tạo người dùng mới
    static async createUser(email, name, password) {
        try {
            password = await bcrypt.hash(password, 10); // Mã hóa mật khẩu
            return await User.create({email, user_name: name, password});
        } catch (error) {
            console.error("Lỗi khi tạo người dùng:", error);
            throw error;
        }
    }

    // Cập nhật profile cho người dùng
    static async updateProfile(userId, profileDataOrName, image) {
        try {
            const updateData = {};

            if (typeof profileDataOrName === "object" && profileDataOrName !== null) {
                if (profileDataOrName.user_name !== undefined) {
                    updateData.user_name = profileDataOrName.user_name;
                }
                if (profileDataOrName.email !== undefined) {
                    updateData.email = profileDataOrName.email;
                }
                if (profileDataOrName.phone_number !== undefined) {
                    updateData.phone_number = profileDataOrName.phone_number;
                }
                if (profileDataOrName.user_img !== undefined) {
                    updateData.user_img = profileDataOrName.user_img;
                }
            } else {
                if (profileDataOrName !== undefined) {
                    updateData.user_name = profileDataOrName;
                }
                if (image !== undefined) {
                    updateData.user_img = image;
                }
            }

            if (Object.keys(updateData).length === 0) {
                return false;
            }

            const [updated] = await User.update(updateData, { where: { user_id: userId } });
            return updated > 0; // Trả về true nếu cập nhật thành công
        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ:", error);
            throw error;
        }
    }

    // Lưu OTP tạm thời
    static async saveOTP(email, otp) {
        try {
            const user = await User.findOne({ where: { email } });
            if (user) {
                user.otp = otp;
                user.otp_expiry = new Date(Date.now() + 5 * 60 * 1000); // OTP hết hạn sau 5 phút
                await user.save();
            } else {
                console.error("Email không tồn tại!");
            }
        } catch (error) {
            console.error("Lỗi khi lưu OTP:", error);
        }
    }

    // Xác thực OTP
    static async verifyOTP(email, otp) {
        try {
            const user = await User.findOne({ where: { email } });
            if (!user || user.otp !== otp) return false;
            if (new Date() > user.otp_expiry) return false; // OTP hết hạn
            return true;
        } catch (error) {
            console.error("Lỗi khi xác thực OTP:", error);
            return false;
        }
    }

    static async verifyInviteToken(email, token) {
        try {
            const user = await User.findOne({ where: { email } });
            if (!user || user.invite_token !== token) return false;

            // Optionally: kiểm tra thời gian hết hạn nếu bạn thêm cột `invite_token_expiry`
            return true;
        } catch (error) {
            console.error("Lỗi khi xác thực token:", error);
            return false;
        }
    }

    static async saveInviteToken(email, token) {
        try {
            const user = await User.findOne({ where: { email } });
            if (user) {
                user.invite_token = token;
                await user.save();
            }
        } catch (error) {
            console.error("Lỗi khi lưu token mời:", error);
        }
    }


}

module.exports = UserService;
