'use client';

import { use } from 'react';
import VoiceChat from '../../../../../../pages/VoiceChat';

export default function VoiceChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <VoiceChat id={id} />;
}

