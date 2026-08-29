/**
 * Maps an order status string to a Badge variant.
 * Shared across DashboardPage and OrdersPage.
 *
 * @param {string} status - The order status (e.g. 'Pending', 'Confirmed', 'Out for Delivery', 'Delivered', 'Cancelled')
 * @returns {'success'|'error'|'warning'|'primary'|'neutral'|'info'} Badge variant
 */
export function getStatusBadgeVariant(status) {
  const s = String(status || '').toLowerCase().replace(/\s+/g, '');
  switch (s) {
    case 'delivered':
      return 'success';
    case 'pending':
      return 'warning';
    case 'confirmed':
    case 'accept':
    case 'accepted':
      return 'primary';
    case 'outfordelivery':
    case 'dispatched':
    case 'shipped':
    case 'processing':
      return 'info';
    case 'cancelled':
    case 'decline':
    case 'declined':
    case 'rejected':
      return 'error';
    default:
      return 'neutral';
  }
}

/**
 * Returns Google Material Icon name for the order status
 */
export function getStatusIcon(status) {
  const s = String(status || '').toLowerCase().replace(/\s+/g, '');
  switch (s) {
    case 'pending':
      return 'hourglass_top';
    case 'confirmed':
      return 'check_circle';
    case 'outfordelivery':
    case 'dispatched':
    case 'shipped':
      return 'local_shipping';
    case 'delivered':
      return 'task_alt';
    case 'cancelled':
      return 'cancel';
    default:
      return 'info';
  }
}

/**
 * Returns clean standard label for order status
 */
export function formatStatusLabel(status) {
  const s = String(status || '').toLowerCase().replace(/\s+/g, '');
  switch (s) {
    case '0':
    case 'pending':
      return 'Pending';
    case '1':
    case 'confirmed':
      return 'Confirmed';
    case '2':
    case 'outfordelivery':
    case 'dispatched':
    case 'shipped':
      return 'Out for Delivery';
    case '3':
    case 'delivered':
      return 'Delivered';
    case '4':
    case 'cancelled':
      return 'Cancelled';
    default:
      return String(status || 'Pending');
  }
}

