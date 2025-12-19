export interface StatisticData {
  totalTime: number
  byCategory: Record<string, number>
  byDay: Record<string, number>
}
