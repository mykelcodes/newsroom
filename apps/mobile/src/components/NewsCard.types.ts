import { Doc } from '@newsroom/backend/dataModel';

export type NewsCardProps = Doc<'headlines'> & { onPress?: () => void; hideCategory?: boolean };
