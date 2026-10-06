import handler from "../[...path]";

export default function authMe(req: any, res: any) {
  req.url = "/api/auth/me";
  return handler(req, res);
}
