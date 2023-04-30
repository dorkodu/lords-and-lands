function share(text: string, url: string): Promise<boolean> {
  return new Promise(resolve => {
    if (navigator.share) {
      navigator.share({ text, url })
        .catch(() => resolve(false))
        .then(() => resolve(true))
    } else {
      resolve(false);
    }
  })
}

function copyToClipboard(text: string): Promise<boolean> {
  return new Promise(resolve => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text)
        .catch(() => resolve(false))
        .then(() => resolve(true))
    }
    else {
      resolve(false);
    }
  })
}

/**
 * Generates 4 characters of base 36 random id using Math.random().
 * @returns 
 */
function generateId() {
  return Math.random().toString(36).substring(2, 2 + 4);
}

function version(day: number, month: number, year: number) {
  const date = new Date(year, month - 1, day);
  return `version ${new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date)}`;
}

export const util = {
  share,
  copyToClipboard,

  generateId,
  version,
}