/**
 * Calculates the slope of a linear regression line for a set of data points.
 * Uses the least squares method to find the best fit line.
 *
 * The function assumes that the x-values are the indices of the array (0, 1, 2, ..., n-1)
 * and the y-values are the values in the array.
 *
 * @param data - An array of numerical values representing the y-coordinates
 * @returns The slope of the linear regression line, which indicates the rate of change
 * @example
 * // If data = [10, 20, 30, 40], this indicates points (0,10), (1,20), (2,30), (3,40)
 * const slope = calculateLinearRegression([10, 20, 30, 40]); // Returns 10
 */
export function calculateLinearRegression(data: number[]): number {
  const n = data.length;
  const sum_x = data.reduce((sum, _, i) => sum + i, 0);
  const sum_y = data.reduce((sum, val) => sum + val, 0);
  const sum_xy = data.reduce((sum, val, i) => sum + i * val, 0);
  const sum_x_square = data.reduce((sum, _, i) => sum + i * i, 0);

  const slope =
    (n * sum_xy - sum_x * sum_y) / (n * sum_x_square - sum_x * sum_x);
  return slope;
}
/**
 * Calculates the trend of accuracy data over time.
 *
 * @param accuracy_data - An array of objects containing daily accuracy measurements
 * @returns The calculated accuracy trend as a percentage, rounded to 2 decimal places
 *
 * @remarks
 * - Returns 0 if there are less than 2 data points
 * - Uses linear regression to determine the trend direction and magnitude
 * - A positive value indicates an improving trend, negative indicates declining
 *
 * @example
 * ```typescript
 * const accuracyData = [
 *   { daily_accuracy: 0.75, date: '2023-01-01' },
 *   { daily_accuracy: 0.80, date: '2023-01-02' }
 * ];
 * const trend = calculateAccuracyTrend(accuracyData); // 5.00
 * ```
 */
export function calculateAccuracyTrend(accuracy_data: any[]): number {
  if (accuracy_data.length < 2) return 0;

  const trend = accuracy_data.map((entry) => entry.daily_accuracy);
  const linear_regression = calculateLinearRegression(trend);

  return Number((linear_regression * 100).toFixed(2));
}
