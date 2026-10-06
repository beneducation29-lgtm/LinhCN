import handler from "../[...path]";

export default function authLogin(req: any, res: any) {
  req.url = "/api/auth/login";
  return handler(req, res);
}
