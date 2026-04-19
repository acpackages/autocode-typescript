export async function loadTemplate(url: string): Promise<string> {
  const res = await fetch(url);
  return res.text();
}
