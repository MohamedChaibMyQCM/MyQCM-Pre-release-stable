export enum NotificationStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
  CLICKED = "clicked",
  SEEN = "seen",
}

export enum NotificationUpdatableStatus {
  SENT = NotificationStatus.SENT,
  CLICKED = NotificationStatus.CLICKED,
  SEEN = NotificationStatus.SEEN,
}
