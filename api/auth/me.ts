import authHandler from "./_handler.js";

export default function authMe(req: any, res: any) {
  return authHandler(req, res, "/api/auth/me");
}
