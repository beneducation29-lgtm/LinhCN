import handler from "../[...path]";

export default function authRegister(req: any, res: any) {
  req.url = "/api/auth/register";
  return handler(req, res);
}
