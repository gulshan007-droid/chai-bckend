import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "/upload");
  },
  filename: (req, file, cb) => {
    const destination = Date.now() + "-" + file.originalname;

    cb(null, "/upload");
  },
});

export const upload = multer({ storage });
