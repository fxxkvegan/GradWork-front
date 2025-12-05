const formatterOptions = Object.freeze({
	dateLabel: {
		month: "short",
		day: "numeric",
		weekday: "short",
	} satisfies Intl.DateTimeFormatOptions,
	time: {
		hour: "2-digit",
		minute: "2-digit",
	} satisfies Intl.DateTimeFormatOptions,
});

const buildFormatter = (options: Intl.DateTimeFormatOptions) =>
	new Intl.DateTimeFormat("ja-JP", options);

const dateLabelFormatter = buildFormatter(formatterOptions.dateLabel);
const timeFormatter = buildFormatter(formatterOptions.time);

const safeDate = (value?: string | null): Date | null => {
	if (!value) return null;
	const parsed = new Date(value);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatTime = (value?: string | null): string => {
	const date = safeDate(value);
	return date ? timeFormatter.format(date) : "";
};

export const formatDateLabel = (value?: string | null): string => {
	const date = safeDate(value);
	return date ? dateLabelFormatter.format(date) : "";
};

export const getDateKey = (value?: string | null): string => {
	const date = safeDate(value);
	return date ? date.toDateString() : "";
};

export const isSameDate = (a?: string | null, b?: string | null): boolean =>
	getDateKey(a) === getDateKey(b);

export const getInitial = (value?: string | null): string => {
	if (!value) return "?";
	const trimmed = value.trim();
	return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
};
