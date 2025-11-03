import { format, formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatDate = (date: string | Date, formatStr = 'dd MMM yyyy') => {
  return format(new Date(date), formatStr, { locale: id });
};

export const formatDateDistance = (date: string | Date) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id });
};
