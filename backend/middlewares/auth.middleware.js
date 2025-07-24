import { clerkClient } from "@clerk/express";

export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    const user = await clerkClient.users.getUser(userId);

    if (user?.privateMetadata.role !== "admin") {
      return res
        .status(200)
        .json({ success: true, message: "Not Authorized", isAdmin: false});
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }
};
