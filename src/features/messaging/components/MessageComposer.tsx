import { useEffect, useRef } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Image as ImageIcon, Mic, Paperclip, Send, X } from 'lucide-react';
import { useSendMessage } from '../hooks/useSendMessage';
import { useSendAttachmentMessage } from '../hooks/useSendAttachmentMessage';
import { useEditMessage } from '../hooks/useEditMessage';
import { useTypingBroadcast } from '../hooks/useTypingBroadcast';
import { useRecordingBroadcast } from '../hooks/useRecordingBroadcast';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { useMessagingUiStore } from '../messagingUiStore';
import type { MessageType } from '../types';
import { EmojiPickerButton } from './EmojiPickerButton';
import { VoiceRecorderBar } from './VoiceRecorderBar';
import styles from './MessageThread.module.css';

interface MessageComposerProps {
  conversationId: number;
}

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const { t } = useTranslation('messaging');
  const draft = useMessagingUiStore((state) => state.drafts[conversationId] ?? '');
  const setDraft = useMessagingUiStore((state) => state.setDraft);
  const replyTarget = useMessagingUiStore((state) => state.replyTargetByConversation[conversationId] ?? null);
  const setReplyTarget = useMessagingUiStore((state) => state.setReplyTarget);
  const editTarget = useMessagingUiStore((state) => state.editTargetByConversation[conversationId] ?? null);
  const setEditTarget = useMessagingUiStore((state) => state.setEditTarget);

  const sendMessage = useSendMessage(conversationId);
  const sendAttachment = useSendAttachmentMessage(conversationId);
  const editMessage = useEditMessage();
  const { notifyTyping, stopTyping } = useTypingBroadcast(conversationId);
  const { notifyRecordingStart, notifyRecordingStop } = useRecordingBroadcast(conversationId);
  const voiceRecorder = useVoiceRecorder();

  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editTarget) {
      setDraft(conversationId, editTarget.body);
    }
  }, [editTarget?.messageId]);

  const handleCancelEdit = () => {
    setEditTarget(conversationId, null);
    setDraft(conversationId, '');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;

    if (editTarget) {
      if (editMessage.isPending) return;
      editMessage.mutate({ messageId: editTarget.messageId, body: trimmed });
      setDraft(conversationId, '');
      setEditTarget(conversationId, null);
      return;
    }

    if (sendMessage.isPending) return;
    setDraft(conversationId, '');
    stopTyping();
    sendMessage.mutate({ body: trimmed, replyToMessageId: replyTarget?.messageId, clientId: crypto.randomUUID() });
    setReplyTarget(conversationId, null);
  };

  const handleFileSelected = (type: MessageType) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const previewUrl = type === 'image' ? URL.createObjectURL(file) : undefined;
    sendAttachment.mutate({
      type,
      file,
      filename: file.name,
      previewUrl,
      sizeBytes: file.size,
      clientId: crypto.randomUUID(),
    });
  };

  const handleMicClick = async () => {
    if (voiceRecorder.status === 'recording') return;
    await voiceRecorder.start();
    notifyRecordingStart();
  };

  const handleCancelRecording = () => {
    voiceRecorder.cancel();
    notifyRecordingStop();
  };

  const handleSendRecording = async () => {
    const recorded = await voiceRecorder.stop();
    notifyRecordingStop();
    if (!recorded) return;

    const extension = recorded.mimeType.includes('mp4') ? 'm4a' : recorded.mimeType.includes('ogg') ? 'ogg' : 'webm';
    const previewUrl = URL.createObjectURL(recorded.blob);
    sendAttachment.mutate({
      type: 'voice',
      file: recorded.blob,
      filename: `voice-message.${extension}`,
      previewUrl,
      durationSeconds: recorded.durationSeconds,
      sizeBytes: recorded.blob.size,
      clientId: crypto.randomUUID(),
    });
  };

  if (voiceRecorder.status === 'recording') {
    return (
      <VoiceRecorderBar
        elapsedSeconds={voiceRecorder.elapsedSeconds}
        onCancel={handleCancelRecording}
        onSend={handleSendRecording}
      />
    );
  }

  return (
    <div>
      {(voiceRecorder.status === 'unsupported' || voiceRecorder.status === 'permission-denied') && (
        <p className={styles.recorderError}>
          {t(voiceRecorder.status === 'unsupported' ? 'MessageThread.voiceUnsupported' : 'MessageThread.micPermissionDenied')}
        </p>
      )}
      {replyTarget && (
        <div className={styles.replyPreview}>
          <div className={styles.replyPreviewBar} />
          <div className={styles.replyPreviewContent}>
            <span className={styles.replyPreviewName}>{replyTarget.senderName}</span>
            <span className={styles.replyPreviewText}>{replyTarget.preview}</span>
          </div>
          <button
            type="button"
            className={styles.replyPreviewClose}
            onClick={() => setReplyTarget(conversationId, null)}
            aria-label={t('MessageThread.cancelReply')}
          >
            <X size={16} />
          </button>
        </div>
      )}
      {editTarget && (
        <div className={styles.replyPreview}>
          <div className={styles.replyPreviewBar} />
          <div className={styles.replyPreviewContent}>
            <span className={styles.replyPreviewName}>{t('MessageThread.editingMessage')}</span>
          </div>
          <button
            type="button"
            className={styles.replyPreviewClose}
            onClick={handleCancelEdit}
            aria-label={t('MessageThread.cancelEdit')}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <form className={styles.composer} onSubmit={handleSubmit}>
        <EmojiPickerButton onSelect={(emoji) => setDraft(conversationId, draft + emoji)} />
        <button
          type="button"
          className={styles.composerIconButton}
          onClick={() => imageInputRef.current?.click()}
          aria-label={t('MessageThread.attachImage')}
        >
          <ImageIcon size={20} />
        </button>
        <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={handleFileSelected('image')} />
        <button
          type="button"
          className={styles.composerIconButton}
          onClick={() => fileInputRef.current?.click()}
          aria-label={t('MessageThread.attachFile')}
        >
          <Paperclip size={20} />
        </button>
        <input ref={fileInputRef} type="file" hidden onChange={handleFileSelected('file')} />
        <input
          type="text"
          className={styles.input}
          placeholder={t('MessageThread.placeholder')}
          value={draft}
          onChange={(event) => {
            setDraft(conversationId, event.target.value);
            if (event.target.value.trim()) notifyTyping();
            else stopTyping();
          }}
          aria-label={t('MessageThread.placeholder')}
        />
        {draft.trim() ? (
          <button
            type="submit"
            className={styles.sendButton}
            disabled={editTarget ? editMessage.isPending : sendMessage.isPending}
            aria-label={editTarget ? t('MessageThread.save') : t('MessageThread.send')}
          >
            {editTarget ? <Check size={16} /> : <Send size={16} />}
          </button>
        ) : (
          <button
            type="button"
            className={styles.sendButton}
            onClick={handleMicClick}
            aria-label={t('MessageThread.recordVoice')}
          >
            <Mic size={16} />
          </button>
        )}
      </form>
    </div>
  );
}
