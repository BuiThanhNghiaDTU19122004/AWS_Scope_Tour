const express = require("express");
const router = express.Router();
const InviteTokenService = require("../services/invite_token_service");
const InvitationToken = require("../models/InvitationToken"); 
const UserService = require("../services/user_service");      
const TeamMember = require("../models/TeamMember");           

const FRONTEND_BASE_URL = (process.env.FRONTEND_BASE_URL || "http://localhost:5500").replace(/\/$/, "");

router.get("/", async (req, res) => {
    const { email, token } = req.query;

    if (!email || !token) {
        return res.status(400).json({ success: false, message: "Missing email or token" });
    }

    const isValid = await InviteTokenService.verifyToken(email, token);
    if (!isValid) {
        return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }

    // Redirect users to login page so existing flow can handle invite token.
    return res.redirect(`${FRONTEND_BASE_URL}/views/login.html?email=${encodeURIComponent(email)}&token=${token}`);
});

router.post("/join-team", async (req, res) => {
    const { email, token } = req.body;

    const tokenRecord = await InvitationToken.findOne({
        where: { email, token, used: false }
    });

    if (!tokenRecord || new Date() > tokenRecord.expires_at) {
        return res.status(400).json({ success: false, message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const user = await UserService.getUserByEmail(email);
    if (!user) {
        return res.status(404).json({ success: false, message: "Người dùng không tồn tại" });
    }

    // 🔄 Lấy team_id từ bản ghi token
    const teamId = tokenRecord.team_id;

    // ✅ Thêm vào bảng TeamMember
    await TeamMember.create({
        team_id: teamId,
        user_id: user.user_id,
        team_name: tokenRecord.team_name, // Lưu tên nhóm nếu cần
    });

    // ✅ Đánh dấu token đã dùng
    await InviteTokenService.markTokenUsed(email, token);

    return res.json({ success: true, message: "Đã thêm vào nhóm thành công" });
});



module.exports = router;
