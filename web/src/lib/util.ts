function copyToClipboard(text: string): Promise<boolean> {
  return new Promise(resolve => {
    navigator.clipboard.writeText(text)
      .then(() => resolve(true))
      .catch(() => resolve(false))
  })
}

/**
 * Generates 4 characters of base 36 random id using Math.random().
 * @returns 
 */
function generateId() {
  return Math.random().toString(36).substring(2, 2 + 4);
}

export const util = {
  copyToClipboard,
  
  generateId,
}