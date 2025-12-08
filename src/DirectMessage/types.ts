export interface DMParticipant {
	id: number;
	name: string;
	displayName?: string | null;
	avatarUrl?: string | null;
}

export interface DMAttachment {
	id: number;
	url: string;
	mime?: string | null;
	size: number;
}

export interface DMMessage {
	id: number;
	conversationId: number;
	body?: string | null;
	hasAttachments: boolean;
	attachments: DMAttachment[];
	sender: DMParticipant | null;
	readAt?: string | null;
	createdAt?: string | null;
	isDeleted?: boolean;
	deletedAt?: string | null;
	editedAt?: string | null;
	isPending?: boolean;
	pendingExpiresAt?: string | null;
}

export interface DMConversation {
	id: number;
	type: "direct" | "group";
	title?: string | null;
	displayName?: string | null;
	participants: DMParticipant[];
	lastMessage?: DMMessage | null;
	updatedAt?: string | null;
	createdAt?: string | null;
	unreadCount?: number;
}

export interface DMMessagePage {
	items: DMMessage[];
	total: number;
	currentPage: number;
	lastPage: number;
	perPage: number;
	nextPageUrl?: string | null;
	prevPageUrl?: string | null;
}

export interface CreateConversationPayload {
	participantIds: number[];
	type?: "direct" | "group";
	title?: string;
}

export interface SendMessagePayload {
	body?: string;
	files: File[];
}
