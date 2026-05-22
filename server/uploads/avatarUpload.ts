import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
	destination: function (
		req: Express.Request,
		file: Express.Multer.File,
		cb: (error: Error | null, destination: string) => void
	) {
		const uploadPath = path.join(__dirname, "..", "uploads", "avatars");
		fs.mkdirSync(uploadPath, { recursive: true });
		cb(null, uploadPath);
	},
	filename: function (
		req: Express.Request,
		file: Express.Multer.File,
		cb: (error: Error | null, filename: string) => void
	) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname);
		cb(null, file.fieldname + "-" + uniqueSuffix + ext);
	},
});

const avatarUpload = multer({
	storage,
	limits: { fileSize: 1024 * 1024 * 2 },
	fileFilter: (
		req: Express.Request,
		file: Express.Multer.File,
		cb: multer.FileFilterCallback
	) => {
		const allowedMimeTypes = [
			"image/jpeg",
			"image/png",
			"image/gif",
			"image/webp",
		];

		if (allowedMimeTypes.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				new Error(
					"Только изображения (jpeg, png, gif, webp) разрешены!"
				)
			);
		}
	},
});

export default avatarUpload;
