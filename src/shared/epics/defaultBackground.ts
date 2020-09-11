import { BackgroundEpic } from '../kit';
import { buildLoggingAuditor } from '../logging/loggingAuditor';

export const defaultBackground: BackgroundEpic[] = [buildLoggingAuditor(5000)];
