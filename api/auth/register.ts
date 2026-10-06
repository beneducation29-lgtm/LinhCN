import authHandler from "./_handler.js";

export default function authRegister(req: any, res: any) {
  return authHandler(req, res, "/api/auth/register");
}
