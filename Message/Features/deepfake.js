// File: Message/Features/deepfake.js
import { telegraph } from "../../Libs/Uploader.js";

export default {
	command: ["deepfake"],
	description: "Deepfake with image.",
	category: "Image",
	owner: false,
	admin: false,
	hidden: false,
	limit: false,
	group: false,
	private: false,

	execute: async function (m, { sock, api, usedPrefix, command, args }) {
		const q = m.quoted ? m.quoted : m;
		const mime = q.mtype || "";
		if (!/image/g.test(mime)) {
			return m.reply(`Reply or send image with caption *${usedPrefix + command}*`);
		}
		const style = args[0] || "wednesday";
		const media = await q.download();
		const buffer = Buffer.isBuffer(media) ? media : Buffer.from(media, "utf-8");
		const url = await telegraph(buffer);
		const { data } = await api.post("/deep_fake/video", {
			init_image: url,
			style,
		});
		const { status, message, result, styles } = data;

		if (!status) {
			if (styles && Array.isArray(styles)) {
				let extra_msg =
					"Available styles:\n\n" +
					styles.map((style, index) => `${index + 1}. ${style}`).join("\n");
				m.reply(extra_msg);
			} else {
				m.reply(message);
			}
			return;
		}
		await sock.sendMessage(m.chat, { video: { url: result.video } }, { quoted: m });
	},

	failed: "Failed to execute the %cmd command\n\n%error",
	wait: null,
	done: null,
};
