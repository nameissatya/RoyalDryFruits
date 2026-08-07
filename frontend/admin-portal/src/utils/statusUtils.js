/**
 * Maps an order status string to a Badge variant.
 * Shared across DashboardPage and OrdersPage.
 *
 * @param {string} status - The order status (e.g. 'Pending', 'Delivered')
 * @returns {'success'|'error'|'warning'|'primary'|'neutral'} Badge variant
 */
export function getStatusBadgeVariant(status) {
  switch (status) {
    case 'Delivered':
      return 'success';
    case 'Pending':
    case 'Cancelled':
      return 'error';
    case 'Processing':
      return 'warning';
    case 'Confirmed':
      return 'primary';
    default:
      return 'neutral';
  }
}
