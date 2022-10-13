import fs from 'fs'

let cache = []
export function doCircular(data: Record<string, any>) {
  const str = JSON.stringify(data, (_, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.includes(value)) return;
      cache.push(value);
    }
    return value;
  });
  cache = []
  return str
}

export function saveToCache(path: string, data: Record<string, any>) {
  const str = typeof data === 'string' ? data : doCircular(data)
  fs.writeFileSync(`.cache/${path}`, str)
}
