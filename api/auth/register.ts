import app from "../../server";

export default function handler(req: any, res: any) {
  req.url = "/api/auth/register";
  return app(req, res);
}
