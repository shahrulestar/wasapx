import JSZip from "jszip";

/** Maximum allowed file size for uploads (5 GB) */
const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024;

/** Maximum total decompressed size from a ZIP to prevent zip bombs (10 GB) */
const MAX_DECOMPRESSED_SIZE = 10 * 1024 * 1024 * 1024;

/** Maximum number of files extracted from a ZIP */
const MAX_ZIP_ENTRIES = 50_000;

/** Format bytes into a human-readable string (e.g. "1.2 GB", "350 MB") */
function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export interface ChatMessage {
  sender: string;
  message: string;
  timestamp: Date;
  isSystem: boolean;
  attachment?: string; // filename of attached media
}

export interface ParsedChat {
  messages: ChatMessage[];
  participants: string[];
  self: string;
  media: Record<string, string>; // filename -> blob URL
}

// iOS format: [DD/MM/YYYY, HH:MM:SS] Sender: Message
// iOS format alt: [M/D/YY, HH:MM:SS AM/PM] Sender: Message
const IOS_REGEX =
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}:\d{2}(?:\s(?:AM|PM|am|pm))?)\]\s(.+?):\s([\s\S]*)$/;

// Android format: DD/MM/YYYY, HH:MM - Sender: Message
// Android format alt: M/D/YY, HH:MM AM/PM - Sender: Message
const ANDROID_REGEX =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?:\s(?:AM|PM|am|pm))?)\s-\s(.+?):\s([\s\S]*)$/;

// System message patterns (no sender)
const IOS_SYSTEM_REGEX =
  /^\[(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}:\d{2}(?:\s(?:AM|PM|am|pm))?)\]\s(.+)$/;
const ANDROID_SYSTEM_REGEX =
  /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2}(?:\s(?:AM|PM|am|pm))?)\s-\s(.+)$/;

function parseTimestamp(dateStr: string, timeStr: string): Date {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return new Date();

  let day: number, month: number, year: number;

  // Try to determine date format (DD/MM/YYYY vs M/D/YY)
  const first = parseInt(parts[0], 10);
  const second = parseInt(parts[1], 10);
  let yearPart = parseInt(parts[2], 10);

  // If year is 2 digits, expand
  if (yearPart < 100) yearPart += 2000;

  // Heuristic: if first > 12, it must be day (DD/MM format)
  // if second > 12, it must be day (MM/DD format)
  // otherwise default to DD/MM (more common internationally)
  if (first > 12) {
    day = first;
    month = second;
  } else if (second > 12) {
    month = first;
    day = second;
  } else {
    // Default to DD/MM (WhatsApp international standard)
    day = first;
    month = second;
  }

  year = yearPart;

  // Parse time
  const cleanTime = timeStr.trim();
  const isPM = /pm/i.test(cleanTime);
  const isAM = /am/i.test(cleanTime);
  const timeParts = cleanTime.replace(/\s?(AM|PM|am|pm)/, "").split(":");
  let hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);
  const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

  if (isPM && hours !== 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return new Date(year, month - 1, day, hours, minutes, seconds);
}

function isNewMessageLine(line: string): boolean {
  return (
    IOS_REGEX.test(line) ||
    ANDROID_REGEX.test(line) ||
    IOS_SYSTEM_REGEX.test(line) ||
    ANDROID_SYSTEM_REGEX.test(line)
  );
}

function parseLine(line: string): ChatMessage | null {
  // Try iOS format with sender
  let match = line.match(IOS_REGEX);
  if (match) {
    return {
      sender: match[3],
      message: match[4],
      timestamp: parseTimestamp(match[1], match[2]),
      isSystem: false,
    };
  }

  // Try Android format with sender
  match = line.match(ANDROID_REGEX);
  if (match) {
    return {
      sender: match[3],
      message: match[4],
      timestamp: parseTimestamp(match[1], match[2]),
      isSystem: false,
    };
  }

  // Try iOS system message
  match = line.match(IOS_SYSTEM_REGEX);
  if (match) {
    return {
      sender: "",
      message: match[3],
      timestamp: parseTimestamp(match[1], match[2]),
      isSystem: true,
    };
  }

  // Try Android system message
  match = line.match(ANDROID_SYSTEM_REGEX);
  if (match) {
    return {
      sender: "",
      message: match[3],
      timestamp: parseTimestamp(match[1], match[2]),
      isSystem: true,
    };
  }

  return null;
}

// Patterns for attached media in WhatsApp exports
// iOS: <attached: 00000012-PHOTO-2024-02-15.jpg>  (often prefixed with invisible U+200E)
// Android: IMG-20240215-WA0001.jpg (file attached) (often prefixed with invisible U+200E)
const ATTACHED_IOS_REGEX = /^<attached:\s*(.+?)>$/;
const ATTACHED_ANDROID_REGEX = /^(.+?)\s*\(file attached\)$/;

const MEDIA_EXTENSIONS = /\.(jpe?g|png|gif|webp|mp4|3gp|mov|avi|opus|ogg|mp3|m4a|aac|pdf)$/i;
export const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;
export const VIDEO_EXT = /\.(mp4|3gp|mov|avi)$/i;
export const AUDIO_EXT = /\.(opus|ogg|mp3|m4a|aac)$/i;

/** Strip invisible Unicode chars before matching attachment patterns */
function stripInvisibleChars(text: string): string {
  return text.replace(/[\u200E\u200F\u200B\u200C\u200D\u202A-\u202E\uFEFF\u00AD]/g, "").trim();
}

function extractAttachment(message: string): string | undefined {
  const trimmed = stripInvisibleChars(message);

  const iosMatch = trimmed.match(ATTACHED_IOS_REGEX);
  if (iosMatch) return stripInvisibleChars(iosMatch[1]);

  const androidMatch = trimmed.match(ATTACHED_ANDROID_REGEX);
  if (androidMatch) return stripInvisibleChars(androidMatch[1]);

  return undefined;
}

/**
 * Extract the other person's name from the WhatsApp export filename.
 * Filenames follow the pattern: "WhatsApp Chat with <Name>.txt"
 */
function extractOtherNameFromFilename(filename: string): string | null {
  const match = filename.match(/WhatsApp Chat with (.+)\.txt$/i);
  return match ? match[1].trim() : null;
}

/**
 * Determine "self" using multiple heuristics:
 * 1. Filename: "WhatsApp Chat with <OtherName>.txt" → self is the OTHER participant
 * 2. System messages containing "You" confirm the exporter → self is NOT the name
 *    mentioned in the filename, or for group chats we fall back to the participant
 *    who sent the most messages (exporters are typically more active)
 * 3. Fallback: participant with the most messages
 */
function detectSelf(
  messages: ChatMessage[],
  participants: string[],
  sourceFilename?: string
): string {
  if (participants.length === 0) return "";

  // 1. Try filename-based detection (most reliable for 1-on-1 chats)
  if (sourceFilename) {
    const otherName = extractOtherNameFromFilename(sourceFilename);
    if (otherName) {
      // For 1-on-1 chats: self is whichever participant does NOT match the filename
      if (participants.length === 2) {
        const selfCandidate = participants.find(
          (p) => p.toLowerCase() !== otherName.toLowerCase()
        );
        if (selfCandidate) return selfCandidate;
      }
      // For group chats: if one participant matches the filename contact,
      // at least we know that person is NOT self
      const nonOther = participants.filter(
        (p) => p.toLowerCase() !== otherName.toLowerCase()
      );
      if (nonOther.length > 0 && nonOther.length < participants.length) {
        // Pick the most frequent sender among non-other participants
        return getMostFrequentSender(messages, nonOther);
      }
    }
  }

  // 2. Fallback: pick the participant who sent the most messages
  //    (the exporter typically sent more messages in the conversation)
  return getMostFrequentSender(messages, participants);
}

function getMostFrequentSender(
  messages: ChatMessage[],
  candidates: string[]
): string {
  const counts: Record<string, number> = {};
  for (const c of candidates) counts[c] = 0;

  for (const m of messages) {
    if (!m.isSystem && counts[m.sender] !== undefined) {
      counts[m.sender]++;
    }
  }

  let best = candidates[0];
  let bestCount = counts[best] ?? 0;
  for (const c of candidates) {
    if ((counts[c] ?? 0) > bestCount) {
      best = c;
      bestCount = counts[c];
    }
  }
  return best;
}

export function parseChatText(text: string, sourceFilename?: string): ParsedChat {
  const lines = text.split("\n");
  const messages: ChatMessage[] = [];
  const participantSet = new Set<string>();

  let currentMessage: ChatMessage | null = null;

  for (const line of lines) {
    // Strip BOM, carriage return, and leading invisible Unicode chars (LTR mark, etc.)
    const cleanLine = line
      .replace(/^\uFEFF/, "")
      .replace(/\r$/, "")
      .replace(/^[\u200E\u200F\u200B\u200C\u200D\u202A-\u202E\uFEFF\u00AD]+/, "");

    if (isNewMessageLine(cleanLine)) {
      // Save previous message
      if (currentMessage) {
        currentMessage.attachment = extractAttachment(currentMessage.message);
        messages.push(currentMessage);
      }
      currentMessage = parseLine(cleanLine);
      if (currentMessage && !currentMessage.isSystem) {
        participantSet.add(currentMessage.sender);
      }
    } else if (currentMessage && cleanLine) {
      // Multi-line message continuation
      currentMessage.message += "\n" + cleanLine;
    }
  }

  // Push last message
  if (currentMessage) {
    currentMessage.attachment = extractAttachment(currentMessage.message);
    messages.push(currentMessage);
  }

  const participants = Array.from(participantSet);
  const self = detectSelf(messages, participants, sourceFilename);

  return {
    messages,
    participants,
    self,
    media: {},
  };
}

interface ZipExtractResult {
  text: string;
  media: Record<string, string>; // filename -> blob URL
  txtFilename: string; // name of the .txt inside the zip
}

const MIME_MAP: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  webp: "image/webp",
  mp4: "video/mp4",
  "3gp": "video/3gpp",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  opus: "audio/opus",
  ogg: "audio/ogg",
  mp3: "audio/mpeg",
  m4a: "audio/mp4",
  aac: "audio/aac",
  pdf: "application/pdf",
};

/** Sanitize a filename: strip path separators and traversal sequences */
function sanitizeFilename(name: string): string {
  // Remove any path traversal and get just the filename
  const basename = name.split("/").pop()?.split("\\").pop() ?? name;
  // Remove leading dots to prevent hidden file creation, and any remaining ..
  return basename.replace(/^\.+/, "").replace(/\.\./g, "");
}

/** Check if a ZIP entry path is safe (no path traversal) */
function isSafeZipPath(path: string): boolean {
  const normalized = path.replace(/\\/g, "/");
  if (normalized.startsWith("/") || normalized.startsWith("..")) return false;
  if (normalized.includes("/../") || normalized.endsWith("/..")) return false;
  return true;
}

export async function extractFromZip(file: File): Promise<ZipExtractResult> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large (${formatFileSize(file.size)}). Maximum allowed is ${formatFileSize(MAX_FILE_SIZE)}.`
    );
  }

  const zip = await JSZip.loadAsync(file);
  const txtFiles: string[] = [];
  const mediaFiles: string[] = [];
  let entryCount = 0;

  zip.forEach((relativePath, zipEntry) => {
    entryCount++;
    if (entryCount > MAX_ZIP_ENTRIES) return;
    if (zipEntry.dir || relativePath.startsWith("__MACOSX")) return;
    if (!isSafeZipPath(relativePath)) return; // skip path traversal attempts

    if (relativePath.endsWith(".txt")) {
      txtFiles.push(relativePath);
    } else if (MEDIA_EXTENSIONS.test(relativePath)) {
      mediaFiles.push(relativePath);
    }
  });

  if (entryCount > MAX_ZIP_ENTRIES) {
    throw new Error(
      `ZIP contains too many files (${entryCount}). Maximum allowed is ${MAX_ZIP_ENTRIES}.`
    );
  }

  if (txtFiles.length === 0) {
    throw new Error("No .txt file found in the ZIP archive.");
  }

  // Use the first .txt file (WhatsApp exports typically have one)
  const txtEntry = zip.file(txtFiles[0]);
  if (!txtEntry) {
    throw new Error("Failed to read the chat text file from the ZIP archive.");
  }
  const text = await txtEntry.async("string");

  // Track total decompressed size to prevent zip bombs
  let totalDecompressed = text.length;

  // Extract media as blob URLs
  const media: Record<string, string> = {};

  await Promise.all(
    mediaFiles.map(async (path) => {
      const entry = zip.file(path);
      if (!entry) return; // skip missing entries

      const data = await entry.async("blob");
      totalDecompressed += data.size;

      if (totalDecompressed > MAX_DECOMPRESSED_SIZE) {
        throw new Error(
          "ZIP decompressed content exceeds the safety limit. The file may be a zip bomb."
        );
      }

      const ext = path.split(".").pop()?.toLowerCase() ?? "jpeg";
      const blob = new Blob([data], {
        type: MIME_MAP[ext] ?? "application/octet-stream",
      });
      const url = URL.createObjectURL(blob);
      const filename = sanitizeFilename(path);
      if (filename) {
        media[filename] = url;
      }
    })
  );

  // Extract just the filename (no directory prefix)
  const txtFilename = sanitizeFilename(txtFiles[0]) || txtFiles[0];

  return { text, media, txtFilename };
}

export async function parseFile(file: File): Promise<ParsedChat> {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File too large (${formatFileSize(file.size)}). Maximum allowed is ${formatFileSize(MAX_FILE_SIZE)}.`
    );
  }

  if (
    file.name.endsWith(".zip") ||
    file.type === "application/zip" ||
    file.type === "application/x-zip-compressed"
  ) {
    const { text, media, txtFilename } = await extractFromZip(file);
    const parsed = parseChatText(text, txtFilename);
    parsed.media = media;
    return parsed;
  }

  const text = await file.text();
  return parseChatText(text, file.name);
}

/** Revoke all blob URLs in a parsed chat to free memory */
export function revokeMediaUrls(chat: ParsedChat): void {
  for (const url of Object.values(chat.media)) {
    try {
      URL.revokeObjectURL(url);
    } catch {
      // ignore revocation errors
    }
  }
}
