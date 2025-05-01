import { Admin } from "../models/admin.model";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await Admin.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

export default generateAccessAndRefreshTokens;