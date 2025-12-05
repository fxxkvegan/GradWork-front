import { Add, InsertEmoticon, Send } from "@mui/icons-material";
import type { ChangeEvent, FC, FormEvent, KeyboardEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { SendMessagePayload } from "../types";

interface MessageInputProps {
	disabled?: boolean;
	onSend: (payload: SendMessagePayload) => Promise<unknown>;
	restoredPayload?: SendMessagePayload | null;
}

const MessageInput: FC<MessageInputProps> = ({
	disabled,
	onSend,
	restoredPayload,
}) => {
	const [text, setText] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [isSending, setIsSending] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const canSend = useMemo(() => {
		return text.trim().length > 0 || files.length > 0;
	}, [text, files]);

	const previews = useMemo(
		() =>
			files.map((file, index) => ({
				key: `${file.name}-${index}-${file.lastModified}`,
				url: URL.createObjectURL(file),
			})),
		[files],
	);

	useEffect(() => {
		return () => {
			previews.forEach((preview) => URL.revokeObjectURL(preview.url));
		};
	}, [previews]);

	useEffect(() => {
		if (!restoredPayload) {
			return;
		}
		setText(restoredPayload.body ?? "");
		setFiles(restoredPayload.files ?? []);
	}, [restoredPayload]);

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		if (!event.target.files) {
			return;
		}
		setFiles(Array.from(event.target.files));
	};

	const handleRemoveFile = (index: number) => {
		setFiles((prev) => prev.filter((_, idx) => idx !== index));
	};

	const submitMessage = async () => {
		if (!canSend || disabled || isSending) {
			return;
		}

		setIsSending(true);
		setError(null);
		try {
			await onSend({ body: text.trim() || undefined, files });
			setText("");
			setFiles([]);
		} catch (err) {
			const message = err instanceof Error ? err.message : "送信に失敗しました";
			setError(message);
		} finally {
			setIsSending(false);
		}
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		await submitMessage();
	};

	const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			submitMessage().catch(() => {
				// エラーは submitMessage 内で処理
			});
		}
	};

	return (
		<form className="dm-input-area" onSubmit={handleSubmit}>
			<label
				className="dm-input-button"
				aria-label="ファイルを追加"
				aria-disabled={disabled || isSending}
			>
				<Add className="dm-icon" />
				<input
					type="file"
					accept="image/*"
					multiple
					onChange={(event) => {
						handleFileChange(event);
						event.target.value = "";
					}}
					disabled={disabled || isSending}
					hidden
				/>
			</label>
			<div className="dm-input-wrapper">
				<textarea
					className="dm-textarea"
					placeholder="メッセージを入力"
					value={text}
					onChange={(event) => setText(event.target.value)}
					onKeyDown={handleTextareaKeyDown}
					disabled={disabled || isSending}
					rows={1}
				/>
			</div>
			<button
				type="button"
				className="dm-input-button"
				disabled={disabled || isSending}
			>
				<InsertEmoticon className="dm-icon" />
			</button>
			<button
				type="submit"
				className="dm-input-button send"
				disabled={disabled || !canSend || isSending}
			>
				{isSending ? "..." : <Send className="dm-icon" />}
			</button>

			{previews.length > 0 && (
				<div className="dm-input-attachments">
					{previews.map((preview, index) => (
						<div key={preview.key} className="dm-input-attachment">
							<img src={preview.url} alt={`preview-${index}`} />
							<button type="button" onClick={() => handleRemoveFile(index)}>
								✕
							</button>
						</div>
					))}
				</div>
			)}

			{error && <p className="dm-input-error">{error}</p>}
		</form>
	);
};

export default MessageInput;
