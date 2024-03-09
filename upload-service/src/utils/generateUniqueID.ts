export function generateUniqueID (): string {
    let ans = ''
    const subset = '1234567890qwertyuiopasdfghjklzxcvbnm'
    for (let i = 0; i < (process.env.ID_MAX_LEN as unknown as number ?? 5); i++) {
      ans += subset[Math.floor(Math.random() * subset.length)]
    }
    return ans
  }