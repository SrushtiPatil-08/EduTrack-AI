export async function getOverview() {
  return { error: 'Analytics service not configured yet.', data: null };
}

export async function getAttendanceTrend(range = '30d') {
  return { error: 'Analytics service not configured yet.', data: null };
}

export default { getOverview, getAttendanceTrend };
