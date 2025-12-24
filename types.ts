
export type EventCategory = 'A' | 'B' | 'C';
export type EventKind = 'road' | 'trail';

export interface BaseEvent {
  id: number;
  province: string;
  name: string;
  time: string;
  organizer: string;
  category: EventCategory;
  kind: EventKind;
}

export interface MarathonEvent extends BaseEvent {
  eventType: string;
  kind: 'road';
}

export interface DistanceOption {
  distance: string;
  elevationGain?: string;
  itraPoints?: string;
  utmbIndex?: string;
  entryFee?: string;
  participantLimit?: string;
}

export interface TrailEvent extends BaseEvent {
  eventType: string;
  registrationPeriod: string;
  participantLimit: string;
  distanceOptions: DistanceOption[];
  kind: 'trail';
}

export type RaceEvent = MarathonEvent | TrailEvent;

export interface GroupedEvents {
  date: string;
  events: RaceEvent[];
}

export function isTrailEvent(event: RaceEvent): event is TrailEvent {
  return event.kind === 'trail';
}
