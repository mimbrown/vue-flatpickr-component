// Events to emit, copied from flatpickr source
export const includedEvents = [
  'onChange',
  'onClose',
  'onDestroy',
  'onMonthChange',
  'onOpen',
  'onYearChange',
] as const;

// Let's not emit these events by default
export const excludedEvents = [
  'onValueUpdate',
  'onDayCreate',
  'onParseConfig',
  'onReady',
  'onPreCalendarPosition',
  'onKeyDown',
] as const;
