import authHandler from "./_handler.js";

export default function authLogin(req: any, res: any) {
  return authHandler(req, res, "/api/auth/login");
}
