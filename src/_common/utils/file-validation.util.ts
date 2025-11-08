export function imageFileFilter(req, file, cb) {
  if (!file.mimetype.match(/^image\/(jpeg|png|jpg|webp)$/)) {
    return cb(new Error('Yalnız şəkil faylları qəbul olunur!'), false);
  }
  cb(null, true);
}

export function pdfFileFilter(req, file, cb) {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Yalnız PDF faylları qəbul olunur!'), false);
  }
  cb(null, true);
}

export function videoFileFilter(req, file, cb) {
  if (!file.mimetype.match(/^video\/(mp4|webm|avi|mkv)$/)) {
    return cb(new Error('Yalnız video faylları qəbul olunur!'), false);
  }
  cb(null, true);
}

export const imageMaxSize = 5 * 1024 * 1024; // 5MB
export const pdfMaxSize = 10 * 1024 * 1024; // 10MB 
export const videoMaxSize = 50 * 1024 * 1024; // 50MB
