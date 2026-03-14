interface StatusBadgeProps {
  status: string;
}

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'badge-draft' },
  waiting: { label: 'Waiting', className: 'badge-waiting' },
  confirmed: { label: 'Confirmed', className: 'badge-confirmed' },
  pick: { label: 'Pick', className: 'badge-pick' },
  pack: { label: 'Pack', className: 'badge-pack' },
  ready: { label: 'Ready', className: 'badge-ready' },
  done: { label: 'Done', className: 'badge-done' },
  canceled: { label: 'Canceled', className: 'badge-canceled' },
  'in-stock': { label: 'In Stock', className: 'badge-in-stock' },
  'low-stock': { label: 'Low Stock', className: 'badge-low-stock' },
  'out-of-stock': { label: 'Out of Stock', className: 'badge-out-of-stock' },
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = STATUS_MAP[status?.toLowerCase()] || { label: status, className: 'badge-draft' };
  return <span className={config.className}>{config.label}</span>;
};

export default StatusBadge;
