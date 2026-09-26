export default function handler(
  _request: Request,
  response: {
    status: (code: number) => {
      json: (data: unknown) => unknown;
    };
  },
) {
  return response.status(200).json({ status: "ok" });
}